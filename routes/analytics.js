/**
 * Analytics Routes
 * GET /api/analytics — Dashboard stats (admin only)
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { requireAdmin } = require('../middleware/auth');

const DB_PATH = path.join(__dirname, '../data/db.json');
function getDB() { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); }

router.get('/', requireAdmin, (req, res) => {
    const db = getDB();
    const totalOrders = db.orders.length;
    const totalRevenue = db.orders
        .filter(o => o.status !== 'Cancelled')
        .reduce((sum, o) => sum + (o.total || 0), 0);
    const activeUsers = db.users.filter(u => u.role === 'user').length;
    const pendingOrders = db.orders.filter(o => o.status === 'Pending').length;
    const unreadMessages = db.messages.filter(m => !m.read).length;
    const deliveredOrders = db.orders.filter(o => o.status === 'Delivered').length;

    res.json({
        totalOrders,
        totalRevenue,
        activeUsers,
        pendingOrders,
        unreadMessages,
        deliveredOrders,
        totalProducts: db.products.length
    });
});

module.exports = router;
