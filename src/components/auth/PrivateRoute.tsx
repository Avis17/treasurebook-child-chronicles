import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { VERIFICATION_STATUS, ADMIN_EMAIL } from "@/lib/constants";

interface PrivateRouteProps {
  children: React.ReactNode;
  requiresAdmin?: boolean;
  requirePermission?: string;
}

const PrivateRoute = ({ children, requiresAdmin = false, requirePermission }: PrivateRouteProps) => {
  const { currentUser, loading, isAdmin } = useAuth();
  const location = useLocation();

  console.log("PrivateRoute render", { 
    currentUser: currentUser?.email, 
    loading, 
    isAdmin,
    adminEmail: ADMIN_EMAIL,
    isAdminComparison: currentUser?.email === ADMIN_EMAIL,
    verificationStatus: currentUser?.verificationStatus,
    requirePermission
  });

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
    console.log("No current user, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Skip all checks for admin - this is the critical part
  if (currentUser.email === ADMIN_EMAIL) {
    console.log("Admin user detected in PrivateRoute, bypassing all checks");
    return <>{children}</>;
  }

  // Block non-approved users
  if (currentUser.verificationStatus !== VERIFICATION_STATUS.APPROVED) {
    console.log("User not approved, redirecting to verification pending");
    return <Navigate to="/verification-pending" replace />;
  }

  // If admin access is required but user is not admin
  if (requiresAdmin && !isAdmin) {
    console.log("Admin access required but user is not admin");
    return <Navigate to="/dashboard" replace />;
  }

  // Check for specific permission requirement
  if (requirePermission && !currentUser.permissions?.[requirePermission as keyof typeof currentUser.permissions]) {
    console.log(`${requirePermission} permission needed but not granted`);
    return <Navigate to="/dashboard" replace />;
  }

  // The code below can be removed now that we have a general permission check above
  // Keep this for backward compatibility temporarily
  // Check storage permission for storage routes
  const isStorageRoute = ['/gallery', '/documents'].includes(location.pathname);
  if (isStorageRoute && !currentUser.permissions?.storage) {
    console.log("Storage permission needed but not granted");
    return <Navigate to="/dashboard" replace />;
  }

  // Check AI insights permission for AI insights route
  const isAIInsightsRoute = location.pathname === '/ai-insights';
  if (isAIInsightsRoute && !currentUser.permissions?.aiInsights) {
    console.log("AI insights permission needed but not granted");
    return <Navigate to="/dashboard" replace />;
  }

  // Check Quiz permission for quizzes routes
  const isQuizRoute = location.pathname === '/quizzes';
  if (isQuizRoute && !currentUser.permissions?.quiz) {
    console.log("Quiz permission needed but not granted");
    return <Navigate to="/dashboard" replace />;
  }

  // Check Voice Practice permission for voice practice routes
  const isVoicePracticeRoute = location.pathname === '/voice-practice';
  if (isVoicePracticeRoute && !currentUser.permissions?.voicePractice) {
    console.log("Voice Practice permission needed but not granted");
    return <Navigate to="/dashboard" replace />;
  }

  // Check Fun Learning permission for fun learning routes
  const isFunLearningRoute = location.pathname === '/fun-learning' || location.pathname.startsWith('/fun-learning/');
  if (isFunLearningRoute && !currentUser.permissions?.funLearning) {
    console.log("Fun Learning permission needed but not granted");
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
