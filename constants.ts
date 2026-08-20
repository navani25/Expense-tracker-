import type { Bank, BudgetData, Category } from './types';
import { localDataService } from './services/localDataService';

// Environment-based API URL configuration with safe fallback for backend AI proxy
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000/api';

const AUTH_TOKEN_KEY = 'ledgerly_auth_token';

export const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch (e) {
    return null;
  }
};

export const setAuthToken = (token: string): void => {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch (e) {
    console.error("Failed to persist auth token:", e);
  }
};

export const clearAuthToken = (): void => {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch (e) {
    console.error("Failed to clear auth token:", e);
  }
};

const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const INITIAL_GUEST_EXPENSE_CATEGORIES: Category[] = [
  { name: "Accommodation", icon: "🛏️" }, { name: "Entertainment", icon: "🎤" },
  { name: "Groceries", icon: "🛒" }, { name: "Healthcare", icon: "🦷" },
  { name: "Insurance", icon: "🧯" }, { name: "Rent & Charges", icon: "🏠" },
  { name: "Restaurants & Bars", icon: "🍔" }, { name: "Shopping", icon: "🛍️" },
  { name: "Transport", icon: "🚖" }, { name: "Other", icon: "✋" },
];

export const INITIAL_GUEST_INCOME_CATEGORIES: Category[] = [
  { name: "Salary", icon: "💰" }, { name: "Gift", icon: "🎁" },
  { name: "Freelance", icon: "💼" }, { name: "Investment", icon: "📈" },
  { name: "Other", icon: "✋" },
];

// Unified API Interface (Local-First Offline Persistence + Secure Backend AI)
export const api = {
  // Local Database Initialization
  initLocalDb: async () => {
    return await localDataService.initDatabase();
  },

  // Authentication & Session Management
  auth: {
    login: async (payload: { email?: string; name?: string; id?: string; provider?: string }) => {
      // Local-first session generation
      const userId = payload.id || (payload.email ? `user_${payload.email.replace(/[^a-zA-Z0-9]/g, '_')}` : `user_${Date.now()}`);
      const user = {
        userId,
        email: payload.email || 'user@example.com',
        name: payload.name || 'User',
        provider: payload.provider || 'email'
      };
      await localDataService.saveUserProfile(userId, user.name, user.email);

      // Attempt backend auth token exchange if online for AI proxy services
      if (navigator.onLine) {
        try {
          const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (response.ok) {
            const data = await response.json();
            if (data.token) setAuthToken(data.token);
            return data;
          }
        } catch (e) {
          // Graceful offline fallback
        }
      }
      return { user };
    },
    googleLogin: async (payload: { credential?: string; name?: string; email?: string; id?: string }) => {
      const userId = payload.id || (payload.email ? `user_${payload.email.replace(/[^a-zA-Z0-9]/g, '_')}` : `user_${Date.now()}`);
      const user = {
        userId,
        email: payload.email || 'google_user@example.com',
        name: payload.name || 'Google User',
        provider: 'google'
      };
      await localDataService.saveUserProfile(userId, user.name, user.email);

      if (navigator.onLine) {
        try {
          const response = await fetch(`${API_BASE_URL}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (response.ok) {
            const data = await response.json();
            if (data.token) setAuthToken(data.token);
            return data;
          }
        } catch (e) {
          // Graceful offline fallback
        }
      }
      return { user };
    },
    getMe: async () => {
      const token = getAuthToken();
      if (token && navigator.onLine) {
        try {
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: getAuthHeaders(),
          });
          if (response.ok) return await response.json();
        } catch (e) {}
      }
      return { user: null };
    },
  },

  // Transactions (Local-First SQLite on Device)
  fetchTransactions: async (_userId?: string) => {
    return await localDataService.getTransactions();
  },
  addTransaction: async (transactionData: any, _userId?: string) => {
    return await localDataService.addTransaction(transactionData);
  },
  updateTransaction: async (id: string | number, transactionData: any, _userId?: string) => {
    return await localDataService.updateTransaction(id, transactionData);
  },
  deleteTransaction: async (id: string | number, _userId?: string) => {
    return await localDataService.deleteTransaction(id);
  },

  // Categories (Local-First SQLite on Device)
  fetchExpenseCategories: async (): Promise<Category[]> => {
    return await localDataService.getExpenseCategories();
  },
  addExpenseCategory: async (name: string, icon: string): Promise<Category> => {
    return await localDataService.addExpenseCategory(name, icon);
  },
  deleteExpenseCategory: async (categoryToDelete: string): Promise<void> => {
    return await localDataService.deleteExpenseCategory(categoryToDelete);
  },

  fetchIncomeCategories: async (): Promise<Category[]> => {
    return await localDataService.getIncomeCategories();
  },
  addIncomeCategory: async (name: string, icon: string): Promise<Category> => {
    return await localDataService.addIncomeCategory(name, icon);
  },
  deleteIncomeCategory: async (categoryToDelete: string): Promise<void> => {
    return await localDataService.deleteIncomeCategory(categoryToDelete);
  },

  // Backup and Restore
  exportData: async () => {
    return await localDataService.exportAllData();
  },
  importData: async (jsonString: string) => {
    return await localDataService.importAllData(jsonString);
  },

  // AI Endpoints (Secured via Backend with Offline Notice)
  ai: {
    parseTransaction: async (text: string) => {
      if (!navigator.onLine) {
        throw new Error("No internet connection. AI features are temporarily unavailable.");
      }
      try {
        const response = await fetch(`${API_BASE_URL}/ai/parse-transaction`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ text }),
        });
        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.error || 'Failed to parse transaction with AI');
        }
        const result = await response.json();
        return result.data;
      } catch (err: any) {
        if (err.message && err.message.includes("Failed to fetch")) {
          throw new Error("No internet connection. AI features are temporarily unavailable.");
        }
        throw err;
      }
    },
    getCategoryEmoji: async (categoryName: string): Promise<string> => {
      if (!navigator.onLine) return '🏷️';
      try {
        const response = await fetch(`${API_BASE_URL}/ai/category-emoji`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ categoryName }),
        });
        if (!response.ok) return '🏷️';
        const result = await response.json();
        return result.emoji || '🏷️';
      } catch (e) {
        return '🏷️';
      }
    },
    chat: async (message: string, context?: string): Promise<string> => {
      if (!navigator.onLine) {
        return "No internet connection. AI features are temporarily unavailable.";
      }
      try {
        const response = await fetch(`${API_BASE_URL}/ai/chat`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ message, context }),
        });
        if (!response.ok) {
          return "Sorry, the AI financial assistant is temporarily unavailable.";
        }
        const result = await response.json();
        return result.reply || "Sorry, I couldn't generate a response.";
      } catch (err) {
        return "No internet connection. AI features are temporarily unavailable.";
      }
    },
  },
};

// --- OTHER CONSTANTS ---
export const INITIAL_ACCOUNTS: string[] = ["Cash", "Bank", "Wallet", "Credit Card", "UPI"];
export const CURRENCIES = [
  { code: 'USD', name: 'United States Dollar', symbol: '$' }, { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' }, { code: 'GBP', name: 'British Pound Sterling', symbol: '£' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
];

export const LANGUAGES = [
  { code: 'en', name: 'English' }, { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'hi', name: 'हिन्दी' }, { code: 'ja', name: '日本語' },
  { code: 'ta', name: 'தமிழ்' },
];

export const BANKS: Bank[] = [];
export const BUDGET_DATA: BudgetData = { limit: 1500, spent: 0, remaining: 1500 };