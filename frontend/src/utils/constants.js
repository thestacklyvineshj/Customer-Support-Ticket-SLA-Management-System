export const API_BASE = '/api';

export const ROLES = {
  ADMIN: 'ADMIN',
  SUPPORT_AGENT: 'SUPPORT_AGENT',
  CUSTOMER: 'CUSTOMER',
};

export const TICKET_STATUSES = ['Open', 'In Progress', 'On Hold', 'Resolved', 'Closed'];
export const TICKET_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
export const CATEGORIES = ['Billing', 'Technical', 'Account', 'General', 'Feature Request'];

export const STATUS_COLORS = {
  Open: 'bg-blue-100 text-blue-800',
  'In Progress': 'bg-yellow-100 text-yellow-800',
  'On Hold': 'bg-orange-100 text-orange-800',
  Resolved: 'bg-green-100 text-green-800',
  Closed: 'bg-slate-100 text-slate-800',
};

export const PRIORITY_COLORS = {
  Low: 'bg-slate-100 text-slate-700',
  Medium: 'bg-blue-100 text-blue-700',
  High: 'bg-orange-100 text-orange-700',
  Critical: 'bg-red-100 text-red-700',
};

export const SLA_COLORS = {
  None: 'bg-green-100 text-green-800',
  'Response Breached': 'bg-yellow-100 text-yellow-800',
  'Resolution Breached': 'bg-orange-100 text-orange-800',
  'Both Breached': 'bg-red-100 text-red-800',
};

export const CHART_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4'];
