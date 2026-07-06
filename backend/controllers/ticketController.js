const ticketService = require('../services/ticketService');

async function createTicket(req, res) {
  try {
    const ticket = await ticketService.createTicket(req.user, req.body);
    res.status(201).json({ success: true, message: 'Ticket created', data: ticket });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
  }
}

async function getTickets(req, res) {
  try {
    const result = await ticketService.getTickets(req.user, req.query);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
  }
}

async function getTicketById(req, res) {
  try {
    const ticket = await ticketService.getTicketById(req.params.id, req.user);
    res.json({ success: true, data: ticket });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
  }
}

async function updateTicket(req, res) {
  try {
    const ticket = await ticketService.updateTicket(req.params.id, req.user, req.body);
    res.json({ success: true, message: 'Ticket updated', data: ticket });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
  }
}

async function deleteTicket(req, res) {
  try {
    const result = await ticketService.deleteTicket(req.params.id, req.user);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
  }
}

module.exports = { createTicket, getTickets, getTicketById, updateTicket, deleteTicket };
