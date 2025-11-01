const express = require('express');
const cors = require('cors');
const db = require('./database.js');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 8000;

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});

// --- API ENDPOINTS ---

// GET all transactions for a specific user
app.get("/api/transactions/:userId", (req, res) => {
    const userId = req.params.userId;
    db.all("SELECT * FROM transactions WHERE userId = ? ORDER BY date DESC", [userId], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ data: rows });
    });
});

// ADD a new transaction for a specific user
app.post("/api/transaction", (req, res) => {
    const body = req.body;
    // Ensure userId is present
    if (!body.userId) {
        return res.status(400).json({ "error": "userId is required" });
    }
    
    const params = [
        body.userId,
        body.transactionType,
        body.amount,
        body.category || null,
        body.date,
        body.notes || null,
        body.vendor || null,
        body.source || null,
        body.fromAccount || null,
        body.toAccount || null,
        body.receiptUrl || null
    ];
    
    const sql = `INSERT INTO transactions 
        (userId, transactionType, amount, category, date, notes, vendor, source, fromAccount, toAccount, receiptUrl) 
        VALUES (?,?,?,?,?,?,?,?,?,?,?)`;

    db.run(sql, params, function (err) {
        if (err) {
            console.error("Database Error:", err.message);
            res.status(400).json({ "error": err.message });
            return;
        }
        res.status(201).json({ id: this.lastID, ...req.body });
    });
});

// UPDATE a transaction (ensures user can only edit their own)
app.put("/api/transaction/:id", (req, res) => {
    const body = req.body;
    if (!body.userId) {
        return res.status(400).json({ "error": "userId is required for update validation" });
    }
    const sql = `UPDATE transactions set 
                    transactionType = COALESCE(?, transactionType),
                    amount = COALESCE(?, amount), 
                    category = COALESCE(?, category), 
                    date = COALESCE(?, date), 
                    notes = COALESCE(?, notes), 
                    vendor = COALESCE(?, vendor),
                    source = COALESCE(?, source),
                    fromAccount = COALESCE(?, fromAccount),
                    toAccount = COALESCE(?, toAccount)
                 WHERE id = ? AND userId = ?`;

    const params = [
        body.transactionType,
        body.amount, 
        body.category, 
        body.date, 
        body.notes, 
        body.vendor, 
        body.source,
        body.fromAccount,
        body.toAccount,
        req.params.id, 
        body.userId
    ];
    
    db.run(sql, params, function (err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        if (this.changes === 0) {
            return res.status(404).json({ "error": "Transaction not found or user not authorized." });
        }
        res.json({ message: "Success", changes: this.changes });
    });
});

// DELETE a transaction (ensures user can only delete their own)
app.delete("/api/transaction/:id/:userId", (req, res) => {
    db.run('DELETE FROM transactions WHERE id = ? AND userId = ?', [req.params.id, req.params.userId], function(err) {
        if (err){
            res.status(400).json({"error": res.message})
            return;
        }
        if (this.changes === 0) {
            return res.status(404).json({ "error": "Transaction not found or user not authorized." });
        }
        res.json({"message":"deleted", changes: this.changes})
    });
});


// --- CATEGORY ENDPOINTS (These remain public and shared for simplicity) ---

app.get("/api/expense-categories", (req, res) => {
    db.all("SELECT * FROM expense_categories", [], (err, rows) => {
        if (err) { res.status(400).json({ "error": err.message }); return; }
        res.json({ data: rows });
    });
});

app.post("/api/expense-category", (req, res) => {
    const { name } = req.body;
    db.run(`INSERT OR IGNORE INTO expense_categories(name, icon) VALUES (?,?)`, [name, '🏷️'], function(err) {
        if (err){ res.status(400).json({"error": "Category likely already exists."}); return; }
        res.status(201).json({name, icon: '🏷️'});
    });
});

app.delete("/api/expense-category/:name", (req, res) => {
    const name = decodeURIComponent(req.params.name);
    db.run('DELETE FROM expense_categories WHERE name = ?', name, function(err) {
        if (err){ res.status(400).json({"error": res.message}); return; }
        res.json({"message":"deleted"})
    });
});

app.get("/api/income-categories", (req, res) => {
    db.all("SELECT * FROM income_categories", [], (err, rows) => {
        if (err) { res.status(400).json({ "error": err.message }); return; }
        res.json({ data: rows });
    });
});

app.post("/api/income-category", (req, res) => {
    const { name } = req.body;
    db.run(`INSERT OR IGNORE INTO income_categories(name, icon) VALUES (?,?)`, [name, '🏷️'], function(err) {
        if (err){ res.status(400).json({"error": "Category likely already exists."}); return; }
        res.status(201).json({name, icon: '🏷️'});
    });
});

app.delete("/api/income-category/:name", (req, res) => {
    const name = decodeURIComponent(req.params.name);
    db.run('DELETE FROM income_categories WHERE name = ?', name, function(err) {
        if (err){ res.status(400).json({"error": res.message}); return; }
        res.json({"message":"deleted"})
    });
});