/**
 * Auth Middleware
 * Simple session-based auth middleware for demo purposes
 */

const fs = require('fs');
const path = require('path');

// Read DB
function getDB() {
  const dbPath = path.join(__dirname, '../data/db.json');
  return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

// Verify user by session token stored in memory
const sessions = {};

function createSession(userId, role) {
  const token = `sess_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  sessions[token] = { userId, role, createdAt: Date.now() };
  return token;
}

function getSession(token) {
  return sessions[token] || null;
}

function destroySession(token) {
  delete sessions[token];
}

// Middleware: require any authenticated user
function requireAuth(req, res, next) {
  const token = req.headers['authorization'] || req.query.token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const session = getSession(token);
  if (!session) return res.status(401).json({ error: 'Session expired' });
  req.session = session;
  next();
}

// Middleware: require admin role
function requireAdmin(req, res, next) {
  const token = req.headers['authorization'] || req.query.token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const session = getSession(token);
  if (!session) return res.status(401).json({ error: 'Session expired' });
  if (session.role !== 'admin') return res.status(403).json({ error: 'Forbidden: Admins only' });
  req.session = session;
  next();
}

module.exports = { createSession, getSession, destroySession, requireAuth, requireAdmin };
