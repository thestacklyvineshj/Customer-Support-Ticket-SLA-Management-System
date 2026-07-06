const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate);

router.get('/admin', authorize('ADMIN'), dashboardController.getAdminDashboard);
router.get('/agent', authorize('SUPPORT_AGENT'), dashboardController.getAgentDashboard);
router.get('/customer', authorize('CUSTOMER'), dashboardController.getCustomerDashboard);

module.exports = router;
