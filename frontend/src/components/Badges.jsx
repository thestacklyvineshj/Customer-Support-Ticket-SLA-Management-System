import { STATUS_COLORS, PRIORITY_COLORS } from '../utils/constants';

export function StatusBadge({ status }) {
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[status] || 'bg-slate-100'}`}>
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${PRIORITY_COLORS[priority] || 'bg-slate-100'}`}>
      {priority}
    </span>
  );
}

export function SlaBadge({ status }) {
  const colors = {
    None: 'bg-green-100 text-green-800',
    'Response Breached': 'bg-yellow-100 text-yellow-800',
    'Resolution Breached': 'bg-orange-100 text-orange-800',
    'Both Breached': 'bg-red-100 text-red-800',
  };
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors[status] || 'bg-slate-100'}`}>
      {status}
    </span>
  );
}
