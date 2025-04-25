
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";

// Dashboard section components
import { ProfileCard } from "@/components/dashboard/ProfileCard";
import { AcademicPerformanceSection } from "@/components/dashboard/AcademicPerformanceSection";
import { SportsSection } from "@/components/dashboard/SportsSection";
import { GoalsSection } from "@/components/dashboard/GoalsSection";
import { CalendarSection } from "@/components/dashboard/CalendarSection";
import { MilestonesSection } from "@/components/dashboard/MilestonesSection";
import { JournalsSection } from "@/components/dashboard/JournalsSection";
import { FeedbackSection } from "@/components/dashboard/FeedbackSection";
import { ResourcesSection } from "@/components/dashboard/ResourcesSection";

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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 px-4">
          {/* Profile Card - 3 columns on large screens */}
          <div className="lg:col-span-3">
            <ProfileCard />
          </div>
          
          {/* Main Content - 9 columns on large screens */}
          <div className="lg:col-span-9 space-y-6">
            {/* First Row: Academic Performance and Goals */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="col-span-1">
                <AcademicPerformanceSection />
              </div>
              <div className="col-span-1">
                <GoalsSection />
              </div>
            </div>

            {/* Second Row: Sports & Extracurriculars */}
            <div>
              <SportsSection />
            </div>
            
            {/* Third Row: Calendar and Feedback */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="col-span-1">
                <CalendarSection />
              </div>
              <div className="col-span-1">
                <FeedbackSection />
              </div>
            </div>
            
            {/* Fourth Row: Milestones, Journals, and Resources */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="col-span-1">
                <MilestonesSection />
              </div>
              <div className="col-span-1">
                <JournalsSection />
              </div>
              <div className="col-span-1">
                <ResourcesSection />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
