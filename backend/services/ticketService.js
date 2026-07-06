const pool = require('../config/db');
const { calculateDeadlines } = require('./slaService');
const { VALID_STATUS_TRANSITIONS } = require('../utils/constants');
const { logActivity } = require('../utils/activityLogger');

function buildTicketQuery(user, filters) {
  const { search, priority, status, page = 1, limit = 10 } = filters;
  const conditions = [];
  const params = [];

  if (user.role === 'CUSTOMER') {
    conditions.push('t.customer_id = ?');
    params.push(user.id);
  } else if (user.role === 'SUPPORT_AGENT') {
    conditions.push('t.assigned_agent_id = ?');
    params.push(user.id);
  }

  if (search) {
    conditions.push('(t.ticket_title LIKE ? OR t.ticket_description LIKE ? OR t.category LIKE ?)');
    const term = `%${search}%`;
    params.push(term, term, term);
  }
  if (priority) {
    conditions.push('t.priority = ?');
    params.push(priority);
  }
  if (status) {
    conditions.push('t.status = ?');
    params.push(status);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (parseInt(page) - 1) * parseInt(limit);

  return { where, params, limit: parseInt(limit), offset };
}

async function getTickets(user, filters) {
  const { where, params, limit, offset } = buildTicketQuery(user, filters);

  const [countRows] = await pool.execute(
    `SELECT COUNT(*) as total FROM tickets t ${where}`,
    params
  );

  const [rows] = await pool.execute(
    `SELECT t.*, 
      c.name as customer_name, c.email as customer_email,
      a.name as agent_name, a.email as agent_email,
      s.response_deadline, s.resolution_deadline, s.breached_status
     FROM tickets t
     LEFT JOIN users c ON t.customer_id = c.id
     LEFT JOIN users a ON t.assigned_agent_id = a.id
     LEFT JOIN sla_tracking s ON t.id = s.ticket_id
     ${where}
     ORDER BY t.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    tickets: rows,
    pagination: {
      total: countRows[0].total,
      page: parseInt(filters.page) || 1,
      limit,
      totalPages: Math.ceil(countRows[0].total / limit),
    },
  };
}

async function getTicketById(id, user) {
  const [rows] = await pool.execute(
    `SELECT t.*, 
      c.name as customer_name, c.email as customer_email,
      a.name as agent_name, a.email as agent_email,
      s.id as sla_id, s.response_deadline, s.resolution_deadline, s.breached_status
     FROM tickets t
     LEFT JOIN users c ON t.customer_id = c.id
     LEFT JOIN users a ON t.assigned_agent_id = a.id
     LEFT JOIN sla_tracking s ON t.id = s.ticket_id
     WHERE t.id = ?`,
    [id]
  );

  if (rows.length === 0) {
    throw { status: 404, message: 'Ticket not found' };
  }

  const ticket = rows[0];
  if (user.role === 'CUSTOMER' && ticket.customer_id !== user.id) {
    throw { status: 403, message: 'Access denied' };
  }
  if (user.role === 'SUPPORT_AGENT' && ticket.assigned_agent_id !== user.id) {
    throw { status: 403, message: 'Access denied' };
  }

  return ticket;
}

async function createTicket(user, data) {
  const { ticket_title, ticket_description, priority, category } = data;
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [result] = await conn.execute(
      `INSERT INTO tickets (customer_id, ticket_title, ticket_description, priority, category, status)
       VALUES (?, ?, ?, ?, ?, 'Open')`,
      [user.id, ticket_title, ticket_description, priority, category]
    );

    const ticketId = result.insertId;
    const deadlines = calculateDeadlines(priority);

    await conn.execute(
      `INSERT INTO sla_tracking (ticket_id, response_deadline, resolution_deadline, breached_status)
       VALUES (?, ?, ?, 'None')`,
      [ticketId, deadlines.responseDeadline, deadlines.resolutionDeadline]
    );

    await conn.commit();
    await logActivity(user.id, `Created ticket #${ticketId}`, 'Tickets');

    return getTicketById(ticketId, { ...user, role: 'ADMIN' });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function updateTicket(id, user, data) {
  const ticket = await getTicketById(id, user.role === 'ADMIN' ? user : { ...user, role: 'ADMIN' });

  if (user.role === 'CUSTOMER') {
    throw { status: 403, message: 'Customers cannot update tickets' };
  }

  const updates = [];
  const params = [];

  if (data.status !== undefined) {
    const allowed = VALID_STATUS_TRANSITIONS[ticket.status] || [];
    if (!allowed.includes(data.status) && user.role !== 'ADMIN') {
      throw { status: 400, message: `Cannot transition from ${ticket.status} to ${data.status}` };
    }

    if (data.status === 'Closed') {
      await validateCloseTicket(id, ticket);
    }

    updates.push('status = ?');
    params.push(data.status);
  }

  if (data.priority !== undefined && user.role === 'ADMIN') {
    updates.push('priority = ?');
    params.push(data.priority);
  }

  if (data.assigned_agent_id !== undefined && user.role === 'ADMIN') {
    const [agent] = await pool.execute(
      "SELECT id FROM users WHERE id = ? AND role = 'SUPPORT_AGENT'",
      [data.assigned_agent_id]
    );
    if (agent.length === 0) {
      throw { status: 400, message: 'Invalid support agent' };
    }
    updates.push('assigned_agent_id = ?');
    params.push(data.assigned_agent_id);
  }

  if (updates.length === 0) {
    throw { status: 400, message: 'No valid fields to update' };
  }

  params.push(id);
  await pool.execute(`UPDATE tickets SET ${updates.join(', ')} WHERE id = ?`, params);

  if (data.status === 'Resolved' || data.status === 'Closed') {
    const { refreshSlaBreachStatus } = require('./slaTrackingService');
    await refreshSlaBreachStatus(id);
  }

  await logActivity(user.id, `Updated ticket #${id}`, 'Tickets');
  return getTicketById(id, user.role === 'ADMIN' ? user : { ...user, role: 'ADMIN' });
}

async function validateCloseTicket(ticketId, ticket) {
  if (!['Resolved', 'On Hold'].includes(ticket.status)) {
    throw {
      status: 400,
      message: 'Ticket must be Resolved (or On Hold) before it can be closed',
    };
  }

  const [comments] = await pool.execute(
    `SELECT tc.*, u.role FROM ticket_comments tc
     JOIN users u ON tc.user_id = u.id
     WHERE tc.ticket_id = ?`,
    [ticketId]
  );

  const hasAgentComment = comments.some((c) => c.role === 'SUPPORT_AGENT' || c.role === 'ADMIN');
  if (!hasAgentComment) {
    throw { status: 400, message: 'At least one agent resolution comment is required before closing' };
  }
}

async function deleteTicket(id, user) {
  if (user.role !== 'ADMIN') {
    throw { status: 403, message: 'Only admins can delete tickets' };
  }

  const [result] = await pool.execute('DELETE FROM tickets WHERE id = ?', [id]);
  if (result.affectedRows === 0) {
    throw { status: 404, message: 'Ticket not found' };
  }

  await logActivity(user.id, `Deleted ticket #${id}`, 'Tickets');
  return { message: 'Ticket deleted successfully' };
}

module.exports = {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
};
