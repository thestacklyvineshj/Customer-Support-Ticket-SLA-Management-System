const pool = require('../config/db');

async function logActivity(userId, activity, moduleName) {
  try {
    await pool.execute(
      'INSERT INTO activity_logs (user_id, activity, module_name) VALUES (?, ?, ?)',
      [userId, activity, moduleName]
    );
  } catch (err) {
    console.error('Activity log error:', err.message);
  }
}

module.exports = { logActivity };
