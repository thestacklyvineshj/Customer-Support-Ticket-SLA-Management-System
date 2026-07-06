import { useState, useEffect } from 'react';
import { authAPI } from '../services';
import { formatRole, formatDate } from '../utils/helpers';
import LoadingSkeleton from '../components/LoadingSkeleton';
import toast from 'react-hot-toast';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const loadUsers = () => {
    setLoading(true);
    authAPI.getUsers(roleFilter || undefined)
      .then((res) => setUsers(res.data.data))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
        <p className="text-slate-500 text-sm mt-1">View and manage system users</p>
      </div>

      <div className="flex gap-2">
        {['', 'ADMIN', 'SUPPORT_AGENT', 'CUSTOMER'].map((r) => (
          <button
            key={r || 'all'}
            onClick={() => setRoleFilter(r)}
            className={`px-4 py-2 text-sm rounded-lg ${
              roleFilter === r ? 'bg-blue-600 text-white' : 'bg-white border border-slate-300 text-slate-600'
            }`}
          >
            {r ? formatRole(r) : 'All Users'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        {loading ? (
          <LoadingSkeleton type="table" count={5} />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="p-4 font-medium">ID</th>
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 font-mono text-slate-600">{u.id}</td>
                  <td className="p-4 font-medium">{u.name}</td>
                  <td className="p-4 text-slate-600">{u.email}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {formatRole(u.role)}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500">{formatDate(u.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
