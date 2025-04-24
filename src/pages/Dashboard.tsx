
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import ProfileHeader from "@/components/dashboard/ProfileHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AcademicChart from "@/components/dashboard/AcademicChart";
import SportsChart from "@/components/dashboard/SportsChart";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import ExtracurricularChart from "@/components/dashboard/ExtracurricularChart";
import Sidebar from "@/components/navigation/Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar isMobile={isMobile} />

      <div className="flex-1 overflow-auto md:ml-64">
        <div className="container mx-auto px-4 py-6">
          <ProfileHeader />

          <SummaryCards />

          <Card className="mt-4 dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="dark:text-white">Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="academic" className="w-full">
                <TabsList>
                  <TabsTrigger value="academic">Academic</TabsTrigger>
                  <TabsTrigger value="sports">Sports</TabsTrigger>
                  <TabsTrigger value="extracurricular">Extracurricular</TabsTrigger>
                </TabsList>
                <TabsContent value="academic">
                  <div className="grid gap-4">
                    <CardTitle className="dark:text-white">Academic Performance</CardTitle>
                    <AcademicChart />
                  </div>
                </TabsContent>
                <TabsContent value="sports">
                  <div className="grid gap-4">
                    <CardTitle className="dark:text-white">Sports Activities</CardTitle>
                    <SportsChart />
                  </div>
                </TabsContent>
                <TabsContent value="extracurricular">
                  <div className="grid gap-4">
                    <CardTitle className="dark:text-white">Extracurricular Activities</CardTitle>
                    <ExtracurricularChart />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
