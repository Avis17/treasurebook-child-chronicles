
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/navigation/Sidebar";
import ProfileHeader from "@/components/dashboard/ProfileHeader";
import SummaryCards from "@/components/dashboard/SummaryCards";
import AcademicChart from "@/components/dashboard/AcademicChart";
import { List } from "lucide-react";

const Dashboard = () => {
  const [isOpen, setIsOpen] = useState(false);
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
    <div className="flex h-screen bg-gray-50">
      <Sidebar isMobile={isMobile} isOpen={isOpen} setIsOpen={setIsOpen} />
      
      <div className="flex-1 overflow-auto">
        {isMobile && (
          <div className="sticky top-0 bg-white p-4 border-b shadow-sm z-10">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(true)}
              >
                <List className="h-6 w-6" />
              </Button>
              <h1 className="text-xl font-bold text-treasure-blue">TreasureBook</h1>
              <div className="w-6"></div> {/* Placeholder for balance */}
            </div>
          </div>
        )}
        
        <main className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
          
          <ProfileHeader />
          
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Overview</h2>
            <SummaryCards />
          </div>
          
          <div className="mt-8">
            <AcademicChart />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
