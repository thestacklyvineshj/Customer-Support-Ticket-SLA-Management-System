import { TICKET_PRIORITIES, TICKET_STATUSES } from '../utils/constants';

export default function TicketFilters({ filters, onChange }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-3 items-end">
      <div className="flex-1 min-w-[200px]">
        <label className="block text-xs font-medium text-slate-500 mb-1">Search</label>
        <input
          type="text"
          placeholder="Search tickets..."
          value={filters.search || ''}
          onChange={(e) => onChange({ search: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>
      <div className="min-w-[140px]">
        <label className="block text-xs font-medium text-slate-500 mb-1">Priority</label>
        <select
          value={filters.priority || ''}
          onChange={(e) => onChange({ priority: e.target.value || undefined })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">All Priorities</option>
          {TICKET_PRIORITIES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>
      <div className="min-w-[140px]">
        <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
        <select
          value={filters.status || ''}
          onChange={(e) => onChange({ status: e.target.value || undefined })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">All Statuses</option>
          {TICKET_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <button
        onClick={() => onChange({ search: '', priority: undefined, status: undefined })}
        className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50"
      >
        Clear
      </button>
    </div>
  );
}
