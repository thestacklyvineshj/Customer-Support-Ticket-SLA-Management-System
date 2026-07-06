const express = require('express');
const ticketController = require('../controllers/ticketController');
const commentController = require('../controllers/commentController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { ticketValidation, ticketUpdateValidation, commentValidation } = require('../models/validators');

const router = express.Router();

router.use(authenticate);

router.post('/', authorize('CUSTOMER'), ticketValidation, validate, ticketController.createTicket);
router.get('/', ticketController.getTickets);
router.get('/:id', ticketController.getTicketById);
router.put('/:id', authorize('ADMIN', 'SUPPORT_AGENT'), ticketUpdateValidation, validate, ticketController.updateTicket);
router.delete('/:id', authorize('ADMIN'), ticketController.deleteTicket);

router.post('/:id/comment', commentValidation, validate, commentController.addComment);
router.get('/:id/comments', commentController.getComments);

module.exports = router;
