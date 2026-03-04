/**
 * Products Routes
 * GET    /api/products         — Get all products
 * GET    /api/products/:id     — Get one product
 * POST   /api/products         — Add product (admin)
 * PUT    /api/products/:id     — Update product (admin)
 * DELETE /api/products/:id     — Delete product (admin)
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

// Get all products
router.get('/', (req, res) => {
    const db = getDB();
    const { category } = req.query;
    let products = db.products;
    if (category && category !== 'all') {
        products = products.filter(p => p.category === category);
    }
    res.json(products);
});

// Get single product
router.get('/:id', (req, res) => {
    const db = getDB();
    const product = db.products.find(p => p.id === req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
});

// Add product (admin only)
router.post('/', requireAdmin, (req, res) => {
    const db = getDB();
    const product = {
        id: `p${uuidv4().slice(0, 8)}`,
        ...req.body,
        createdAt: new Date().toISOString()
    };
    db.products.push(product);
    saveDB(db);
    res.status(201).json(product);
});

// Update product (admin only)
router.put('/:id', requireAdmin, (req, res) => {
    const db = getDB();
    const idx = db.products.findIndex(p => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Product not found' });
    db.products[idx] = { ...db.products[idx], ...req.body };
    saveDB(db);
    res.json(db.products[idx]);
});

// Delete product (admin only)
router.delete('/:id', requireAdmin, (req, res) => {
    const db = getDB();
    const idx = db.products.findIndex(p => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Product not found' });
    db.products.splice(idx, 1);
    saveDB(db);
    res.json({ success: true });
});

module.exports = router;
