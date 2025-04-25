
import React from "react";
import { DashboardCard } from "./DashboardCard";
import { useFeedback, formatDate } from "@/lib/dashboard-service";
import { useAuth } from "@/contexts/AuthContext";
import { MessageSquare } from "lucide-react";

export const FeedbackSection = () => {
  const { currentUser } = useAuth();
  const { data: feedback, loading } = useFeedback(currentUser?.uid);

  const latestFeedback = React.useMemo(() => {
    return [...feedback].sort((a, b) => {
      const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
      const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    })[0];
  }, [feedback]);

  if (loading) {
    return (
      <DashboardCard title="Feedback">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardCard>
    );
  }

  if (!latestFeedback) {
    return (
      <DashboardCard title="Feedback">
        <div className="flex flex-col items-center justify-center h-40 text-center">
          <MessageSquare className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No feedback yet</p>
        </div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title="Feedback">
      <div className="space-y-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-lg bg-primary-foreground text-primary dark:bg-primary dark:text-primary-foreground flex items-center justify-center">
              <span className="text-sm font-medium">{latestFeedback.from.charAt(0)}</span>
            </div>
          </div>
          <div className="ml-3">
            <div className="flex items-center">
              <p className="text-sm font-medium">{latestFeedback.from}</p>
              <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 rounded text-xs">
                {latestFeedback.category}
              </span>
            </div>
          </div>
        </div>
        
        <div className="px-3 py-2 bg-muted/40 rounded-lg">
          <p className="text-sm">{latestFeedback.message}</p>
        </div>
        
        <div className="text-xs text-right text-muted-foreground">
          {formatDate(latestFeedback.date)}
        </div>
      </div>
    </DashboardCard>
  );
};
