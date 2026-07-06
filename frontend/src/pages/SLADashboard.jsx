import { useState, useEffect } from 'react';
import { slaAPI } from '../services';
import { SlaBadge } from '../components/Badges';
import { StatusBadge, PriorityBadge } from '../components/Badges';
import { formatDate } from '../utils/helpers';
import LoadingSkeleton from '../components/LoadingSkeleton';
import toast from 'react-hot-toast';

export default function SLADashboard() {
  const [slaRecords, setSlaRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    slaAPI.getAll()
      .then((res) => setSlaRecords(res.data.data))
      .catch(() => toast.error('Failed to load SLA data'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = slaRecords.filter((s) => {
    if (filter === 'breached') return s.breached_status !== 'None';
    if (filter === 'ok') return s.breached_status === 'None';
    return true;
  });

  const breachCount = slaRecords.filter((s) => s.breached_status !== 'None').length;

  if (loading) return <LoadingSkeleton type="table" count={5} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">SLA Monitoring</h1>
        <p className="text-slate-500 text-sm mt-1">
          {breachCount} of {slaRecords.length} tickets have SLA breaches
        </p>
      </div>

      <div className="flex gap-2">
        {['all', 'breached', 'ok'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm rounded-lg capitalize ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f === 'ok' ? 'Compliant' : f}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="p-4 font-medium">Ticket</th>
              <th className="p-4 font-medium">Priority</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Customer</th>
              <th className="p-4 font-medium">Agent</th>
              <th className="p-4 font-medium">Response Deadline</th>
              <th className="p-4 font-medium">Resolution Deadline</th>
              <th className="p-4 font-medium">SLA Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="p-8 text-center text-slate-400">No SLA records found</td></tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4">
                    <p className="font-medium">#{s.ticket_id}</p>
                    <p className="text-xs text-slate-500 truncate max-w-[150px]">{s.ticket_title}</p>
                  </td>
                  <td className="p-4"><PriorityBadge priority={s.priority} /></td>
                  <td className="p-4"><StatusBadge status={s.status} /></td>
                  <td className="p-4 text-slate-600">{s.customer_name}</td>
                  <td className="p-4 text-slate-600">{s.agent_name || '—'}</td>
                  <td className="p-4 text-slate-500">{formatDate(s.response_deadline)}</td>
                  <td className="p-4 text-slate-500">{formatDate(s.resolution_deadline)}</td>
                  <td className="p-4"><SlaBadge status={s.breached_status} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
