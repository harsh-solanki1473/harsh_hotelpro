// HotelPro - Admin Route Component
// Restricts access to verified administrator accounts only
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <Loader message="Verifying administrator credentials..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    // Non-admin users are safely redirected to their user dashboard
    return <Navigate to="/user" replace />;
  }

  return children;
};

export default AdminRoute;
