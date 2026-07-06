const pool = require('../config/db');
const { computeBreachedStatus } = require('./slaService');

async function getAllSla(user) {
  if (user.role !== 'ADMIN') {
    throw { status: 403, message: 'Access denied' };
  }

  const [rows] = await pool.execute(
    `SELECT s.*, t.ticket_title, t.priority, t.status, t.created_at as ticket_created,
      c.name as customer_name, a.name as agent_name
     FROM sla_tracking s
     JOIN tickets t ON s.ticket_id = t.id
     LEFT JOIN users c ON t.customer_id = c.id
     LEFT JOIN users a ON t.assigned_agent_id = a.id
     ORDER BY s.breached_status DESC, s.resolution_deadline ASC`
  );

  return rows.map((row) => {
    const now = new Date();
    const responseOverdue = new Date(row.response_deadline) < now && row.status === 'Open';
    const resolutionOverdue =
      new Date(row.resolution_deadline) < now && !['Resolved', 'Closed'].includes(row.status);

    return {
      ...row,
      is_response_overdue: responseOverdue,
      is_resolution_overdue: resolutionOverdue,
    };
  });
}

async function updateSla(ticketId, user, data) {
  if (user.role !== 'ADMIN') {
    throw { status: 403, message: 'Access denied' };
  }

  const [existing] = await pool.execute('SELECT * FROM sla_tracking WHERE ticket_id = ?', [ticketId]);
  if (existing.length === 0) {
    throw { status: 404, message: 'SLA record not found' };
  }

  const updates = [];
  const params = [];

  if (data.response_deadline) {
    updates.push('response_deadline = ?');
    params.push(data.response_deadline);
  }
  if (data.resolution_deadline) {
    updates.push('resolution_deadline = ?');
    params.push(data.resolution_deadline);
  }

  if (updates.length === 0) {
    throw { status: 400, message: 'No valid fields to update' };
  }

  params.push(ticketId);
  await pool.execute(`UPDATE sla_tracking SET ${updates.join(', ')} WHERE ticket_id = ?`, params);

  const [firstComment] = await pool.execute(
    'SELECT MIN(created_at) as first_response FROM ticket_comments WHERE ticket_id = ?',
    [ticketId]
  );
  const [ticket] = await pool.execute('SELECT updated_at, status FROM tickets WHERE id = ?', [ticketId]);
  const resolvedAt = ['Resolved', 'Closed'].includes(ticket[0].status) ? ticket[0].updated_at : null;

  const breached = computeBreachedStatus(
    { ...existing[0], ...data },
    firstComment[0].first_response,
    resolvedAt
  );

  await pool.execute('UPDATE sla_tracking SET breached_status = ? WHERE ticket_id = ?', [
    breached,
    ticketId,
  ]);

  const [rows] = await pool.execute(
    `SELECT s.*, t.ticket_title, t.priority, t.status
     FROM sla_tracking s JOIN tickets t ON s.ticket_id = t.id
     WHERE s.ticket_id = ?`,
    [ticketId]
  );

  return rows[0];
}

async function refreshSlaBreachStatus(ticketId) {
  const [slaRows] = await pool.execute('SELECT * FROM sla_tracking WHERE ticket_id = ?', [ticketId]);
  if (slaRows.length === 0) return;

  const [firstComment] = await pool.execute(
    'SELECT MIN(created_at) as first_response FROM ticket_comments WHERE ticket_id = ?',
    [ticketId]
  );

  const [ticket] = await pool.execute('SELECT updated_at, status FROM tickets WHERE id = ?', [ticketId]);
  const resolvedAt = ['Resolved', 'Closed'].includes(ticket[0].status) ? ticket[0].updated_at : null;

  const breached = computeBreachedStatus(
    slaRows[0],
    firstComment[0].first_response,
    resolvedAt
  );

  await pool.execute('UPDATE sla_tracking SET breached_status = ? WHERE ticket_id = ?', [
    breached,
    ticketId,
  ]);
}

module.exports = { getAllSla, updateSla, refreshSlaBreachStatus };
