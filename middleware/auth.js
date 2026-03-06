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

// Verify user by session token stored in db.json
function saveDB(db) {
  const dbPath = path.join(__dirname, '../data/db.json');
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

function createSession(userId, role) {
  const db = getDB();
  if (!db.sessions) db.sessions = {};

  const token = `sess_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  db.sessions[token] = { userId, role, createdAt: Date.now() };
  saveDB(db);
  return token;
}

function getSession(token) {
  const db = getDB();
  return (db.sessions && db.sessions[token]) || null;
}

function destroySession(token) {
  const db = getDB();
  if (db.sessions && db.sessions[token]) {
    delete db.sessions[token];
    saveDB(db);
  }
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
