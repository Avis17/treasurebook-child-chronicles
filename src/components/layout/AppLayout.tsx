
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useIsMobile } from "@/hooks/use-mobile";
import Sidebar from "@/components/navigation/Sidebar";
import Footer from "./Footer";
import { Menu, X } from "lucide-react"; // Icons

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  hideHeader?: boolean;
}

const AppLayout = ({ children, title, hideHeader = false }: AppLayoutProps) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCapacitor, setIsCapacitor] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      }
    });

    // Check if running in Capacitor
    const checkCapacitor = () => {
      return window.location.href.includes('capacitor://') || 
             window.location.href.includes('localhost') && 
             /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    };
    
    setIsCapacitor(checkCapacitor());

    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className={`flex min-h-screen bg-gray-50 dark:bg-gray-900 relative ${isCapacitor ? 'capacitor-app' : ''}`}>
      {/* Mobile Sidebar Backdrop */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${
          isMobile
            ? `fixed z-50 top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg transition-transform duration-300 ${
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
              } ${isCapacitor ? 'sidebar-mobile pt-safe-top pb-safe-bottom' : ''}`
            : "w-64 hidden md:block"
        }`}
      >
        <Sidebar isMobile={isMobile} />
      </div>

      {/* Mobile menu toggle */}
      {isMobile && (
        <button
          className={`fixed top-4 left-4 z-50 bg-white dark:bg-gray-800 p-2 rounded-md shadow ${
            isCapacitor ? 'mt-safe-top ml-safe-left' : ''
          }`}
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      )}

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col w-full transition-all duration-300 ${
          isMobile ? "pt-16" : ""
        } ${isCapacitor ? 'pt-safe-top pb-safe-bottom px-safe-sides' : ''}`}
      >
        <main className="container mx-auto px-4 py-6 flex-grow mb-[50px]">
          {!hideHeader && (
            <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              {title}
            </h1>
          )}
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default AppLayout;
