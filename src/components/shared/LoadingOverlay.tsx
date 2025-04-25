
import { Loader } from "lucide-react";

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  fullScreen?: boolean;
}

const LoadingOverlay = ({ isLoading, message = "Loading...", fullScreen = true }: LoadingOverlayProps) => {
  if (!isLoading) return null;

  return (
    <div className={`${fullScreen ? 'fixed inset-0' : 'absolute inset-0'} bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center`}>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg flex items-center space-x-3">
        <Loader className="w-6 h-6 animate-spin text-blue-500" />
        <span className="font-medium text-gray-900 dark:text-gray-100">{message}</span>
      </div>
    </div>
  );
};

export default LoadingOverlay;
