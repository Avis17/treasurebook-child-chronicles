
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
import { ChevronRight } from "lucide-react";

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
      <div className="max-w-7xl mx-auto pb-16">
        {/* Profile Header */}
        <ProfileHeader />
        
        <div className="space-y-10">
          {/* Overview Cards */}
          <div className="mt-10 mb-10 px-6">
            <OverviewCards />
          </div>
          
          {/* Performance Insights & Upcoming Events */}
          <div className="grid gap-10 px-6 md:grid-cols-3">
            {/* Performance Insights */}
            <div className="md:col-span-2">
              <Card className="h-full shadow-lg dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold dark:text-white">Performance Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="academic" className="w-full">
                    <TabsList className="mb-8">
                      <TabsTrigger value="academic">Academic</TabsTrigger>
                      <TabsTrigger value="sports">Sports</TabsTrigger>
                      <TabsTrigger value="extracurricular">Extracurricular</TabsTrigger>
                    </TabsList>
                    <TabsContent value="academic" className="h-[380px]">
                      <div className="grid gap-4">
                        <AcademicChart />
                      </div>
                    </TabsContent>
                    <TabsContent value="sports" className="h-[380px]">
                      <div className="grid gap-4">
                        <SportsChart />
                      </div>
                    </TabsContent>
                    <TabsContent value="extracurricular" className="h-[380px]">
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
              <Card className="h-full shadow-lg dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <CardTitle className="text-xl font-bold dark:text-white">Upcoming Events</CardTitle>
                  <a href="/calendar" className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center">
                    View all
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </a>
                </CardHeader>
                <CardContent className="h-[380px] overflow-y-auto pb-6">
                  <ActivitySummary />
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Academic Summary & Summary Cards */}
          <div className="grid gap-10 px-6 md:grid-cols-2 mb-10">
            <div className="h-full">
              <Card className="shadow-lg dark:bg-gray-800 border-gray-200 dark:border-gray-700 h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <CardTitle className="text-xl font-bold dark:text-white">Academic Summary</CardTitle>
                  <a href="/academic-records" className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center">
                    View all
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </a>
                </CardHeader>
                <CardContent className="pb-6">
                  <MarksSummaryCard />
                </CardContent>
              </Card>
            </div>
            <div className="h-full">
              <Card className="shadow-lg dark:bg-gray-800 border-gray-200 dark:border-gray-700 h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <CardTitle className="text-xl font-bold dark:text-white">Learning Progress</CardTitle>
                  <a href="/academic-records" className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center">
                    View details
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </a>
                </CardHeader>
                <CardContent className="pb-6">
                  <SummaryCards />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
