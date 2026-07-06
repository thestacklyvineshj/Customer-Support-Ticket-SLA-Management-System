const pool = require('../config/db');
const { logActivity } = require('../utils/activityLogger');
const { refreshSlaBreachStatus } = require('./slaTrackingService');

async function addComment(ticketId, user, comment) {
  const [tickets] = await pool.execute('SELECT * FROM tickets WHERE id = ?', [ticketId]);
  if (tickets.length === 0) {
    throw { status: 404, message: 'Ticket not found' };
  }

  const ticket = tickets[0];

  if (user.role === 'CUSTOMER' && ticket.customer_id !== user.id) {
    throw { status: 403, message: 'Access denied' };
  }
  if (user.role === 'SUPPORT_AGENT' && ticket.assigned_agent_id !== user.id) {
    throw { status: 403, message: 'Access denied' };
  }

  const [result] = await pool.execute(
    'INSERT INTO ticket_comments (ticket_id, user_id, comment) VALUES (?, ?, ?)',
    [ticketId, user.id, comment]
  );

  await refreshSlaBreachStatus(ticketId);
  await logActivity(user.id, `Added comment on ticket #${ticketId}`, 'Comments');

  const [rows] = await pool.execute(
    `SELECT tc.*, u.name as user_name, u.role as user_role
     FROM ticket_comments tc
     JOIN users u ON tc.user_id = u.id
     WHERE tc.id = ?`,
    [result.insertId]
  );

  return rows[0];
}

async function getComments(ticketId, user) {
  const [tickets] = await pool.execute('SELECT * FROM tickets WHERE id = ?', [ticketId]);
  if (tickets.length === 0) {
    throw { status: 404, message: 'Ticket not found' };
  }

  const ticket = tickets[0];

  if (user.role === 'CUSTOMER' && ticket.customer_id !== user.id) {
    throw { status: 403, message: 'Access denied' };
  }
  if (user.role === 'SUPPORT_AGENT' && ticket.assigned_agent_id !== user.id) {
    throw { status: 403, message: 'Access denied' };
  }

  const [rows] = await pool.execute(
    `SELECT tc.*, u.name as user_name, u.role as user_role
     FROM ticket_comments tc
     JOIN users u ON tc.user_id = u.id
     WHERE tc.ticket_id = ?
     ORDER BY tc.created_at ASC`,
    [ticketId]
  );

  return rows;
}

module.exports = { addComment, getComments };
