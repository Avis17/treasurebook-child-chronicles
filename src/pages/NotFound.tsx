
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const NotFound = () => {
  const location = useLocation();
  const { currentUser } = useAuth();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold text-gray-800 dark:text-white">404</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">Oops! Page not found</p>
        <p className="text-gray-500 dark:text-gray-500 max-w-md mx-auto">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="pt-4">
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link to={currentUser ? "/dashboard" : "/"}>
              Return to {currentUser ? "Dashboard" : "Home"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
