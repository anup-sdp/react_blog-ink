// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router';
import useAuthContext from '../hooks/useAuthContext';

function ProtectedRoute({ children }) {
  const { user } = useAuthContext();
  return user ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;