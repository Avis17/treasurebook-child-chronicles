
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { VERIFICATION_STATUS, ADMIN_EMAIL } from "@/lib/constants";

const PrivateRoute = ({ children, requiresAdmin = false }: { children: React.ReactNode, requiresAdmin?: boolean }) => {
  const { currentUser, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Block all non-authenticated users
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Skip all checks for admin
  if (currentUser.email === ADMIN_EMAIL) {
    return <>{children}</>;
  }

  // Block non-approved users
  if (currentUser.verificationStatus !== VERIFICATION_STATUS.APPROVED) {
    return <Navigate to="/verification-pending" replace />;
  }

  // If admin access is required but user is not admin
  if (requiresAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
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

  return <>{children}</>;
};

export default PrivateRoute;
