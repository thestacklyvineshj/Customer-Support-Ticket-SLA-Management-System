const authService = require('../services/authService');

async function register(req, res) {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ success: true, message: 'Registration successful', data: user });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
  }
}

async function login(req, res) {
  try {
    const result = await authService.login(req.body);
    res.json({ success: true, message: 'Login successful', data: result });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
  }
}

async function getProfile(req, res) {
  try {
    const profile = await authService.getProfile(req.user.id);
    res.json({ success: true, data: profile });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
  }
}

async function getUsers(req, res) {
  try {
    const users = await authService.getAllUsers(req.query.role);
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
  }
}

module.exports = { register, login, getProfile, getUsers };
