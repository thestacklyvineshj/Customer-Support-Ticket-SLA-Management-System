import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, CartesianGrid } from 'recharts';
import { CHART_COLORS } from '../utils/constants';

export function StatusPieChart({ data }) {
  const chartData = data?.map((d) => ({ name: d.status, value: d.count })) || [];
  if (chartData.length === 0) return <EmptyChart message="No status data" />;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
          {chartData.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function PriorityBarChart({ data }) {
  const chartData = data?.map((d) => ({ name: d.priority, count: d.count })) || [];
  if (chartData.length === 0) return <EmptyChart message="No priority data" />;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function AgentResolutionChart({ data }) {
  const chartData = data?.map((d) => ({ name: d.agent_name, count: d.resolution_count })) || [];
  if (chartData.length === 0) return <EmptyChart message="No resolution data" />;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" allowDecimals={false} />
        <YAxis dataKey="name" type="category" width={100} />
        <Tooltip />
        <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function MonthlyTrendChart({ data }) {
  const chartData = data?.map((d) => ({ month: d.month, tickets: d.count })) || [];
  if (chartData.length === 0) return <EmptyChart message="No trend data" />;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Line type="monotone" dataKey="tickets" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function SlaBreachGauge({ percentage }) {
  const color = percentage > 50 ? '#ef4444' : percentage > 25 ? '#f59e0b' : '#10b981';
  return (
    <div className="flex flex-col items-center justify-center h-[280px]">
      <div className="relative w-40 h-40">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="12" />
          <circle
            cx="50" cy="50" r="40" fill="none"
            stroke={color} strokeWidth="12"
            strokeDasharray={`${percentage * 2.51} 251`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold text-slate-900">{percentage}%</span>
        </div>
      </div>
      <p className="text-sm text-slate-500 mt-2">SLA Breach Rate</p>
    </div>
  );
}

function EmptyChart({ message }) {
  return (
    <div className="h-[280px] flex items-center justify-center text-slate-400 text-sm">
      {message}
    </div>
  );
}
