// src/components/AdminRoute.jsx
import { Navigate } from 'react-router';
import useAuthContext from '../hooks/useAuthContext';

function AdminRoute({ children }) {
  const { user } = useAuthContext();
  return user && (user.is_staff || user.is_superuser) ? children : <Navigate to="/" />;
}

export default AdminRoute;