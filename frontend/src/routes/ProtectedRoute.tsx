import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface RouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<RouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-xs">
        Authenticating session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role) && user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export const AdminRoute: React.FC = () => {
  return <ProtectedRoute allowedRoles={['ADMIN']} />;
};

export const AnalystRoute: React.FC = () => {
  return <ProtectedRoute allowedRoles={['ADMIN', 'ANALYST']} />;
};
