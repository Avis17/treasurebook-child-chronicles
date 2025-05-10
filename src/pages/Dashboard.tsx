
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
import { StatsSummaryCards } from "@/components/dashboard/StatsSummaryCards";
import { BadgesSection } from "@/components/dashboard/BadgesSection";
import { BadgeInfoDialog } from "@/components/dashboard/BadgeInfoDialog";
import { QuizSummarySection } from "@/components/dashboard/QuizSummarySection";

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
        <div className="px-4 space-y-8">
          {/* Profile Header - Full Width */}
          <ProfileHeader />

          {/* Stats Summary Cards */}
          <StatsSummaryCards />

          {/* Badges Section */}
          {/* <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span className="text-gradient-primary">Badges & Achievements</span>
              <BadgeInfoDialog />
            </h2>
          </div>
          <BadgesSection /> */}
          <AcademicPerformanceSection />

          {/* Main Content - Two Column Layout for desktop, single column for mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Left Column */}
            <div className="space-y-8">
              {/* Quiz Summary Section */}
              <QuizSummarySection />

              {/* Goals Section */}
              <GoalsSection />

              {/* Milestones */}
              <MilestonesSection />

              {/* Feedback */}
              <FeedbackSection />
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Academic Performance */}

              {/* Sports Section */}
              <SportsSection />

              {/* Calendar & Events */}
              <CalendarSection />

              {/* Journals */}
              <JournalsSection />
            </div>
          </div>

          {/* Full Width Resources Section */}
          <ResourcesSection />
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
