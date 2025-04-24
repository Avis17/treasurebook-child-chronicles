
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { VERIFICATION_STATUS, ADMIN_EMAIL } from "@/lib/constants";

const PrivateRoute = () => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Block all non-authenticated users
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Skip all checks for admin
  if (currentUser.email === ADMIN_EMAIL) {
    return <Outlet />;
  }

  // Block non-approved users
  if (currentUser.verificationStatus !== VERIFICATION_STATUS.APPROVED) {
    return <Navigate to="/verification-pending" replace />;
  }

  // Check storage permission for storage routes
  const isStorageRoute = ['/gallery', '/documents'].includes(location.pathname);
  if (isStorageRoute && !currentUser.permissions?.storage) {
    return <Navigate to="/dashboard" replace />;
  }

  // Check AI insights permission for AI insights route
  const isAIInsightsRoute = location.pathname === '/ai-insights';
  if (isAIInsightsRoute && !currentUser.permissions?.aiInsights) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
