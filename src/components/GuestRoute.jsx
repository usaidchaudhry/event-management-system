import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../features/auth/authSlice.js';

// Login/Register are only for logged-out visitors. Logged-in users are sent onward.
export default function GuestRoute() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  if (isAuthenticated) {
    const from = location.state?.from;
    const target = from ? `${from.pathname}${from.search || ''}` : '/';
    return <Navigate to={target} replace />;
  }
  return <Outlet />;
}
