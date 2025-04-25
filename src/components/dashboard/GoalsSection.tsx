import React from "react";
import { DashboardCard } from "./DashboardCard";
import { Progress } from "@/components/ui/progress";
import { useGoals } from "@/lib/dashboard-service";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle, Target, Flag } from "lucide-react";

export const GoalsSection = () => {
  const { currentUser } = useAuth();
  const { data: goals, loading } = useGoals(currentUser?.uid);

  const completedSteps = React.useMemo(() => {
    const allGoals = goals.flatMap(goal => goal.steps || []);
    const completedCount = allGoals.filter(step => step.completed).length;
    return { completed: completedCount, total: allGoals.length };
  }, [goals]);

  const averageProgress = React.useMemo(() => {
    if (goals.length === 0) return 0;
    const totalProgress = goals.reduce((sum, goal) => {
      if (goal.steps && goal.steps.length > 0) {
        const completed = goal.steps.filter(step => step.completed).length;
        return sum + (completed / goal.steps.length * 100);
      }
      return sum + (goal.progress || (goal.status === "Completed" ? 100 : 50));
    }, 0);
    return Math.round(totalProgress / goals.length);
  }, [goals]);

  if (loading) {
    return (
      <DashboardCard title="Goals Tracker" gradient>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard 
      title="Goals Tracker" 
      action={<Flag className="h-4 w-4 text-indigo-500" />}
      gradient
    >
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          {goals.slice(0, 3).map(goal => (
            <div 
              key={goal.id} 
              className={`rounded-lg px-4 py-2 text-sm flex items-center gap-2 ${
                goal.status === "Completed" 
                  ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900/60 dark:to-emerald-900/60 dark:text-green-100" 
                  : "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 dark:from-amber-900/60 dark:to-yellow-900/60 dark:text-amber-100"
              }`}
            >
              {goal.status === "Completed" ? 
                <CheckCircle className="h-4 w-4" /> : 
                <Target className="h-4 w-4" />
              }
              {goal.title}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full rotate-90 transform" viewBox="0 0 100 100">
              <circle
                className="text-gray-200 dark:text-gray-700 stroke-current"
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
                r="40"
                cx="50"
                cy="50"
              />
              <circle
                className="text-indigo-500 stroke-current"
                strokeWidth="10"
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="40"
                cx="50"
                cy="50"
                strokeDasharray={`${2 * Math.PI * 40 * averageProgress / 100} ${
                  2 * Math.PI * 40 * (100 - averageProgress) / 100
                }`}
                strokeDashoffset={`${2 * Math.PI * 10}`}
              />
            </svg>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-indigo-600 to-purple-600">
                {averageProgress}
              </div>
              <div className="text-xs text-muted-foreground">% Complete</div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Steps Completed</span>
            <span className="font-medium">{completedSteps.completed} of {completedSteps.total}</span>
          </div>
          <Progress 
            value={completedSteps.total > 0 ? (completedSteps.completed / completedSteps.total * 100) : 0} 
            className="h-2 bg-gray-200 dark:bg-gray-700"
          />
          <div className="text-xs text-center text-muted-foreground mt-2">
            {goals.length} active goals
          </div>
        </div>
      </div>
    </DashboardCard>
  );
};
