import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoadingSkeleton from './components/LoadingSkeleton';

import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import AgentDashboard from './pages/AgentDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import CreateTicket from './pages/CreateTicket';
import TicketList from './pages/TicketList';
import TicketDetail from './pages/TicketDetail';
import SLADashboard from './pages/SLADashboard';
import UserManagement from './pages/UserManagement';
import AssignmentDashboard from './pages/AssignmentDashboard';
import { getDashboardPath } from './utils/helpers';

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSkeleton type="page" />;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={getDashboardPath(user.role)} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<RootRedirect />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/tickets/:id" element={<TicketDetail />} />

              <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/tickets" element={<TicketList title="All Tickets" showCustomer showAgent />} />
                <Route path="/admin/assign" element={<AssignmentDashboard />} />
                <Route path="/admin/sla" element={<SLADashboard />} />
                <Route path="/admin/users" element={<UserManagement />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['SUPPORT_AGENT']} />}>
                <Route path="/agent/dashboard" element={<AgentDashboard />} />
                <Route path="/agent/tickets" element={<TicketList title="Assigned Tickets" showCustomer />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['CUSTOMER']} />}>
                <Route path="/customer/dashboard" element={<CustomerDashboard />} />
                <Route path="/customer/tickets" element={<TicketList title="My Tickets" showAgent />} />
                <Route path="/customer/create" element={<CreateTicket />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
