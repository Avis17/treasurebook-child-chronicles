
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { VERIFICATION_STATUS } from "@/lib/constants";

const PrivateRoute = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Check verification status
  if (currentUser.verificationStatus === VERIFICATION_STATUS.PENDING ||
      currentUser.verificationStatus === VERIFICATION_STATUS.REJECTED) {
    return <Navigate to="/verification-pending" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
