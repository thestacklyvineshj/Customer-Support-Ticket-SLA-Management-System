import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ticketAPI, authAPI } from '../services';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, PriorityBadge, SlaBadge } from '../components/Badges';
import { formatDate } from '../utils/helpers';
import { TICKET_STATUSES } from '../utils/constants';
import LoadingSkeleton from '../components/LoadingSkeleton';
import toast from 'react-hot-toast';

export default function TicketDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [statusUpdate, setStatusUpdate] = useState('');
  const [assignAgent, setAssignAgent] = useState('');

  const loadData = async () => {
    try {
      const [ticketRes, commentsRes] = await Promise.all([
        ticketAPI.getById(id),
        ticketAPI.getComments(id),
      ]);
      setTicket(ticketRes.data.data);
      setComments(commentsRes.data.data);
      setStatusUpdate(ticketRes.data.data.status);
      setAssignAgent(ticketRes.data.data.assigned_agent_id || '');

      if (user.role === 'ADMIN') {
        const agentsRes = await authAPI.getUsers('SUPPORT_AGENT');
        setAgents(agentsRes.data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load ticket');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [id]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      await ticketAPI.addComment(id, comment);
      setComment('');
      toast.success('Comment added');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add comment');
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await ticketAPI.update(id, { status: statusUpdate });
      toast.success('Status updated');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleAssign = async () => {
    if (!assignAgent) return;
    try {
      await ticketAPI.update(id, { assigned_agent_id: parseInt(assignAgent) });
      toast.success('Agent assigned');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign agent');
    }
  };

  if (loading) return <LoadingSkeleton type="page" />;
  if (!ticket) return <p className="text-center text-slate-500 py-12">Ticket not found</p>;

  const canUpdateStatus = user.role === 'ADMIN' || user.role === 'SUPPORT_AGENT';
  const isAdmin = user.role === 'ADMIN';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-sm text-slate-500 font-mono">Ticket #{ticket.id}</p>
            <h1 className="text-xl font-bold text-slate-900 mt-1">{ticket.ticket_title}</h1>
          </div>
          <div className="flex gap-2">
            <PriorityBadge priority={ticket.priority} />
            <StatusBadge status={ticket.status} />
          </div>
        </div>
        <p className="text-slate-700 whitespace-pre-wrap">{ticket.ticket_description}</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t border-slate-100 text-sm">
          <div><span className="text-slate-500">Category</span><p className="font-medium">{ticket.category}</p></div>
          <div><span className="text-slate-500">Customer</span><p className="font-medium">{ticket.customer_name}</p></div>
          <div><span className="text-slate-500">Agent</span><p className="font-medium">{ticket.agent_name || 'Unassigned'}</p></div>
          <div><span className="text-slate-500">Created</span><p className="font-medium">{formatDate(ticket.created_at)}</p></div>
        </div>
        {ticket.breached_status && (
          <div className="mt-4 p-3 bg-slate-50 rounded-lg flex flex-wrap gap-4 items-center text-sm">
            <span>SLA Status: <SlaBadge status={ticket.breached_status} /></span>
            <span className="text-slate-500">Response by: {formatDate(ticket.response_deadline)}</span>
            <span className="text-slate-500">Resolution by: {formatDate(ticket.resolution_deadline)}</span>
          </div>
        )}
      </div>

      {canUpdateStatus && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h3 className="font-semibold">Ticket Management</h3>
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Update Status</label>
              <select
                value={statusUpdate}
                onChange={(e) => setStatusUpdate(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                {TICKET_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <button onClick={handleStatusUpdate} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
              Update Status
            </button>
          </div>
          {isAdmin && (
            <div className="flex flex-wrap gap-3 items-end pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Assign Agent</label>
                <select
                  value={assignAgent}
                  onChange={(e) => setAssignAgent(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm min-w-[180px]"
                >
                  <option value="">Select agent</option>
                  {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <button onClick={handleAssign} className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">
                Assign
              </button>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold mb-4">Comments ({comments.length})</h3>
        <div className="space-y-4 mb-6">
          {comments.length === 0 ? (
            <p className="text-slate-400 text-sm">No comments yet</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="p-3 bg-slate-50 rounded-lg">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span className="font-medium text-slate-700">{c.user_name} ({c.user_role})</span>
                  <span>{formatDate(c.created_at)}</span>
                </div>
                <p className="text-sm text-slate-700">{c.comment}</p>
              </div>
            ))
          )}
        </div>
        <form onSubmit={handleComment} className="flex gap-3">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
            Post
          </button>
        </form>
      </div>
    </div>
  );
}
