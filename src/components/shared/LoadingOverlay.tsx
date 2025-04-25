
import { Loader } from "lucide-react";

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  fullScreen?: boolean;
  opacity?: number; // Add opacity control
}

const LoadingOverlay = ({ 
  isLoading, 
  message = "Loading...", 
  fullScreen = true,
  opacity = 0.5 // Default opacity
}: LoadingOverlayProps) => {
  if (!isLoading) return null;

  return (
    <div 
      className={`${fullScreen ? 'fixed inset-0' : 'absolute inset-0'} backdrop-blur-sm z-[1000] flex items-center justify-center`}
      style={{ backgroundColor: `rgba(0, 0, 0, ${opacity})` }}
    >
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center space-y-4">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
        <span className="font-medium text-gray-900 dark:text-gray-100 text-lg">{message}</span>
      </div>
    </div>
  );
};

export default LoadingOverlay;
