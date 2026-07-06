const slaTrackingService = require('../services/slaTrackingService');

async function getAllSla(req, res) {
  try {
    const data = await slaTrackingService.getAllSla(req.user);
    res.json({ success: true, data });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
  }
}

async function updateSla(req, res) {
  try {
    const data = await slaTrackingService.updateSla(req.params.ticket_id, req.user, req.body);
    res.json({ success: true, message: 'SLA updated', data });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
  }
}

module.exports = { getAllSla, updateSla };
