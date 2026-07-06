import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../services';
import StatCard from '../components/StatCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { StatusBadge } from '../components/Badges';
import { StatusPieChart } from '../charts/DashboardCharts';
import toast from 'react-hot-toast';

export default function AgentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.agent()
      .then((res) => setData(res.data.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton type="card" count={3} />;

  const { summary, ticketsByStatus, recentTickets } = data || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Agent Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Your assigned tickets and performance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Assigned Tickets" value={summary?.assignedTickets ?? 0} color="blue" />
        <StatCard title="Resolved" value={summary?.resolvedTickets ?? 0} color="green" />
        <StatCard title="SLA Breaches" value={summary?.slaBreaches ?? 0} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold mb-4">Tickets by Status</h3>
          <StatusPieChart data={ticketsByStatus?.map((d) => ({ status: d.status, count: d.count }))} />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold mb-4">Recent Assigned Tickets</h3>
          {recentTickets?.length === 0 ? (
            <p className="text-slate-400 text-sm py-8 text-center">No assigned tickets yet</p>
          ) : (
            <div className="space-y-3">
              {recentTickets?.map((t) => (
                <Link key={t.id} to={`/tickets/${t.id}`} className="block p-3 rounded-lg border border-slate-100 hover:bg-slate-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">#{t.id} {t.ticket_title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{t.customer_name}</p>
                    </div>
                    <StatusBadge status={t.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
