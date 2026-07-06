import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketAPI } from '../services';
import { TICKET_PRIORITIES, CATEGORIES } from '../utils/constants';
import toast from 'react-hot-toast';

export default function CreateTicket() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    ticket_title: '',
    ticket_description: '',
    priority: 'Medium',
    category: 'General',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.ticket_title.trim()) errs.ticket_title = 'Title is required';
    if (!form.ticket_description.trim()) errs.ticket_description = 'Description is required';
    if (form.ticket_description.trim().length < 10) errs.ticket_description = 'Description must be at least 10 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await ticketAPI.create(form);
      toast.success('Ticket created successfully!');
      navigate(`/tickets/${data.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Create Support Ticket</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
          <input
            value={form.ticket_title}
            onChange={(e) => setForm({ ...form, ticket_title: e.target.value })}
            className={`w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${errors.ticket_title ? 'border-red-400' : 'border-slate-300'}`}
            placeholder="Brief summary of your issue"
          />
          {errors.ticket_title && <p className="text-red-500 text-xs mt-1">{errors.ticket_title}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
          <textarea
            rows={5}
            value={form.ticket_description}
            onChange={(e) => setForm({ ...form, ticket_description: e.target.value })}
            className={`w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none ${errors.ticket_description ? 'border-red-400' : 'border-slate-300'}`}
            placeholder="Describe your issue in detail..."
          />
          {errors.ticket_description && <p className="text-red-500 text-xs mt-1">{errors.ticket_description}</p>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            >
              {TICKET_PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Submitting...' : 'Submit Ticket'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
