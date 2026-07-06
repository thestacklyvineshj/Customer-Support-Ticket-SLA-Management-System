const { body } = require('express-validator');
const { USER_ROLES, TICKET_PRIORITIES, TICKET_STATUSES } = require('../utils/constants');

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(USER_ROLES).withMessage('Invalid role'),
];

const loginValidation = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const ticketValidation = [
  body('ticket_title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('ticket_description').trim().notEmpty().withMessage('Description is required'),
  body('priority').isIn(TICKET_PRIORITIES).withMessage('Invalid priority'),
  body('category').trim().notEmpty().withMessage('Category is required').isLength({ max: 100 }),
];

const ticketUpdateValidation = [
  body('status').optional().isIn(TICKET_STATUSES).withMessage('Invalid status'),
  body('priority').optional().isIn(TICKET_PRIORITIES).withMessage('Invalid priority'),
  body('assigned_agent_id').optional().isInt().withMessage('Invalid agent ID'),
];

const commentValidation = [
  body('comment').trim().notEmpty().withMessage('Comment is required'),
];

module.exports = {
  registerValidation,
  loginValidation,
  ticketValidation,
  ticketUpdateValidation,
  commentValidation,
};
