import { Link } from 'react-router-dom';
import { StatusBadge, PriorityBadge } from './Badges';
import { formatDate } from '../utils/helpers';

export default function TicketTable({ tickets, showCustomer = false, showAgent = false }) {
  if (tickets.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p className="text-lg font-medium">No tickets found</p>
        <p className="text-sm mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-slate-500">
            <th className="pb-3 pr-4 font-medium">ID</th>
            <th className="pb-3 pr-4 font-medium">Title</th>
            {showCustomer && <th className="pb-3 pr-4 font-medium">Customer</th>}
            {showAgent && <th className="pb-3 pr-4 font-medium">Agent</th>}
            <th className="pb-3 pr-4 font-medium">Priority</th>
            <th className="pb-3 pr-4 font-medium">Status</th>
            <th className="pb-3 pr-4 font-medium">Created</th>
            <th className="pb-3 font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-3 pr-4 font-mono text-slate-600">#{ticket.id}</td>
              <td className="py-3 pr-4 font-medium max-w-[200px] truncate">{ticket.ticket_title}</td>
              {showCustomer && <td className="py-3 pr-4 text-slate-600">{ticket.customer_name || '—'}</td>}
              {showAgent && <td className="py-3 pr-4 text-slate-600">{ticket.agent_name || 'Unassigned'}</td>}
              <td className="py-3 pr-4"><PriorityBadge priority={ticket.priority} /></td>
              <td className="py-3 pr-4"><StatusBadge status={ticket.status} /></td>
              <td className="py-3 pr-4 text-slate-500">{formatDate(ticket.created_at)}</td>
              <td className="py-3">
                <Link
                  to={`/tickets/${ticket.id}`}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
