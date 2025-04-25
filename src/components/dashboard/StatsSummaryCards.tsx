
import React from "react";
import { useDashboardStats } from "@/lib/dashboard-service";
import { useAuth } from "@/contexts/AuthContext";
import { Award, BookOpen, Trophy, Calendar } from "lucide-react";

export const StatsSummaryCards = () => {
  const { currentUser } = useAuth();
  const { data: stats, loading } = useDashboardStats(currentUser?.uid);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
        ))}
      </div>
    );
  }

  const summaryCards = [
    {
      title: "Academic Tests",
      value: stats.totalExams,
      icon: <BookOpen className="h-6 w-6" />,
      gradient: "from-blue-500 to-indigo-600",
      bgLight: "from-blue-50 to-indigo-50",
      border: "border-blue-100"
    },
    {
      title: "Sports Events",
      value: stats.totalSportsEvents,
      icon: <Trophy className="h-6 w-6" />,
      gradient: "from-amber-500 to-orange-600",
      bgLight: "from-amber-50 to-orange-50",
      border: "border-amber-100"
    },
    {
      title: "Achievements",
      value: stats.totalAchievements,
      icon: <Award className="h-6 w-6" />,
      gradient: "from-green-500 to-emerald-600",
      bgLight: "from-green-50 to-emerald-50",
      border: "border-green-100"
    },
    {
      title: "Upcoming Events",
      value: stats.upcomingEvents,
      icon: <Calendar className="h-6 w-6" />,
      gradient: "from-purple-500 to-fuchsia-600",
      bgLight: "from-purple-50 to-fuchsia-50",
      border: "border-purple-100"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {summaryCards.map((card, index) => (
        <div
          key={index}
          className={`p-6 rounded-xl bg-gradient-to-br ${card.bgLight} dark:from-gray-800 dark:to-gray-900 border ${card.border} dark:border-gray-700 hover:shadow-lg transition-shadow duration-200`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-gradient-to-br ${card.gradient} text-white`}>
              {card.icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {card.value}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {card.title}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
