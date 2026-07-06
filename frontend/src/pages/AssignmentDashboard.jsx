import { useTickets } from '../hooks/useTickets';
import { ticketAPI, authAPI } from '../services';
import TicketTable from '../components/TicketTable';
import LoadingSkeleton from '../components/LoadingSkeleton';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';

export default function AssignmentDashboard() {
  const { tickets, loading, refetch } = useTickets({ status: 'Open' });
  const [agents, setAgents] = useState([]);
  const [assignments, setAssignments] = useState({});

  useEffect(() => {
    authAPI.getUsers('SUPPORT_AGENT')
      .then((res) => setAgents(res.data.data))
      .catch(() => toast.error('Failed to load agents'));
  }, []);

  const unassigned = tickets.filter((t) => !t.assigned_agent_id);

  const handleAssign = async (ticketId) => {
    const agentId = assignments[ticketId];
    if (!agentId) {
      toast.error('Please select an agent');
      return;
    }
    try {
      await ticketAPI.update(ticketId, { assigned_agent_id: parseInt(agentId), status: 'In Progress' });
      toast.success('Ticket assigned successfully');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Assignment failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Ticket Assignment</h1>
        <p className="text-slate-500 text-sm mt-1">Assign open tickets to support agents</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold mb-4">Unassigned Open Tickets ({unassigned.length})</h3>
        {loading ? (
          <LoadingSkeleton type="table" count={3} />
        ) : unassigned.length === 0 ? (
          <p className="text-slate-400 text-center py-8">All open tickets are assigned</p>
        ) : (
          <div className="space-y-3">
            {unassigned.map((t) => (
              <div key={t.id} className="flex flex-wrap items-center gap-4 p-4 border border-slate-100 rounded-lg">
                <div className="flex-1 min-w-[200px]">
                  <p className="font-medium">#{t.id} {t.ticket_title}</p>
                  <p className="text-xs text-slate-500">{t.customer_name} · {t.priority} · {t.category}</p>
                </div>
                <select
                  value={assignments[t.id] || ''}
                  onChange={(e) => setAssignments({ ...assignments, [t.id]: e.target.value })}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="">Select agent</option>
                  {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
                <button
                  onClick={() => handleAssign(t.id)}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                >
                  Assign
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold mb-4">All Open Tickets</h3>
        {loading ? <LoadingSkeleton type="table" /> : <TicketTable tickets={tickets} showCustomer showAgent />}
      </div>
    </div>
  );
}
