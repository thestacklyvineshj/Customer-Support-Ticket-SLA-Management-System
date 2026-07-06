const express = require('express');
const slaController = require('../controllers/slaController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/', slaController.getAllSla);
router.put('/:ticket_id', slaController.updateSla);

module.exports = router;
