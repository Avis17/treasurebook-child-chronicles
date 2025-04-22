
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import AppLayout from "@/components/layout/AppLayout";
import ProfileHeader from "@/components/dashboard/ProfileHeader";
import SummaryCards from "@/components/dashboard/SummaryCards";
import AcademicChart from "@/components/dashboard/AcademicChart";
import SportsChart from "@/components/dashboard/SportsChart";
import ExtracurricularChart from "@/components/dashboard/ExtracurricularChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("academics");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <AppLayout title="Dashboard">
      <div className="space-y-6">
        <ProfileHeader />
        
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Overview</h2>
          <SummaryCards />
        </div>
        
        <div className="mt-8">
          <Tabs defaultValue="academics" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="academics">Academics</TabsTrigger>
              <TabsTrigger value="sports">Sports</TabsTrigger>
              <TabsTrigger value="extracurricular">Extracurricular</TabsTrigger>
            </TabsList>
            
            <TabsContent value="academics" className="mt-0">
              <AcademicChart />
            </TabsContent>
            
            <TabsContent value="sports" className="mt-0">
              <SportsChart />
            </TabsContent>
            
            <TabsContent value="extracurricular" className="mt-0">
              <ExtracurricularChart />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
