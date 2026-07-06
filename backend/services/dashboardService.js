const pool = require('../config/db');

async function getAdminDashboard() {
  const [statusCounts] = await pool.execute(
    `SELECT status, COUNT(*) as count FROM tickets GROUP BY status`
  );
  const [priorityCounts] = await pool.execute(
    `SELECT priority, COUNT(*) as count FROM tickets GROUP BY priority`
  );
  const [slaStats] = await pool.execute(
    `SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN breached_status != 'None' THEN 1 ELSE 0 END) as breached
     FROM sla_tracking`
  );
  const [agentResolutions] = await pool.execute(
    `SELECT u.name as agent_name, COUNT(*) as resolution_count
     FROM tickets t
     JOIN users u ON t.assigned_agent_id = u.id
     WHERE t.status IN ('Resolved', 'Closed')
     GROUP BY u.id, u.name
     ORDER BY resolution_count DESC`
  );
  const [monthlyTrends] = await pool.execute(
    `SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count
     FROM tickets
     WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
     GROUP BY DATE_FORMAT(created_at, '%Y-%m')
     ORDER BY month ASC`
  );
  const [totalTickets] = await pool.execute('SELECT COUNT(*) as total FROM tickets');
  const [openTickets] = await pool.execute(
    "SELECT COUNT(*) as total FROM tickets WHERE status NOT IN ('Resolved', 'Closed')"
  );
  const [totalUsers] = await pool.execute('SELECT COUNT(*) as total FROM users');
  const [recentActivity] = await pool.execute(
    `SELECT al.*, u.name as user_name FROM activity_logs al
     JOIN users u ON al.user_id = u.id
     ORDER BY al.created_at DESC LIMIT 10`
  );

  const slaTotal = slaStats[0].total || 0;
  const slaBreached = slaStats[0].breached || 0;

  return {
    summary: {
      totalTickets: totalTickets[0].total,
      openTickets: openTickets[0].total,
      totalUsers: totalUsers[0].total,
      slaBreachPercentage: slaTotal > 0 ? Math.round((slaBreached / slaTotal) * 100) : 0,
    },
    ticketsByStatus: statusCounts,
    ticketsByPriority: priorityCounts,
    slaBreachPercentage: slaTotal > 0 ? Math.round((slaBreached / slaTotal) * 100) : 0,
    agentResolutions,
    monthlyTrends,
    recentActivity,
  };
}

async function getAgentDashboard(agentId) {
  const [assigned] = await pool.execute(
    'SELECT COUNT(*) as total FROM tickets WHERE assigned_agent_id = ?',
    [agentId]
  );
  const [byStatus] = await pool.execute(
    `SELECT status, COUNT(*) as count FROM tickets 
     WHERE assigned_agent_id = ? GROUP BY status`,
    [agentId]
  );
  const [resolved] = await pool.execute(
    `SELECT COUNT(*) as total FROM tickets 
     WHERE assigned_agent_id = ? AND status IN ('Resolved', 'Closed')`,
    [agentId]
  );
  const [recentTickets] = await pool.execute(
    `SELECT t.*, c.name as customer_name
     FROM tickets t
     LEFT JOIN users c ON t.customer_id = c.id
     WHERE t.assigned_agent_id = ?
     ORDER BY t.updated_at DESC LIMIT 5`,
    [agentId]
  );
  const [slaBreaches] = await pool.execute(
    `SELECT COUNT(*) as total FROM sla_tracking s
     JOIN tickets t ON s.ticket_id = t.id
     WHERE t.assigned_agent_id = ? AND s.breached_status != 'None'`,
    [agentId]
  );

  return {
    summary: {
      assignedTickets: assigned[0].total,
      resolvedTickets: resolved[0].total,
      slaBreaches: slaBreaches[0].total,
    },
    ticketsByStatus: byStatus,
    recentTickets,
  };
}

async function getCustomerDashboard(customerId) {
  const [total] = await pool.execute(
    'SELECT COUNT(*) as total FROM tickets WHERE customer_id = ?',
    [customerId]
  );
  const [byStatus] = await pool.execute(
    `SELECT status, COUNT(*) as count FROM tickets 
     WHERE customer_id = ? GROUP BY status`,
    [customerId]
  );
  const [byPriority] = await pool.execute(
    `SELECT priority, COUNT(*) as count FROM tickets 
     WHERE customer_id = ? GROUP BY priority`,
    [customerId]
  );
  const [recentTickets] = await pool.execute(
    `SELECT t.*, a.name as agent_name
     FROM tickets t
     LEFT JOIN users a ON t.assigned_agent_id = a.id
     WHERE t.customer_id = ?
     ORDER BY t.created_at DESC LIMIT 5`,
    [customerId]
  );

  return {
    summary: { totalTickets: total[0].total },
    ticketsByStatus: byStatus,
    ticketsByPriority: byPriority,
    recentTickets,
  };
}

module.exports = { getAdminDashboard, getAgentDashboard, getCustomerDashboard };
