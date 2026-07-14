import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from '../AppContext';

const ProtectedRoute = ({ adminOnly = false }) => {
  const { user, loading } = useApp();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
