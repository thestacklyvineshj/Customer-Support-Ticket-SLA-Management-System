import { useState, useEffect } from 'react';
import { dashboardAPI } from '../services';
import StatCard from '../components/StatCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { StatusPieChart, PriorityBarChart, SlaBreachGauge, AgentResolutionChart, MonthlyTrendChart } from '../charts/DashboardCharts';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.admin()
      .then((res) => setData(res.data.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton type="card" count={4} />;

  const { summary, ticketsByStatus, ticketsByPriority, slaBreachPercentage, agentResolutions, monthlyTrends, recentActivity } = data || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Support analytics and SLA monitoring overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Tickets" value={summary?.totalTickets ?? 0} color="blue" />
        <StatCard title="Open Tickets" value={summary?.openTickets ?? 0} color="orange" />
        <StatCard title="Total Users" value={summary?.totalUsers ?? 0} color="purple" />
        <StatCard title="SLA Breach Rate" value={`${summary?.slaBreachPercentage ?? 0}%`} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Tickets by Status">
          <StatusPieChart data={ticketsByStatus} />
        </ChartCard>
        <ChartCard title="Tickets by Priority">
          <PriorityBarChart data={ticketsByPriority} />
        </ChartCard>
        <ChartCard title="SLA Breach Percentage">
          <SlaBreachGauge percentage={slaBreachPercentage ?? 0} />
        </ChartCard>
        <ChartCard title="Agent-wise Resolution Count">
          <AgentResolutionChart data={agentResolutions} />
        </ChartCard>
      </div>

      <ChartCard title="Monthly Ticket Trends">
        <MonthlyTrendChart data={monthlyTrends} />
      </ChartCard>

      {recentActivity?.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Recent Activity</h3>
          <div className="space-y-2">
            {recentActivity.map((a) => (
              <div key={a.id} className="flex justify-between text-sm py-2 border-b border-slate-100 last:border-0">
                <span><span className="font-medium">{a.user_name}</span> — {a.activity}</span>
                <span className="text-slate-400 text-xs">{new Date(a.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <h3 className="font-semibold text-slate-900 mb-4">{title}</h3>
      {children}
    </div>
  );
}
