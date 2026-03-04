/**
 * Auth Routes
 * POST /api/auth/login  — Login with email + password
 * POST /api/auth/logout — Logout
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { createSession } = require('../middleware/auth');

function getDB() {
    const dbPath = path.join(__dirname, '../data/db.json');
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

// Login
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }
    const db = getDB();
    const user = db.users.find(u => u.email === email && u.password === password);
    if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = createSession(user.id, user.role);
    return res.json({
        token,
        role: user.role,
        name: user.name,
        email: user.email,
        id: user.id
    });
});

// Logout
router.post('/logout', (req, res) => {
    const { destroySession } = require('../middleware/auth');
    const token = req.headers['authorization'];
    if (token) destroySession(token);
    res.json({ success: true });
});

module.exports = router;
