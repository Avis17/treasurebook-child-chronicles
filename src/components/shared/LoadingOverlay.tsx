
import { Loader } from "lucide-react";

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  fullScreen?: boolean;
}

const LoadingOverlay = ({ isLoading, message = "Loading...", fullScreen = true }: LoadingOverlayProps) => {
  if (!isLoading) return null;

  return (
    <div className={`${fullScreen ? 'fixed inset-0' : 'absolute inset-0'} bg-black/50 z-50 flex items-center justify-center`}>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg flex items-center space-x-2">
        <Loader className="w-5 h-5 animate-spin" />
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
};

export default LoadingOverlay;
