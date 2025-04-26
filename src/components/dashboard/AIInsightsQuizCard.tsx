
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/button";
import { BrainCircuit, LineChart, PieChart, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface QuizInsight {
  quizCategory: string;
  strength: number;
  weakness: number;
  totalAttempts: number;
  averageScore: number;
}

export function AIInsightsQuizCard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [quizInsights, setQuizInsights] = useState<QuizInsight[]>([]);
  const [totalQuizzes, setTotalQuizzes] = useState(0);
  const [overallScore, setOverallScore] = useState(0);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchQuizInsights = async () => {
      if (!currentUser?.uid) return;
      
      try {
        setLoading(true);
        
        // Fetch all quiz attempts for the user
        const attemptsRef = query(
          collection(db, "quizAttempts"),
          where("userId", "==", currentUser.uid)
        );
        
        const attemptsSnap = await getDocs(attemptsRef);
        
        if (attemptsSnap.empty) {
          setLoading(false);
          return;
        }
        
        // Process quiz attempts to generate insights
        const attempts = attemptsSnap.docs.map(doc => doc.data());
        setTotalQuizzes(attempts.length);
        
        // Calculate overall average score
        let totalScorePercentage = 0;
        attempts.forEach(attempt => {
          const score = attempt.score || 0;
          const total = attempt.totalQuestions || 1;
          totalScorePercentage += (score / total) * 100;
        });
        
        setOverallScore(Math.round(totalScorePercentage / attempts.length));
        
        // Generate insights by category
        const categoryMap = new Map<string, {
          total: number,
          correct: number,
          attempts: number,
          questions: Set<string>
        }>();
        
        attempts.forEach(attempt => {
          const category = attempt.category || 'General';
          const score = attempt.score || 0;
          const total = attempt.totalQuestions || 0;
          
          if (!categoryMap.has(category)) {
            categoryMap.set(category, {
              total: 0,
              correct: 0,
              attempts: 0,
              questions: new Set()
            });
          }
          
          const categoryData = categoryMap.get(category)!;
          categoryData.total += total;
          categoryData.correct += score;
          categoryData.attempts += 1;
          
          // Track question IDs if available
          if (attempt.questions) {
            attempt.questions.forEach((q: any) => {
              categoryData.questions.add(q.id || q.questionId || '');
            });
          }
        });
        
        // Convert map to insights array
        const insights: QuizInsight[] = [];
        categoryMap.forEach((data, category) => {
          const averageScore = Math.round((data.correct / data.total) * 100);
          insights.push({
            quizCategory: category,
            strength: averageScore,
            weakness: 100 - averageScore,
            totalAttempts: data.attempts,
            averageScore
          });
        });
        
        // Sort by number of attempts (descending)
        insights.sort((a, b) => b.totalAttempts - a.totalAttempts);
        setQuizInsights(insights.slice(0, 3)); // Take top 3 categories
        
      } catch (error) {
        console.error("Error fetching quiz insights:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuizInsights();
  }, [currentUser?.uid]);

  return (
    <DashboardCard
      title={
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-purple-500" />
          <span>Quiz Insights</span>
          <Badge variant="info" className="ml-1">New</Badge>
        </div>
      }
      action={
        <Button onClick={() => navigate("/quizzes")} size="sm" variant="outline">
          Take a Quiz
        </Button>
      }
      className="border border-purple-100 dark:border-purple-900"
    >
      {loading ? (
        <div className="h-48 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-t-2 border-blue-500"></div>
        </div>
      ) : totalQuizzes === 0 ? (
        <div className="text-center py-12">
          <BrainCircuit className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium mb-2">No Quiz Data Available</h3>
          <p className="text-muted-foreground mb-6">
            Complete quizzes to get personalized insights about your strengths and areas for improvement.
          </p>
          <Button onClick={() => navigate("/quizzes")} className="gap-2">
            <Target className="h-4 w-4" /> Start Your First Quiz
          </Button>
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-6">
            <div className="w-full md:w-auto flex flex-col items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Overall Score</div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {overallScore}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Based on {totalQuizzes} quizzes
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <PieChart className="h-4 w-4 text-blue-500" /> Subject Performance
              </h3>
              
              <div className="space-y-3">
                {quizInsights.map(insight => (
                  <div key={insight.quizCategory} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{insight.quizCategory}</span>
                      <span className="font-medium">{insight.averageScore}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getScoreColorClass(insight.averageScore / 100)}`}
                        style={{ width: `${insight.averageScore}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{insight.totalAttempts} attempts</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h3 className="font-medium flex items-center gap-2 mb-2">
              <LineChart className="h-4 w-4 text-blue-500" /> AI Quiz Recommendations
            </h3>
            
            <ul className="list-disc list-inside space-y-1 text-sm">
              {quizInsights.length > 0 && quizInsights[0].averageScore < 70 && (
                <li>Focus on improving your {quizInsights[0].quizCategory} knowledge with more practice.</li>
              )}
              
              {quizInsights.length > 1 && quizInsights[1].averageScore < 70 && (
                <li>Consider spending more time on {quizInsights[1].quizCategory} topics.</li>
              )}
              
              {quizInsights.length > 0 && quizInsights[0].averageScore >= 70 && (
                <li>Great job on {quizInsights[0].quizCategory}! Try more advanced quizzes to challenge yourself.</li>
              )}
              
              {quizInsights.some(i => i.averageScore < 60) ? (
                <li>Regular quiz practice will help improve your overall knowledge and retention.</li>
              ) : (
                <li>You're doing well across all subjects! Keep up the good work.</li>
              )}
              
              <li>Taking quizzes regularly helps build long-term memory and knowledge retention.</li>
            </ul>
          </div>
        </>
      )}
    </DashboardCard>
  );
}

// Helper function to get color class based on score percentage
function getScoreColorClass(percentage: number): string {
  if (percentage >= 0.8) return 'bg-green-500';
  if (percentage >= 0.6) return 'bg-blue-500';
  if (percentage >= 0.4) return 'bg-amber-500';
  return 'bg-red-500';
}
