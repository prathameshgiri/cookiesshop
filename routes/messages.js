/**
 * Messages Routes
 * GET    /api/messages      — Get all messages (admin)
 * POST   /api/messages      — Submit contact message (public)
 * PUT    /api/messages/:id  — Mark as read (admin)
 * DELETE /api/messages/:id  — Delete message (admin)
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { requireAdmin } = require('../middleware/auth');

const DB_PATH = path.join(__dirname, '../data/db.json');

function getDB() { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); }
function saveDB(db) { fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2)); }

// Get all messages (admin only)
router.get('/', requireAdmin, (req, res) => {
    const db = getDB();
    const messages = db.messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(messages);
});

// Submit contact message (public)
router.post('/', (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    const db = getDB();
    const msg = {
        id: `msg${uuidv4().slice(0, 8)}`,
        name,
        email,
        message,
        read: false,
        createdAt: new Date().toISOString()
    };
    db.messages.push(msg);
    saveDB(db);
    res.status(201).json({ success: true, message: msg });
});

// Mark as read (admin only)
router.put('/:id', requireAdmin, (req, res) => {
    const db = getDB();
    const idx = db.messages.findIndex(m => m.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Message not found' });
    db.messages[idx].read = true;
    saveDB(db);
    res.json(db.messages[idx]);
});

// Delete message (admin only)
router.delete('/:id', requireAdmin, (req, res) => {
    const db = getDB();
    const idx = db.messages.findIndex(m => m.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Message not found' });
    db.messages.splice(idx, 1);
    saveDB(db);
    res.json({ success: true });
});

module.exports = router;
