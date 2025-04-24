
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
      <div className="max-w-7xl mx-auto pb-12">
        {/* Profile Header */}
        <ProfileHeader />
        
        <div className="space-y-12">
          {/* Overview Cards */}
          <div className="mt-8 mb-8 px-4 md:px-6">
            <OverviewCards />
          </div>
          
          {/* Performance Insights & Upcoming Events */}
          <div className="grid gap-6 px-4 md:px-6 md:grid-cols-3">
            {/* Performance Insights */}
            <div className="md:col-span-2">
              <Card className="h-full shadow-md dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-bold dark:text-white">Performance Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="academic" className="w-full">
                    <TabsList className="mb-6">
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
            
            {/* Upcoming Events */}
            <div>
              <Card className="h-full shadow-md dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xl font-bold dark:text-white">Upcoming Events</CardTitle>
                  <a href="/calendar" className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center">
                    View all
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="m9 18 6-6-6-6"/></svg>
                  </a>
                </CardHeader>
                <CardContent>
                  <ActivitySummary />
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Academic Summary & Summary Cards */}
          <div className="grid gap-6 px-4 md:px-6 md:grid-cols-2">
            <MarksSummaryCard />
            <SummaryCards />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
