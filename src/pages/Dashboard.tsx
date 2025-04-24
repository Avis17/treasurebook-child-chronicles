
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
import AppLayout from "@/components/layout/AppLayout";

const Dashboard = () => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate, loading]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null; // Will redirect in the useEffect
  }

  return (
    <AppLayout title="Dashboard" hideHeader={true}>
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
                <AcademicChart />
              </div>
            </TabsContent>
            <TabsContent value="sports">
              <div className="grid gap-4">
                <SportsChart />
              </div>
            </TabsContent>
            <TabsContent value="extracurricular">
              <div className="grid gap-4">
                <ExtracurricularChart />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default Dashboard;
