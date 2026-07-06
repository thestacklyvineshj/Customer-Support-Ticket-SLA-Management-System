const dashboardService = require('../services/dashboardService');

async function getAdminDashboard(req, res) {
  try {
    const data = await dashboardService.getAdminDashboard();
    res.json({ success: true, data });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
  }
}

async function getAgentDashboard(req, res) {
  try {
    const data = await dashboardService.getAgentDashboard(req.user.id);
    res.json({ success: true, data });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
  }
}

async function getCustomerDashboard(req, res) {
  try {
    const data = await dashboardService.getCustomerDashboard(req.user.id);
    res.json({ success: true, data });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
  }
}

module.exports = { getAdminDashboard, getAgentDashboard, getCustomerDashboard };
