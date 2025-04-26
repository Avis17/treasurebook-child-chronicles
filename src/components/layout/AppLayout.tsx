
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useIsMobile } from "@/hooks/use-mobile";
import Sidebar from "@/components/navigation/Sidebar";
import Footer from "./Footer";

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  hideHeader?: boolean;
}

const AppLayout = ({ children, title, hideHeader = false }: AppLayoutProps) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar isMobile={isMobile} />
      <div className="flex-1 flex flex-col w-full transition-all duration-300">
        <main className="container mx-auto px-6 py-8 flex-grow">
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
