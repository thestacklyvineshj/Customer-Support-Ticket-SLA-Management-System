import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../services';
import StatCard from '../components/StatCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { StatusPieChart, PriorityBarChart } from '../charts/DashboardCharts';
import { StatusBadge } from '../components/Badges';
import toast from 'react-hot-toast';

export default function CustomerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.customer()
      .then((res) => setData(res.data.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton type="card" count={3} />;

  const { summary, ticketsByStatus, ticketsByPriority, recentTickets } = data || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Track your support requests</p>
        </div>
        <Link
          to="/customer/create"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
        >
          + Create Ticket
        </Link>
      </div>

      <StatCard title="Total Tickets" value={summary?.totalTickets ?? 0} color="blue" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold mb-4">Tickets by Status</h3>
          <StatusPieChart data={ticketsByStatus?.map((d) => ({ status: d.status, count: d.count }))} />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold mb-4">Tickets by Priority</h3>
          <PriorityBarChart data={ticketsByPriority} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold mb-4">Recent Tickets</h3>
        {recentTickets?.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">No tickets yet. Create your first support request!</p>
        ) : (
          <div className="space-y-3">
            {recentTickets?.map((t) => (
              <Link key={t.id} to={`/tickets/${t.id}`} className="flex justify-between items-center p-3 rounded-lg border border-slate-100 hover:bg-slate-50">
                <div>
                  <p className="font-medium text-sm">#{t.id} {t.ticket_title}</p>
                  <p className="text-xs text-slate-500">Agent: {t.agent_name || 'Not assigned'}</p>
                </div>
                <StatusBadge status={t.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
