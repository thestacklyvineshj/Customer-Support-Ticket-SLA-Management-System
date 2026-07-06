const TICKET_STATUSES = ['Open', 'In Progress', 'On Hold', 'Resolved', 'Closed'];
const TICKET_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const USER_ROLES = ['ADMIN', 'SUPPORT_AGENT', 'CUSTOMER'];

const SLA_HOURS = {
  Low: { response: 24, resolution: 72 },
  Medium: { response: 12, resolution: 48 },
  High: { response: 4, resolution: 24 },
  Critical: { response: 1, resolution: 8 },
};

const VALID_STATUS_TRANSITIONS = {
  Open: ['In Progress', 'On Hold', 'Closed'],
  'In Progress': ['On Hold', 'Resolved', 'Open'],
  'On Hold': ['In Progress', 'Closed'],
  Resolved: ['Closed', 'In Progress'],
  Closed: [],
};

module.exports = {
  TICKET_STATUSES,
  TICKET_PRIORITIES,
  USER_ROLES,
  SLA_HOURS,
  VALID_STATUS_TRANSITIONS,
};
