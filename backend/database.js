const sqlite3 = require('sqlite3').verbose();
const DBSOURCE = "ledgerly.db";

const INITIAL_EXPENSE_CATEGORIES = [
    { name: "Accommodation", icon: "🛏️" }, { name: "Entertainment", icon: "🎤" },
    { name: "Groceries", icon: "🛒" }, { name: "Healthcare", icon: "🦷" },
    { name: "Insurance", icon: "🧯" }, { name: "Rent & Charges", icon: "🏠" },
    { name: "Restaurants & Bars", icon: "🍔" }, { name: "Shopping", icon: "🛍️" },
    { name: "Transport", icon: "🚖" }, { name: "Other", icon: "✋" },
];

const INITIAL_INCOME_CATEGORIES = [
    { name: "Salary", icon: "💰" }, { name: "Gift", icon: "🎁" },
    { name: "Freelance", icon: "💼" }, { name: "Investment", icon: "📈" },
    { name: "Other", icon: "✋" },
];


const db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        console.error(err.message);
        throw err;
    } else {
        console.log('Connected to the SQLite database.');

        // Create Transactions table with the new userId column
        db.run(`CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId TEXT NOT NULL,
            transactionType TEXT NOT NULL,
            amount REAL NOT NULL,
            category TEXT,
            date TEXT NOT NULL,
            notes TEXT,
            vendor TEXT,
            source TEXT,
            fromAccount TEXT,
            toAccount TEXT,
            receiptUrl TEXT
        )`);

        // Create Expense Categories table
        db.run(`CREATE TABLE IF NOT EXISTS expense_categories (
            name TEXT PRIMARY KEY,
            icon TEXT
        )`, (err) => {
            if (!err) {
                const insert = 'INSERT OR IGNORE INTO expense_categories (name, icon) VALUES (?,?)';
                INITIAL_EXPENSE_CATEGORIES.forEach(cat => db.run(insert, [cat.name, cat.icon]));
            }
        });

        // Create Income Categories table
        db.run(`CREATE TABLE IF NOT EXISTS income_categories (
            name TEXT PRIMARY KEY,
            icon TEXT
        )`, (err) => {
            if (!err) {
                const insert = 'INSERT OR IGNORE INTO income_categories (name, icon) VALUES (?,?)';
                INITIAL_INCOME_CATEGORIES.forEach(cat => db.run(insert, [cat.name, cat.icon]));
            }
        });
    }
});

module.exports = db;