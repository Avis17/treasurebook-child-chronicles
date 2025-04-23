
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { VERIFICATION_STATUS, ADMIN_EMAIL } from "@/lib/constants";

const PrivateRoute = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

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

  return <Outlet />;
};

export default PrivateRoute;
