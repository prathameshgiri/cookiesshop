/**
 * admin-server.js — Dedicated Admin Server on port 3001
 */
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the same public static assets (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

// Re-use all the same API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/analytics', require('./routes/analytics'));

// Admin panel is the root on this port
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'admin.html'));
});
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'admin.html'));
});
app.get('/admin-login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'admin-login.html'));
});

// Fallback
app.use((req, res) => {
    if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Not found' });
    res.sendFile(path.join(__dirname, 'public', 'pages', 'admin.html'));
});

app.listen(PORT, () => {
    // No output here to avoid duplicate logging with server.js
});
