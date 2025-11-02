// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router';
import useAuthContext from '../hooks/useAuthContext';

function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuthContext();
  if (isLoading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        Loading...
      </div>
    );
  }  
  return user ? children : <Navigate to="/login" replace />;
}

export default ProtectedRoute;