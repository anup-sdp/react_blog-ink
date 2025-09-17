// src/AppRoutes.jsx
import { Routes, Route } from 'react-router';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminProfile from './pages/AdminProfile';
import MyPayments from './pages/MyPayments';
import AllPayments from './pages/AllPayments';
import MyBlogs from './pages/MyBlogs';
import AllBlogs from './pages/AllBlogs';
import BlogForm from './pages/BlogForm';
import CategoryManagement from './pages/CategoryManagement'; // Add this import
import Activate from './pages/Activate';
import PasswordResetConfirm from './pages/PasswordResetConfirm';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFail from './pages/PaymentFail';
import PaymentCancel from './pages/PaymentCancel';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import BlogDetail from './pages/BlogDetails';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/activate/:uid/:token" element={<Activate />} />
      <Route path="/password/reset/confirm/:uid/:token" element={<PasswordResetConfirm />} />
      <Route path="/payment/success" element={<PaymentSuccess />} />
      <Route path="/payment/fail" element={<PaymentFail />} />
      <Route path="/payment/cancel" element={<PaymentCancel />} />
      
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
      <Route path="/my-blogs" element={
        <ProtectedRoute>
          <MyBlogs />
        </ProtectedRoute>
      } />
      <Route path="/all-blogs" element={
        <AdminRoute>
          <AllBlogs />
        </AdminRoute>
      } />
      <Route path="/category-management" element={
        <AdminRoute>
          <CategoryManagement />
        </AdminRoute>
      } />
      <Route path="/create-blog" element={
        <ProtectedRoute>
          <BlogForm />
        </ProtectedRoute>
      } />
      <Route path="/edit-blog/:id" element={
        <ProtectedRoute>
          <BlogForm />
        </ProtectedRoute>
      } />
	  <Route path="/blog/:id" element={
        <ProtectedRoute>
          <BlogDetail />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default AppRoutes;