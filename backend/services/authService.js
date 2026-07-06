const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { logActivity } = require('../utils/activityLogger');

async function register({ name, email, password }) {
  const role = 'CUSTOMER';
  const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) {
    throw { status: 409, message: 'Email already registered' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const [result] = await pool.execute(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, hashedPassword, role]
  );

  const user = { id: result.insertId, name, email, role };
  await logActivity(user.id, 'User registered', 'Auth');
  return user;
}

async function login({ email, password }) {
  const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
  if (rows.length === 0) {
    throw { status: 401, message: 'Invalid email or password' };
  }

  const user = rows[0];
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw { status: 401, message: 'Invalid email or password' };
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  await logActivity(user.id, 'User logged in', 'Auth');

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
}

async function getProfile(userId) {
  const [rows] = await pool.execute(
    'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
    [userId]
  );
  if (rows.length === 0) {
    throw { status: 404, message: 'User not found' };
  }
  return rows[0];
}

async function getAllUsers(role) {
  let query = 'SELECT id, name, email, role, created_at FROM users';
  const params = [];
  if (role) {
    query += ' WHERE role = ?';
    params.push(role);
  }
  query += ' ORDER BY created_at DESC';
  const [rows] = await pool.execute(query, params);
  return rows;
}

module.exports = { register, login, getProfile, getAllUsers };
