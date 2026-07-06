export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function formatRole(role) {
  const map = {
    ADMIN: 'Admin',
    SUPPORT_AGENT: 'Support Agent',
    CUSTOMER: 'Customer',
  };
  return map[role] || role;
}

export function getDashboardPath(role) {
  const paths = {
    ADMIN: '/admin/dashboard',
    SUPPORT_AGENT: '/agent/dashboard',
    CUSTOMER: '/customer/dashboard',
  };
  return paths[role] || '/login';
}
