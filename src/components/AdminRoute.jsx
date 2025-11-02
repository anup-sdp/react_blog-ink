// src/components/AdminRoute.jsx
import { Navigate } from 'react-router';
import useAuthContext from '../hooks/useAuthContext';

function AdminRoute({ children }) {
  const { user, isLoading } = useAuthContext();
  if (isLoading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        Loading...
      </div>
    );
  } 
  return user && (user.is_staff || user.is_superuser) ? children : <Navigate to="/" />;
}

export default AdminRoute;