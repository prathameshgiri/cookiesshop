/**
 * Orders Routes
 * GET    /api/orders           — Get orders (admin: all, user: own)
 * POST   /api/orders           — Place new order (user)
 * PUT    /api/orders/:id       — Update status (admin)
 * DELETE /api/orders/:id       — Cancel order (user)
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const DB_PATH = path.join(__dirname, '../data/db.json');

function getDB() { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); }
function saveDB(db) { fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2)); }

// Get orders
router.get('/', requireAuth, (req, res) => {
    const db = getDB();
    if (req.session.role === 'admin') {
        // Admin gets all orders
        const orders = db.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.json(orders);
    } else {
        // User gets only own orders
        const orders = db.orders
            .filter(o => o.userId === req.session.userId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.json(orders);
    }
});

// Place new order
router.post('/', requireAuth, (req, res) => {
    const db = getDB();
    const user = db.users.find(u => u.id === req.session.userId);
    const order = {
        id: `ord${uuidv4().slice(0, 8)}`,
        userId: req.session.userId,
        userName: user ? user.name : 'Customer',
        userEmail: user ? user.email : '',
        items: req.body.items,
        total: req.body.total,
        address: req.body.address,
        status: 'Pending',
        createdAt: new Date().toISOString()
    };
    db.orders.push(order);
    saveDB(db);
    res.status(201).json(order);
});

// Update order status (admin only)
router.put('/:id', requireAdmin, (req, res) => {
    const db = getDB();
    const idx = db.orders.findIndex(o => o.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Order not found' });
    db.orders[idx].status = req.body.status;
    saveDB(db);
    res.json(db.orders[idx]);
});

// Cancel order (user, only if Pending)
router.delete('/:id', requireAuth, (req, res) => {
    const db = getDB();
    const idx = db.orders.findIndex(o => o.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Order not found' });
    const order = db.orders[idx];
    if (order.userId !== req.session.userId && req.session.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    if (order.status !== 'Pending') {
        return res.status(400).json({ error: 'Only pending orders can be cancelled' });
    }
    db.orders[idx].status = 'Cancelled';
    saveDB(db);
    res.json({ success: true, order: db.orders[idx] });
});

module.exports = router;
