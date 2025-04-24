
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import ProfileHeader from "@/components/dashboard/ProfileHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AcademicChart from "@/components/dashboard/AcademicChart";
import SportsChart from "@/components/dashboard/SportsChart";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import ExtracurricularChart from "@/components/dashboard/ExtracurricularChart";
import AppLayout from "@/components/layout/AppLayout";
import OverviewCards from "@/components/dashboard/OverviewCards";
import ActivitySummary from "@/components/dashboard/ActivitySummary";
import MarksSummaryCard from "@/components/dashboard/MarksSummaryCard";

const Dashboard = () => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

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
    return null;
  }

  return (
    <AppLayout title="Dashboard" hideHeader={true}>
      <div className="max-w-7xl mx-auto">
        <ProfileHeader />
        
        <div className="space-y-10 pb-10">
          <OverviewCards />
          
          <div className="grid gap-8 px-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <Card className="h-full dark:bg-gray-800 shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl dark:text-white">Performance Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="academic" className="w-full">
                    <TabsList className="mb-4">
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
            </div>
            
            <div>
              <Card className="h-full dark:bg-gray-800 shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl dark:text-white">Upcoming Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <ActivitySummary />
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="grid gap-8 px-6 md:grid-cols-2">
            <MarksSummaryCard />
            <SummaryCards />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
