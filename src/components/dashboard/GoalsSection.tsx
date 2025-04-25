
import React from "react";
import { DashboardCard } from "./DashboardCard";
import { Progress } from "@/components/ui/progress";
import { useGoals } from "@/lib/dashboard-service";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle } from "lucide-react";

export const GoalsSection = () => {
  const { currentUser } = useAuth();
  const { data: goals, loading } = useGoals(currentUser?.uid);

  const completedSteps = React.useMemo(() => {
    const allGoals = goals.flatMap(goal => goal.steps || []);
    const completedCount = allGoals.filter(step => step.completed).length;
    return `${completedCount} of ${allGoals.length}`;
  }, [goals]);

  const averageProgress = React.useMemo(() => {
    if (goals.length === 0) return 0;
    const totalProgress = goals.reduce((sum, goal) => sum + goal.progress, 0);
    return Math.round(totalProgress / goals.length);
  }, [goals]);

  if (loading) {
    return (
      <DashboardCard title="Goals Tralker">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title="Goals Tralker">
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          {goals.slice(0, 3).map(goal => (
            <div 
              key={goal.id} 
              className={`rounded-lg px-4 py-2 text-sm ${
                goal.status === "Completed" 
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" 
                  : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"
              }`}
            >
              {goal.title}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                className="text-muted stroke-current"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
                r="40"
                cx="50"
                cy="50"
              />
              <circle
                className="text-green-500 stroke-current"
                strokeWidth="8"
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="40"
                cx="50"
                cy="50"
                strokeDasharray={`${2.5 * Math.PI * 40 * averageProgress / 100} ${
                  2.5 * Math.PI * 40 * (100 - averageProgress) / 100
                }`}
                strokeDashoffset={`${2.5 * Math.PI * 10}`}
              />
            </svg>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="text-4xl font-bold">{averageProgress}</div>
              <div className="text-xs text-muted-foreground">%</div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Steps</span>
            <span>{completedSteps}</span>
          </div>
          <Progress value={goals.length > 0 ? (averageProgress) : 0} className="h-2" />
        </div>
      </div>
    </DashboardCard>
  );
};
