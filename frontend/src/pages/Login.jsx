import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const user = await login(form);
      toast.success('Welcome back!');
      const path = user.role === 'ADMIN' ? '/admin/dashboard'
        : user.role === 'SUPPORT_AGENT' ? '/agent/dashboard'
        : '/customer/dashboard';
      navigate(path);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">SupportDesk</h1>
          <p className="text-slate-500 mt-2">Customer Support & SLA Management</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 space-y-5">
          <h2 className="text-xl font-semibold text-slate-900">Sign In</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <p className="text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 font-medium hover:underline">Register</Link>
          </p>
        </form>
        <div className="mt-6 bg-white/60 rounded-xl p-4 text-xs text-slate-500 space-y-1">
          <p className="font-medium text-slate-700">Test Credentials (password: password123)</p>
          <p>Admin: admin@support.com</p>
          <p>Agent: agent@support.com</p>
          <p>Customer: customer@support.com</p>
        </div>
      </div>
    </div>
  );
}
