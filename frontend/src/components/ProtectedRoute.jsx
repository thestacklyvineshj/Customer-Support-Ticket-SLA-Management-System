import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSkeleton from './LoadingSkeleton';

export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSkeleton type="page" />;

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const redirect = user.role === 'ADMIN' ? '/admin/dashboard'
      : user.role === 'SUPPORT_AGENT' ? '/agent/dashboard'
      : '/customer/dashboard';
    return <Navigate to={redirect} replace />;
  }

  return <Outlet />;
}
