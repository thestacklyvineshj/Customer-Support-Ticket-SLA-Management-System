const express = require('express');
const authController = require('../controllers/authController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { registerValidation, loginValidation } = require('../models/validators');

const router = express.Router();

router.post('/register', registerValidation, validate, authController.register);
router.post('/login', loginValidation, validate, authController.login);
router.get('/profile', authenticate, authController.getProfile);
router.get('/users', authenticate, authorize('ADMIN'), authController.getUsers);

module.exports = router;
