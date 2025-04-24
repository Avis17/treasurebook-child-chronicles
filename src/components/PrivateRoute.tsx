
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiresAdmin?: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiresAdmin = false }) => {
  const { currentUser, isAdmin, loading } = useAuth();
  
  // Show loading state while checking authentication
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // Redirect to dashboard if admin access is required but user is not admin
  if (requiresAdmin && !isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  // Return the protected component if all conditions are met
  return <>{children}</>;
};

export default PrivateRoute;
