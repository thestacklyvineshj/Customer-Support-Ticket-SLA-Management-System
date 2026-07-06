import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatRole } from '../utils/helpers';

const navItems = {
  ADMIN: [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/tickets', label: 'All Tickets' },
    { to: '/admin/assign', label: 'Assignment' },
    { to: '/admin/sla', label: 'SLA Monitor' },
    { to: '/admin/users', label: 'Users' },
  ],
  SUPPORT_AGENT: [
    { to: '/agent/dashboard', label: 'Dashboard' },
    { to: '/agent/tickets', label: 'My Tickets' },
  ],
  CUSTOMER: [
    { to: '/customer/dashboard', label: 'Dashboard' },
    { to: '/customer/tickets', label: 'My Tickets' },
    { to: '/customer/create', label: 'Create Ticket' },
  ],
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = navItems[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <span className="text-xl font-bold text-blue-600">SupportDesk</span>
            <nav className="hidden md:flex gap-1">
              {items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-500">{formatRole(user?.role)}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </div>
        <nav className="md:hidden flex gap-1 px-4 pb-2 overflow-x-auto">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                  isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}