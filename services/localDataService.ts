import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Category, Expense, Income, Transfer, AnyTransactionFormData } from '../types';
import { INITIAL_GUEST_EXPENSE_CATEGORIES, INITIAL_GUEST_INCOME_CATEGORIES } from '../constants';

const DB_NAME = 'ledgerly_local';
const DB_VERSION = 1;

// In-memory / IndexedDB Web Storage Fallback for Browser/Dev environments
const WEB_STORAGE_KEY_TXS = 'ledgerly_local_transactions';
const WEB_STORAGE_KEY_EXP_CATS = 'ledgerly_local_expense_categories';
const WEB_STORAGE_KEY_INC_CATS = 'ledgerly_local_income_categories';
const WEB_STORAGE_KEY_BUDGETS = 'ledgerly_local_budgets';
const WEB_STORAGE_KEY_USERS = 'ledgerly_local_users';
const WEB_STORAGE_KEY_SETTINGS = 'ledgerly_local_settings';

class LocalDataService {
  private sqlite: SQLiteConnection | null = null;
  private db: SQLiteDBConnection | null = null;
  private isInitialized = false;
  private isNative = false;

  async initDatabase(): Promise<void> {
    if (this.isInitialized) return;

    this.isNative = Capacitor.isNativePlatform();

    if (this.isNative) {
      try {
        this.sqlite = new SQLiteConnection(CapacitorSQLite);
        const isConn = (await this.sqlite.isConnection(DB_NAME, false)).result;
        
        if (isConn) {
          this.db = await this.sqlite.retrieveConnection(DB_NAME, false);
        } else {
          this.db = await this.sqlite.createConnection(
            DB_NAME,
            false,
            'no-encryption',
            DB_VERSION,
            false
          );
        }

        await this.db.open();
        await this.runMigrations(this.db);
        await this.seedInitialCategories(this.db);
        this.isInitialized = true;
        console.log('Local SQLite database successfully initialized on device.');
      } catch (error) {
        console.error('Failed to initialize native SQLite, falling back to Web storage:', error);
        this.initWebStorage();
      }
    } else {
      this.initWebStorage();
    }
  }

  private async runMigrations(db: SQLiteDBConnection): Promise<void> {
    const schema = `
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT,
        photo TEXT,
        created_at TEXT,
        updated_at TEXT
      );

      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        type TEXT NOT NULL,
        icon TEXT,
        created_at TEXT,
        updated_at TEXT
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        category TEXT,
        date TEXT NOT NULL,
        notes TEXT,
        vendor TEXT,
        source TEXT,
        fromAccount TEXT,
        toAccount TEXT,
        receiptUrl TEXT,
        created_at TEXT,
        updated_at TEXT
      );

      CREATE TABLE IF NOT EXISTS budgets (
        id TEXT PRIMARY KEY,
        category_id TEXT,
        amount REAL NOT NULL,
        period TEXT DEFAULT 'monthly',
        start_date TEXT,
        end_date TEXT,
        created_at TEXT,
        updated_at TEXT
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at TEXT
      );
    `;

    await db.execute(schema);
  }

  private async seedInitialCategories(db: SQLiteDBConnection): Promise<void> {
    const res = await db.query('SELECT COUNT(*) as count FROM categories');
    const count = res.values && res.values[0] ? res.values[0].count : 0;

    if (count === 0) {
      const now = new Date().toISOString();
      for (const cat of INITIAL_GUEST_EXPENSE_CATEGORIES) {
        const id = `exp_cat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        await db.run(
          'INSERT OR IGNORE INTO categories (id, name, type, icon, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
          [id, cat.name, 'expense', cat.icon, now, now]
        );
      }
      for (const cat of INITIAL_GUEST_INCOME_CATEGORIES) {
        const id = `inc_cat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        await db.run(
          'INSERT OR IGNORE INTO categories (id, name, type, icon, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
          [id, cat.name, 'income', cat.icon, now, now]
        );
      }
    }
  }

  private initWebStorage(): void {
    if (!localStorage.getItem(WEB_STORAGE_KEY_EXP_CATS)) {
      localStorage.setItem(WEB_STORAGE_KEY_EXP_CATS, JSON.stringify(INITIAL_GUEST_EXPENSE_CATEGORIES));
    }
    if (!localStorage.getItem(WEB_STORAGE_KEY_INC_CATS)) {
      localStorage.setItem(WEB_STORAGE_KEY_INC_CATS, JSON.stringify(INITIAL_GUEST_INCOME_CATEGORIES));
    }
    if (!localStorage.getItem(WEB_STORAGE_KEY_TXS)) {
      localStorage.setItem(WEB_STORAGE_KEY_TXS, JSON.stringify([]));
    }
    this.isInitialized = true;
    console.log('Local Web Storage layer initialized.');
  }

  // --- TRANSACTIONS CRUD ---

  async getTransactions(): Promise<any[]> {
    await this.initDatabase();

    if (this.isNative && this.db) {
      const res = await this.db.query(
        'SELECT * FROM transactions ORDER BY date DESC, created_at DESC'
      );
      return (res.values || []).map(row => ({
        id: row.id,
        transactionType: row.type,
        amount: Number(row.amount),
        category: row.category,
        date: row.date,
        notes: row.notes,
        vendor: row.vendor,
        source: row.source,
        fromAccount: row.fromAccount,
        toAccount: row.toAccount,
        receiptUrl: row.receiptUrl
      }));
    } else {
      const data = localStorage.getItem(WEB_STORAGE_KEY_TXS);
      return data ? JSON.parse(data) : [];
    }
  }

  async addTransaction(item: AnyTransactionFormData & { transactionType?: 'expense' | 'income' | 'transfer' }): Promise<any> {
    await this.initDatabase();

    const amount = typeof item.amount === 'string' ? parseFloat(item.amount) : Number(item.amount);
    if (isNaN(amount) || amount <= 0) {
      throw new Error('Invalid transaction amount.');
    }

    const type = item.transactionType || ((item as any).vendor ? 'expense' : (item as any).source ? 'income' : 'expense');
    const date = item.date || new Date().toISOString().split('T')[0];
    const id = item.id || `tx_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const now = new Date().toISOString();

    const formattedTx = {
      id,
      transactionType: type,
      amount,
      category: item.category || 'General',
      date,
      notes: item.notes || '',
      vendor: (item as any).vendor || null,
      source: (item as any).source || null,
      fromAccount: (item as any).fromAccount || null,
      toAccount: (item as any).toAccount || null,
      receiptUrl: (item as any).receiptUrl || null,
    };

    if (this.isNative && this.db) {
      const sql = `INSERT INTO transactions 
        (id, type, amount, category, date, notes, vendor, source, fromAccount, toAccount, receiptUrl, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      
      const params = [
        id,
        type,
        amount,
        formattedTx.category,
        date,
        formattedTx.notes,
        formattedTx.vendor,
        formattedTx.source,
        formattedTx.fromAccount,
        formattedTx.toAccount,
        formattedTx.receiptUrl,
        now,
        now
      ];

      await this.db.run(sql, params);
      return formattedTx;
    } else {
      const txs = await this.getTransactions();
      const updated = [formattedTx, ...txs];
      localStorage.setItem(WEB_STORAGE_KEY_TXS, JSON.stringify(updated));
      return formattedTx;
    }
  }

  async updateTransaction(id: string | number, item: any): Promise<any> {
    await this.initDatabase();
    const strId = String(id);
    const now = new Date().toISOString();
    const amount = item.amount !== undefined ? Number(item.amount) : undefined;

    if (this.isNative && this.db) {
      const sql = `UPDATE transactions SET 
        amount = COALESCE(?, amount), 
        category = COALESCE(?, category), 
        date = COALESCE(?, date), 
        notes = COALESCE(?, notes), 
        vendor = COALESCE(?, vendor),
        source = COALESCE(?, source),
        fromAccount = COALESCE(?, fromAccount),
        toAccount = COALESCE(?, toAccount),
        receiptUrl = COALESCE(?, receiptUrl),
        updated_at = ?
        WHERE id = ?`;

      const params = [
        amount !== undefined ? amount : null,
        item.category || null,
        item.date || null,
        item.notes || null,
        item.vendor || null,
        item.source || null,
        item.fromAccount || null,
        item.toAccount || null,
        item.receiptUrl || null,
        now,
        strId
      ];

      await this.db.run(sql, params);
      return { id: strId, ...item };
    } else {
      const txs = await this.getTransactions();
      const updated = txs.map(t => t.id === strId ? { ...t, ...item, id: strId } : t);
      localStorage.setItem(WEB_STORAGE_KEY_TXS, JSON.stringify(updated));
      return { id: strId, ...item };
    }
  }

  async deleteTransaction(id: string | number): Promise<void> {
    await this.initDatabase();
    const strId = String(id);

    if (this.isNative && this.db) {
      await this.db.run('DELETE FROM transactions WHERE id = ?', [strId]);
    } else {
      const txs = await this.getTransactions();
      const filtered = txs.filter(t => t.id !== strId);
      localStorage.setItem(WEB_STORAGE_KEY_TXS, JSON.stringify(filtered));
    }
  }

  // --- CATEGORIES CRUD ---

  async getExpenseCategories(): Promise<Category[]> {
    await this.initDatabase();

    if (this.isNative && this.db) {
      const res = await this.db.query('SELECT name, icon FROM categories WHERE type = ? ORDER BY name ASC', ['expense']);
      return (res.values || []).map(r => ({ name: r.name, icon: r.icon }));
    } else {
      const data = localStorage.getItem(WEB_STORAGE_KEY_EXP_CATS);
      return data ? JSON.parse(data) : INITIAL_GUEST_EXPENSE_CATEGORIES;
    }
  }

  async addExpenseCategory(name: string, icon: string): Promise<Category> {
    await this.initDatabase();
    const trimmedName = name.trim();
    const cleanIcon = icon || '🏷️';
    const now = new Date().toISOString();
    const id = `exp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    if (this.isNative && this.db) {
      await this.db.run(
        'INSERT OR IGNORE INTO categories (id, name, type, icon, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        [id, trimmedName, 'expense', cleanIcon, now, now]
      );
    } else {
      const cats = await this.getExpenseCategories();
      if (!cats.some(c => c.name.toLowerCase() === trimmedName.toLowerCase())) {
        cats.push({ name: trimmedName, icon: cleanIcon });
        localStorage.setItem(WEB_STORAGE_KEY_EXP_CATS, JSON.stringify(cats));
      }
    }
    return { name: trimmedName, icon: cleanIcon };
  }

  async deleteExpenseCategory(name: string): Promise<void> {
    await this.initDatabase();

    if (this.isNative && this.db) {
      await this.db.run('DELETE FROM categories WHERE name = ? AND type = ?', [name, 'expense']);
    } else {
      const cats = await this.getExpenseCategories();
      const filtered = cats.filter(c => c.name !== name);
      localStorage.setItem(WEB_STORAGE_KEY_EXP_CATS, JSON.stringify(filtered));
    }
  }

  async getIncomeCategories(): Promise<Category[]> {
    await this.initDatabase();

    if (this.isNative && this.db) {
      const res = await this.db.query('SELECT name, icon FROM categories WHERE type = ? ORDER BY name ASC', ['income']);
      return (res.values || []).map(r => ({ name: r.name, icon: r.icon }));
    } else {
      const data = localStorage.getItem(WEB_STORAGE_KEY_INC_CATS);
      return data ? JSON.parse(data) : INITIAL_GUEST_INCOME_CATEGORIES;
    }
  }

  async addIncomeCategory(name: string, icon: string): Promise<Category> {
    await this.initDatabase();
    const trimmedName = name.trim();
    const cleanIcon = icon || '🏷️';
    const now = new Date().toISOString();
    const id = `inc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    if (this.isNative && this.db) {
      await this.db.run(
        'INSERT OR IGNORE INTO categories (id, name, type, icon, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        [id, trimmedName, 'income', cleanIcon, now, now]
      );
    } else {
      const cats = await this.getIncomeCategories();
      if (!cats.some(c => c.name.toLowerCase() === trimmedName.toLowerCase())) {
        cats.push({ name: trimmedName, icon: cleanIcon });
        localStorage.setItem(WEB_STORAGE_KEY_INC_CATS, JSON.stringify(cats));
      }
    }
    return { name: trimmedName, icon: cleanIcon };
  }

  async deleteIncomeCategory(name: string): Promise<void> {
    await this.initDatabase();

    if (this.isNative && this.db) {
      await this.db.run('DELETE FROM categories WHERE name = ? AND type = ?', [name, 'income']);
    } else {
      const cats = await this.getIncomeCategories();
      const filtered = cats.filter(c => c.name !== name);
      localStorage.setItem(WEB_STORAGE_KEY_INC_CATS, JSON.stringify(filtered));
    }
  }

  // --- USER PROFILE PERSISTENCE ---

  async saveUserProfile(id: string, name: string, email: string, photo?: string): Promise<void> {
    await this.initDatabase();
    const now = new Date().toISOString();

    if (this.isNative && this.db) {
      await this.db.run(
        `INSERT INTO users (id, name, email, photo, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET name = excluded.name, email = excluded.email, photo = excluded.photo, updated_at = excluded.updated_at`,
        [id, name, email, photo || null, now, now]
      );
    } else {
      const profiles = JSON.parse(localStorage.getItem(WEB_STORAGE_KEY_USERS) || '{}');
      profiles[id] = { id, name, email, photo, updated_at: now };
      localStorage.setItem(WEB_STORAGE_KEY_USERS, JSON.stringify(profiles));
    }
  }

  async getUserProfile(id: string): Promise<any | null> {
    await this.initDatabase();

    if (this.isNative && this.db) {
      const res = await this.db.query('SELECT * FROM users WHERE id = ?', [id]);
      return res.values && res.values[0] ? res.values[0] : null;
    } else {
      const profiles = JSON.parse(localStorage.getItem(WEB_STORAGE_KEY_USERS) || '{}');
      return profiles[id] || null;
    }
  }

  // --- BACKUP & EXPORT ---

  async exportAllData(): Promise<string> {
    await this.initDatabase();
    const transactions = await this.getTransactions();
    const expenseCategories = await this.getExpenseCategories();
    const incomeCategories = await this.getIncomeCategories();

    const backup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      appName: 'Ledgerly',
      data: {
        transactions,
        expenseCategories,
        incomeCategories
      }
    };

    return JSON.stringify(backup, null, 2);
  }

  async importAllData(jsonString: string): Promise<boolean> {
    try {
      const backup = JSON.parse(jsonString);
      if (!backup || !backup.data) return false;

      const { transactions, expenseCategories, incomeCategories } = backup.data;

      if (Array.isArray(transactions)) {
        for (const tx of transactions) {
          await this.addTransaction(tx);
        }
      }
      if (Array.isArray(expenseCategories)) {
        for (const cat of expenseCategories) {
          await this.addExpenseCategory(cat.name, cat.icon);
        }
      }
      if (Array.isArray(incomeCategories)) {
        for (const cat of incomeCategories) {
          await this.addIncomeCategory(cat.name, cat.icon);
        }
      }
      return true;
    } catch (e) {
      console.error('Failed to import backup data:', e);
      return false;
    }
  }
}

export const localDataService = new LocalDataService();
