import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function PrivateRoute({ roles }) {
  const { user, isAuth } = useAuth();

  if (!isAuth) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/404" replace />;
  return <Outlet />;
}
