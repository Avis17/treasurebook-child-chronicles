
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/navigation/Sidebar";
import { List, ChevronLeft, ChevronRight } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  hideHeader?: boolean;
}

const AppLayout = ({ children, title, hideHeader = false }: AppLayoutProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Store sidebar state in localStorage
  useEffect(() => {
    const storedState = localStorage.getItem("sidebar-state");
    if (storedState !== null) {
      setIsOpen(storedState === "true");
    }
  }, []);

  // Update localStorage when sidebar state changes
  useEffect(() => {
    localStorage.setItem("sidebar-state", isOpen.toString());
  }, [isOpen]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar isMobile={isMobile} isOpen={isOpen} setIsOpen={setIsOpen} />
      
      <div className={`flex-1 overflow-hidden flex flex-col transition-all duration-300 ${
        isMobile ? "" : (isOpen ? "ml-64" : "ml-16")
      }`}>
        {isMobile && (
          <div className="sticky top-0 bg-card p-4 border-b shadow-sm z-10">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(true)}
              >
                <List className="h-6 w-6" />
              </Button>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-treasure-blue to-blue-500 dark:from-blue-300 dark:to-blue-500">
                TreasureBook
              </h1>
              <div className="w-6"></div> {/* Placeholder for balance */}
            </div>
          </div>
        )}
        
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-6">
            {!hideHeader && <h1 className="text-2xl font-bold mb-6">{title}</h1>}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
