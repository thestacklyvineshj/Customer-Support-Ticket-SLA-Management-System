const { SLA_HOURS } = require('../utils/constants');

function addHours(date, hours) {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

function formatDateTime(date) {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

function calculateDeadlines(priority, createdAt = new Date()) {
  const sla = SLA_HOURS[priority] || SLA_HOURS.Medium;
  return {
    responseDeadline: formatDateTime(addHours(createdAt, sla.response)),
    resolutionDeadline: formatDateTime(addHours(createdAt, sla.resolution)),
  };
}

function computeBreachedStatus(sla, firstResponseAt, resolvedAt, now = new Date()) {
  const responseDeadline = new Date(sla.response_deadline);
  const resolutionDeadline = new Date(sla.resolution_deadline);

  const responseBreached = firstResponseAt
    ? new Date(firstResponseAt) > responseDeadline
    : now > responseDeadline;

  const resolutionBreached = resolvedAt
    ? new Date(resolvedAt) > resolutionDeadline
    : now > resolutionDeadline;

  if (responseBreached && resolutionBreached) return 'Both Breached';
  if (responseBreached) return 'Response Breached';
  if (resolutionBreached) return 'Resolution Breached';
  return 'None';
}

module.exports = {
  calculateDeadlines,
  computeBreachedStatus,
  formatDateTime,
};
