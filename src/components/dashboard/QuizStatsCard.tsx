
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit, BarChart, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { fetchQuizStatistics, QuizStats } from "@/lib/quiz-service";
import { Progress } from "@/components/ui/progress";

export function QuizStatsCard() {
  const [stats, setStats] = useState<QuizStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const getStats = async () => {
      if (currentUser?.uid) {
        try {
          const quizStats = await fetchQuizStatistics(currentUser.uid);
          setStats(quizStats);
        } catch (error) {
          console.error("Error fetching quiz statistics:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    getStats();
  }, [currentUser]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  if (loading) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-blue-500" />
            Quiz Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-6">
            <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats || stats.totalQuizzes === 0) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-blue-500" />
            Quiz Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">No quiz attempts yet</p>
            <Button onClick={() => navigate("/quizzes")} size="sm" className="mt-2">
              Take Your First Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-blue-500" />
            Quiz Activity
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs hover:bg-blue-50 dark:hover:bg-blue-900/30"
            onClick={() => navigate("/quizzes")}
          >
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
            <p className="text-sm text-muted-foreground">Total Quizzes</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalQuizzes}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
            <p className="text-sm text-muted-foreground">Avg. Score</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.avgScore}%</p>
          </div>
        </div>

        {stats.recentAttempts.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium mb-2">Recent Quiz Attempts</h4>
            {stats.recentAttempts.slice(0, 3).map((attempt, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">{attempt.categoryName}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(attempt.date)}</p>
                </div>
                <div className="flex items-center">
                  <Badge variant={attempt.score >= 70 ? "success" : "warning"} className="text-xs">
                    {attempt.score}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {stats.attemptsByCategory.length > 0 && (
          <div className="mt-4 pt-3 border-t">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <BarChart className="h-4 w-4 text-blue-500" />
              Top Categories
            </h4>
            {stats.attemptsByCategory.slice(0, 2).map((category, idx) => (
              <div key={idx} className="mb-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium">{category.category}</span>
                  <span className="text-xs text-muted-foreground">{category.avgScore}%</span>
                </div>
                <Progress value={category.avgScore} className="h-1" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
