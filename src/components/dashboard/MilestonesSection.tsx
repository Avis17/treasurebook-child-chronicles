
import React from "react";
import { DashboardCard } from "./DashboardCard";
import { useMilestones, formatDate } from "@/lib/dashboard-service";
import { useAuth } from "@/contexts/AuthContext";
import { CalendarClock, Award, Music, BookOpen } from "lucide-react";

// Map category to icon
const categoryIcons: Record<string, React.ReactNode> = {
  Science: <CalendarClock className="h-5 w-5" />,
  Karate: <Award className="h-5 w-5" />,
  Music: <Music className="h-5 w-5" />,
  default: <BookOpen className="h-5 w-5" />
};

export const MilestonesSection = () => {
  const { currentUser } = useAuth();
  const { data: milestones, loading } = useMilestones(currentUser?.uid);

  const sortedMilestones = React.useMemo(() => {
    return [...milestones].sort((a, b) => {
      const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
      const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
  }, [milestones]);

  const getIcon = (category: string) => {
    return categoryIcons[category] || categoryIcons.default;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Science: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
      Karate: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
      Music: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
      default: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
    };
    return colors[category] || colors.default;
  };

  if (loading) {
    return (
      <DashboardCard title="Milestones & Achievements">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title="Milestones & Achievements">
      <div className="space-y-4">
        {sortedMilestones.slice(0, 4).map((milestone) => {
          const formattedDate = formatDate(milestone.date);
          
          return (
            <div
              key={milestone.id}
              className="flex items-start space-x-3"
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getCategoryColor(milestone.category)}`}>
                {getIcon(milestone.category)}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{milestone.title}</div>
                <div className="text-xs text-muted-foreground">{formattedDate}</div>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardCard>
  );
};
