
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
import ProfileHeader from "@/components/dashboard/ProfileHeader";

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
        <div className="px-4 space-y-6">
          {/* Profile Header - Full Width */}
          <ProfileHeader />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Profile Card - 3 columns on large screens */}
            <div className="lg:col-span-3 space-y-6">
              <ProfileCard />
              <GoalsSection />
              <ResourcesSection />
            </div>
            
            {/* Main Content - 9 columns on large screens */}
            <div className="lg:col-span-9 space-y-6">
              {/* First Row: Academic Performance */}
              <AcademicPerformanceSection />
              
              {/* Second Row: Sports & Extracurriculars */}
              <SportsSection />
              
              {/* Third Row: Calendar and Feedback in 2 columns */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CalendarSection />
                <FeedbackSection />
              </div>
              
              {/* Fourth Row: Milestones and Journals in 2 columns */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <MilestonesSection />
                <JournalsSection />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
