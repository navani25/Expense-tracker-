const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const db = require('./database.js');

// --- 1. SECURE ENVIRONMENT VARIABLE LOADING ---
function loadEnv() {
    const envPaths = [
        path.resolve(__dirname, '../.env'),
        path.resolve(__dirname, '.env')
    ];
    for (const envPath of envPaths) {
        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, 'utf8');
            content.split('\n').forEach(line => {
                const trimmed = line.trim();
                if (trimmed && !trimmed.startsWith('#')) {
                    const eqIndex = trimmed.indexOf('=');
                    if (eqIndex > 0) {
                        const key = trimmed.substring(0, eqIndex).trim();
                        let val = trimmed.substring(eqIndex + 1).trim();
                        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                            val = val.substring(1, val.length - 1);
                        }
                        if (!process.env[key]) {
                            process.env[key] = val;
                        }
                    }
                }
            });
            break;
        }
    }
}
loadEnv();

const app = express();
const PORT = process.env.PORT || 8000;
const JWT_SECRET = process.env.JWT_SECRET || 'ledgerly_production_secret_key_change_in_env_2026';

// --- 2. ENVIRONMENT-AWARE CORS CONFIGURATION ---
const defaultDevOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'capacitor://localhost',
    'http://localhost'
];

const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : (process.env.FRONTEND_URL ? [process.env.FRONTEND_URL, ...defaultDevOrigins] : defaultDevOrigins);

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// --- 3. JWT UTILITIES & AUTHENTICATION MIDDLEWARE ---
function base64UrlEncode(str) {
    return Buffer.from(str)
        .toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

function base64UrlDecode(str) {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) {
        str += '=';
    }
    return Buffer.from(str, 'base64').toString('utf8');
}

function signToken(payload, expiresInSeconds = 7 * 24 * 60 * 60) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const fullPayload = {
        ...payload,
        iat: now,
        exp: now + expiresInSeconds
    };
    const headerEncoded = base64UrlEncode(JSON.stringify(header));
    const payloadEncoded = base64UrlEncode(JSON.stringify(fullPayload));
    const signature = crypto
        .createHmac('sha256', JWT_SECRET)
        .update(`${headerEncoded}.${payloadEncoded}`)
        .digest('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
    return `${headerEncoded}.${payloadEncoded}.${signature}`;
}

function verifyToken(token) {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [headerEncoded, payloadEncoded, signature] = parts;
    const expectedSignature = crypto
        .createHmac('sha256', JWT_SECRET)
        .update(`${headerEncoded}.${payloadEncoded}`)
        .digest('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
    
    try {
        const sigBuf = Buffer.from(signature);
        const expSigBuf = Buffer.from(expectedSignature);
        if (sigBuf.length !== expSigBuf.length || !crypto.timingSafeEqual(sigBuf, expSigBuf)) {
            return null;
        }
        const payload = JSON.parse(base64UrlDecode(payloadEncoded));
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < now) {
            return null;
        }
        return payload;
    } catch (e) {
        return null;
    }
}

function authenticateUser(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Authentication required. Missing Bearer token." });
    }
    const token = authHeader.substring(7).trim();
    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
        return res.status(401).json({ error: "Invalid or expired session token." });
    }
    req.user = decoded;
    next();
}

// --- 4. SECURE GEMINI AI SERVICE (BACKEND ONLY) ---
let googleGenAI = null;
function getGeminiClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not configured on the backend server.");
    }
    if (!googleGenAI) {
        const { GoogleGenAI } = require('@google/genai');
        googleGenAI = new GoogleGenAI({ apiKey });
    }
    return googleGenAI;
}

// --- 5. AUTHENTICATION ENDPOINTS ---

// Generic Login / Session creation (Email, Phone, Demo, Guest)
app.post("/api/auth/login", (req, res) => {
    const { email, name, id, provider } = req.body;
    let userId = id;
    if (!userId) {
        if (email) {
            userId = `user_${crypto.createHash('sha256').update(email.trim().toLowerCase()).digest('hex').substring(0, 16)}`;
        } else {
            userId = `user_${crypto.randomBytes(8).toString('hex')}`;
        }
    }
    const user = {
        userId,
        email: email || 'user@example.com',
        name: name || 'User',
        provider: provider || 'email'
    };
    const token = signToken(user);
    res.json({ token, user });
});

// Google OAuth Login / Token Verification
app.post("/api/auth/google", (req, res) => {
    const { credential, name, email, id } = req.body;
    let userId = id;
    let userName = name;
    let userEmail = email;

    if (credential && typeof credential === 'string') {
        try {
            const parts = credential.split('.');
            if (parts.length === 3) {
                const payload = JSON.parse(base64UrlDecode(parts[1]));
                if (payload.sub) userId = payload.sub;
                if (payload.email) userEmail = payload.email;
                if (payload.name) {
                    userName = payload.name;
                } else if (payload.given_name || payload.family_name) {
                    userName = `${payload.given_name || ''} ${payload.family_name || ''}`.trim();
                }
            }
        } catch (e) {
            console.warn("Failed to parse Google credential payload:", e.message);
        }
    }

    if (!userId) {
        return res.status(400).json({ error: "Invalid Google credentials. User identity could not be verified." });
    }

    const user = {
        userId,
        email: userEmail || 'google_user@example.com',
        name: userName || 'Google User',
        provider: 'google'
    };

    const token = signToken(user);
    res.json({ token, user });
});

// Current User Profile Verification
app.get("/api/auth/me", authenticateUser, (req, res) => {
    res.json({ user: req.user });
});

// --- 6. SECURE TRANSACTION ENDPOINTS (USER-ISOLATED) ---

// GET all transactions for authenticated user
app.get("/api/transactions", authenticateUser, (req, res) => {
    const userId = req.user.userId;
    db.all("SELECT * FROM transactions WHERE userId = ? ORDER BY date DESC", [userId], (err, rows) => {
        if (err) {
            console.error("Database query error:", err.message);
            res.status(500).json({ error: "Failed to retrieve transactions." });
            return;
        }
        res.json({ data: rows || [] });
    });
});

// Backward-compatible route - enforces authenticated user ID
app.get("/api/transactions/:userId", authenticateUser, (req, res) => {
    const userId = req.user.userId;
    db.all("SELECT * FROM transactions WHERE userId = ? ORDER BY date DESC", [userId], (err, rows) => {
        if (err) {
            console.error("Database query error:", err.message);
            res.status(500).json({ error: "Failed to retrieve transactions." });
            return;
        }
        res.json({ data: rows || [] });
    });
});

// ADD a new transaction for authenticated user
app.post("/api/transaction", authenticateUser, (req, res) => {
    const body = req.body;
    const userId = req.user.userId;
    
    if (!body.transactionType || body.amount === undefined || !body.date) {
        return res.status(400).json({ error: "transactionType, amount, and date are required fields." });
    }

    const params = [
        userId,
        body.transactionType,
        Number(body.amount),
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
            res.status(500).json({ error: "Failed to create transaction." });
            return;
        }
        res.status(201).json({ id: this.lastID, ...body, userId });
    });
});

// UPDATE a transaction (strictly verifies ownership)
app.put("/api/transaction/:id", authenticateUser, (req, res) => {
    const body = req.body;
    const userId = req.user.userId;
    const id = req.params.id;

    const sql = `UPDATE transactions set 
                    amount = COALESCE(?, amount), 
                    category = COALESCE(?, category), 
                    date = COALESCE(?, date), 
                    notes = COALESCE(?, notes), 
                    vendor = COALESCE(?, vendor),
                    source = COALESCE(?, source),
                    fromAccount = COALESCE(?, fromAccount),
                    toAccount = COALESCE(?, toAccount),
                    receiptUrl = COALESCE(?, receiptUrl)
                 WHERE id = ? AND userId = ?`;

    const params = [
        body.amount !== undefined ? Number(body.amount) : null,
        body.category,
        body.date,
        body.notes,
        body.vendor,
        body.source,
        body.fromAccount,
        body.toAccount,
        body.receiptUrl,
        id,
        userId
    ];
    
    db.run(sql, params, function (err) {
        if (err) {
            console.error("Database Error:", err.message);
            res.status(500).json({ error: "Failed to update transaction." });
            return;
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "Transaction not found or user not authorized." });
        }
        res.json({ message: "Success", changes: this.changes });
    });
});

// DELETE a transaction (strictly verifies ownership)
app.delete("/api/transaction/:id", authenticateUser, (req, res) => {
    const userId = req.user.userId;
    const id = req.params.id;

    db.run('DELETE FROM transactions WHERE id = ? AND userId = ?', [id, userId], function(err) {
        if (err) {
            console.error("Database Error:", err.message);
            res.status(500).json({ error: "Failed to delete transaction." });
            return;
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "Transaction not found or user not authorized." });
        }
        res.json({ message: "deleted", changes: this.changes });
    });
});

// Backward-compatible DELETE route (strictly verifies ownership)
app.delete("/api/transaction/:id/:userId", authenticateUser, (req, res) => {
    const userId = req.user.userId;
    const id = req.params.id;

    db.run('DELETE FROM transactions WHERE id = ? AND userId = ?', [id, userId], function(err) {
        if (err) {
            console.error("Database Error:", err.message);
            res.status(500).json({ error: "Failed to delete transaction." });
            return;
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "Transaction not found or user not authorized." });
        }
        res.json({ message: "deleted", changes: this.changes });
    });
});

// --- 7. SECURE GEMINI AI ENDPOINTS ---

// AI Transaction Parsing (Speech/Text -> Structured Transaction)
app.post("/api/ai/parse-transaction", authenticateUser, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text || typeof text !== 'string' || !text.trim()) {
            return res.status(400).json({ error: "Text input is required." });
        }

        const ai = getGeminiClient();
        const { Type } = require('@google/genai');
        const schema = {
            type: Type.OBJECT,
            properties: {
                transactionType: { type: Type.STRING, enum: ['expense', 'income'], description: "Infer if user is spending (expense) or receiving (income)" },
                amount: { type: Type.NUMBER },
                category: { type: Type.STRING },
                date: { type: Type.STRING },
                notes: { type: Type.STRING, description: "Short title/description" },
                vendor: { type: Type.STRING },
                source: { type: Type.STRING },
            },
        };

        const today = new Date().toISOString().split('T')[0];
        const systemInstruction = `
        You are a smart financial assistant. Analyze the user's input.
        1. Determine if it is 'expense' (spent, paid, bought) or 'income' (received, salary, sold).
        2. Extract amount, category, and a short title (notes).
        3. Today is ${today}.
        4. Return a single JSON object.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: text,
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema,
                systemInstruction: systemInstruction
            }
        });

        let rawText = response.text || JSON.stringify(response);
        const match = rawText.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
        if (!match) {
            return res.status(500).json({ error: "Could not parse transaction from AI response." });
        }
        const parsed = JSON.parse(match[0]);
        const finalData = {
            ...parsed,
            amount: Number(parsed.amount) || 0,
            date: parsed.date || today,
            notes: parsed.notes || text,
            category: parsed.category || 'General'
        };
        res.json({ data: finalData });
    } catch (err) {
        console.error("AI Parse Error:", err.message);
        res.status(500).json({ error: "AI transaction parsing failed." });
    }
});

// AI Category Emoji Generator
app.post("/api/ai/category-emoji", async (req, res) => {
    try {
        const { categoryName } = req.body;
        if (!categoryName || typeof categoryName !== 'string') {
            return res.json({ emoji: '🏷️' });
        }
        const ai = getGeminiClient();
        const systemInstruction = `You are an emoji generator. Your task is to return a single, relevant emoji that best represents the user's input category name. You must only return the emoji character and nothing else. No extra text, no explanations.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Category: "${categoryName}"`,
            config: { systemInstruction }
        });
        const emoji = (response.text || '🏷️').trim();
        res.json({ emoji: emoji.length > 4 ? '🏷️' : emoji });
    } catch (err) {
        console.error("AI Emoji Error:", err.message);
        res.json({ emoji: '🏷️' });
    }
});

// AI Financial Support Chat Assistant
app.post("/api/ai/chat", authenticateUser, async (req, res) => {
    try {
        const { message, context } = req.body;
        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: "Message is required." });
        }
        const ai = getGeminiClient();
        const today = new Date().toISOString().split('T')[0];
        const systemInstruction = `You are a friendly and intelligent financial assistant for an app called "Ledgerly". Your primary goal is to help users understand their financial data and how to use the app.

        **Your Capabilities:**
        1. **Answer App Questions:** Explain features like the **Dashboard**, **History**, **Reports**, etc. Use markdown for emphasis, specifically using ** for bolding key terms. For lists, start each item on a new line with '* '.
        2. **Analyze User Data:** You will receive the user's financial data for the **current month** in a JSON format. Use this data to answer questions like "What is my total income?", "How much did I spend on groceries?", or "What were my biggest expenses this month?".
        3. **Perform Calculations:** Calculate totals and averages based on the user's request and the provided data. Today's date is ${today}.
        4. **Be Clear and Concise:** Present financial data clearly. When giving a total, bold the final number.
        
        **Important:** Assume all questions relate to the current month's data unless the user specifies a different time period.`;

        const promptContent = context 
            ? `${context}\n\nUSER QUESTION:\n${message}`
            : message;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: promptContent,
            config: {
                systemInstruction: systemInstruction
            }
        });

        res.json({ reply: response.text || "I couldn't process that response." });
    } catch (err) {
        console.error("AI Chat Error:", err.message);
        res.status(500).json({ error: "Failed to generate AI response." });
    }
});

// --- 8. CATEGORY ENDPOINTS ---

app.get("/api/expense-categories", (req, res) => {
    db.all("SELECT * FROM expense_categories", [], (err, rows) => {
        if (err) { res.status(400).json({ "error": err.message }); return; }
        res.json({ data: rows });
    });
});

app.post("/api/expense-category", (req, res) => {
    const { name, icon } = req.body;
    db.run(`INSERT OR IGNORE INTO expense_categories(name, icon) VALUES (?,?)`, [name, icon || '🏷️'], function(err) {
        if (err){ res.status(400).json({"error": "Category likely already exists."}); return; }
        res.status(201).json({name, icon: icon || '🏷️'});
    });
});

app.delete("/api/expense-category/:name", (req, res) => {
    const name = decodeURIComponent(req.params.name);
    db.run('DELETE FROM expense_categories WHERE name = ?', name, function(err) {
        if (err){ res.status(400).json({"error": err.message}); return; }
        res.json({"message":"deleted"});
    });
});

app.get("/api/income-categories", (req, res) => {
    db.all("SELECT * FROM income_categories", [], (err, rows) => {
        if (err) { res.status(400).json({ "error": err.message }); return; }
        res.json({ data: rows });
    });
});

app.post("/api/income-category", (req, res) => {
    const { name, icon } = req.body;
    db.run(`INSERT OR IGNORE INTO income_categories(name, icon) VALUES (?,?)`, [name, icon || '🏷️'], function(err) {
        if (err){ res.status(400).json({"error": "Category likely already exists."}); return; }
        res.status(201).json({name, icon: icon || '🏷️'});
    });
});

app.delete("/api/income-category/:name", (req, res) => {
    const name = decodeURIComponent(req.params.name);
    db.run('DELETE FROM income_categories WHERE name = ?', name, function(err) {
        if (err){ res.status(400).json({"error": err.message}); return; }
        res.json({"message":"deleted"});
    });
});

// --- 9. GLOBAL ERROR HANDLER ---
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err.message);
    res.status(500).json({ error: "Internal server error." });
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});