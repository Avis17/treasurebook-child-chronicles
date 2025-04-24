
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { VERIFICATION_STATUS, ADMIN_EMAIL } from "@/lib/constants";

const PrivateRoute = () => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Check for storage-related routes and AI insights route
  const isStorageRoute = ['/gallery', '/documents'].includes(location.pathname);
  const isAIInsightsRoute = location.pathname === '/ai-insights';

  // Allow admin to always access private routes regardless of verification status
  if (currentUser && currentUser.email === ADMIN_EMAIL) {
    return <Outlet />;
  }

  // Block all non-admins if not approved
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.verificationStatus !== VERIFICATION_STATUS.APPROVED) {
    return <Navigate to="/verification-pending" replace />;
  }

  // Check storage permission for storage routes
  if (isStorageRoute && !currentUser.permissions?.storage) {
    return <Navigate to="/dashboard" replace />;
  }

  // Check AI insights permission for AI insights route
  if (isAIInsightsRoute && !currentUser.permissions?.aiInsights) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
