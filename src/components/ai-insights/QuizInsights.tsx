
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { fetchQuizStatistics, QuizStats } from "@/lib/quiz-service";
import { BrainCircuit, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function QuizInsights() {
  const [stats, setStats] = useState<QuizStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

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

  if (loading) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-purple-500" />
            Quiz Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-6">
            <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-purple-500 rounded-full"></div>
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
            <BrainCircuit className="h-5 w-5 text-purple-500" />
            Quiz Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground">No quiz data available yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Generate insights based on quiz stats
  const getInsights = () => {
    const insights = [];
    
    // Performance insight
    if (stats.avgScore >= 80) {
      insights.push({
        title: "Excellent Performance",
        description: "You're demonstrating strong knowledge across quizzes. Keep up the great work!",
        icon: <Zap className="h-4 w-4 text-amber-500" />
      });
    } else if (stats.avgScore >= 60) {
      insights.push({
        title: "Good Progress",
        description: "You're showing good understanding. Focus on areas where you scored lower to improve.",
        icon: <Zap className="h-4 w-4 text-blue-500" />
      });
    } else {
      insights.push({
        title: "Building Knowledge",
        description: "Keep practicing and revisiting topics to strengthen your understanding.",
        icon: <Zap className="h-4 w-4 text-purple-500" />
      });
    }
    
    // Category insights
    if (stats.attemptsByCategory.length > 0) {
      // Find strongest category
      const strongest = [...stats.attemptsByCategory].sort((a, b) => b.avgScore - a.avgScore)[0];
      insights.push({
        title: `Strong in ${strongest.category}`,
        description: `You're performing well in ${strongest.category} quizzes with an average score of ${strongest.avgScore}%.`,
        icon: <Zap className="h-4 w-4 text-green-500" />
      });
      
      // Find areas for improvement
      if (stats.attemptsByCategory.length > 1) {
        const weakest = [...stats.attemptsByCategory].sort((a, b) => a.avgScore - b.avgScore)[0];
        if (weakest.avgScore < 70) {
          insights.push({
            title: `Focus on ${weakest.category}`,
            description: `Consider reviewing ${weakest.category} content to improve your current ${weakest.avgScore}% average.`,
            icon: <Zap className="h-4 w-4 text-orange-500" />
          });
        }
      }
    }
    
    // Frequency insights
    if (stats.totalQuizzes < 5) {
      insights.push({
        title: "Take More Quizzes",
        description: "Regular quiz practice helps reinforce learning and memory retention.",
        icon: <Zap className="h-4 w-4 text-indigo-500" />
      });
    }
    
    return insights;
  };
  
  const insights = getInsights();

  return (
    <Card className="overflow-hidden border-none shadow-none bg-transparent">
      <CardHeader className="pb-2 px-0 pt-0">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <BrainCircuit className="h-6 w-6 text-purple-500" />
          Quiz Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-medium mb-4">Performance Overview</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Average Score</span>
                  <span className="text-sm font-bold">{stats.avgScore}%</span>
                </div>
                <Progress value={stats.avgScore} className="h-2" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Quizzes Taken</p>
                  <p className="text-xl font-bold">{stats.quizzesCompleted}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Highest Score</p>
                  <p className="text-xl font-bold">{stats.highestScore}%</p>
                </div>
              </div>
              
              {stats.attemptsByCategory.length > 0 && (
                <div className="pt-4">
                  <h4 className="text-sm font-medium mb-3">Performance by Category</h4>
                  <div className="space-y-3">
                    {stats.attemptsByCategory.slice(0, 3).map((category, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium">{category.category}</span>
                          <span className="text-xs text-muted-foreground">{category.avgScore}%</span>
                        </div>
                        <Progress value={category.avgScore} className="h-1" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-medium mb-4">AI Recommendations</h3>
            
            <div className="space-y-4">
              {insights.map((insight, idx) => (
                <div key={idx} className="border-l-4 border-purple-500 pl-3 py-1">
                  <div className="flex items-center gap-2 mb-1">
                    {insight.icon}
                    <h4 className="font-medium text-sm">{insight.title}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">{insight.description}</p>
                </div>
              ))}
              
              {insights.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Take more quizzes to receive personalized AI recommendations.
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
