// src/AppRoutes.jsx
import { Routes, Route } from 'react-router';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminProfile from './pages/AdminProfile';
import MyPayments from './pages/MyPayments';
import AllPayments from './pages/AllPayments';
import Activate from './pages/Activate';
import PasswordResetConfirm from './pages/PasswordResetConfirm';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/activate/:uid/:token" element={<Activate />} />
      <Route path="/password/reset/confirm/:uid/:token" element={<PasswordResetConfirm />} />
      
      {/* Protected Routes */}
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      <Route path="/admin-profile" element={
        <AdminRoute>
          <AdminProfile />
        </AdminRoute>
      } />
      <Route path="/my-payments" element={
        <ProtectedRoute>
          <MyPayments />
        </ProtectedRoute>
      } />
      <Route path="/all-payments" element={
        <AdminRoute>
          <AllPayments />
        </AdminRoute>
      } />
    </Routes>
  );
}

export default AppRoutes;