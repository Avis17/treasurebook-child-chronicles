
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Sparkles, Trophy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Badge } from "@/components/ui/badge";

interface QuizAttempt {
  id: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  completedAt: Date;
  quizTitle?: string;
}

export function QuizCard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [recentAttempts, setRecentAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchRecentAttempts = async () => {
      if (!currentUser?.uid) return;
      
      try {
        setLoading(true);
        
        const attemptsRef = query(
          collection(db, "quizAttempts"),
          where("userId", "==", currentUser.uid),
          orderBy("completedAt", "desc"),
          limit(3)
        );
        
        const attemptsSnap = await getDocs(attemptsRef);
        
        if (!attemptsSnap.empty) {
          const attempts = await Promise.all(
            attemptsSnap.docs.map(async (doc) => {
              const attemptData = doc.data();
              let quizTitle = "Quiz";
              
              // Try to get quiz title
              try {
                if (attemptData.quizId) {
                  const quizDoc = await getDocs(
                    query(
                      collection(db, "quizzes"),
                      where("id", "==", attemptData.quizId)
                    )
                  );
                  
                  if (!quizDoc.empty) {
                    quizTitle = quizDoc.docs[0].data().title;
                  }
                }
              } catch (e) {
                console.log("Error fetching quiz title:", e);
              }
              
              return {
                id: doc.id,
                quizId: attemptData.quizId,
                score: attemptData.score || 0,
                totalQuestions: attemptData.totalQuestions || 0,
                completedAt: attemptData.completedAt?.toDate() || new Date(),
                quizTitle
              };
            })
          );
          
          setRecentAttempts(attempts);
        }
      } catch (error) {
        console.error("Error fetching quiz attempts:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecentAttempts();
  }, [currentUser?.uid]);

  return (
    <DashboardCard
      title={
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-purple-500" />
          <span>Quiz Master</span>
          <Badge variant="info" className="ml-1">New</Badge>
        </div>
      }
      action={
        <Button onClick={() => navigate('/quizzes')} size="sm" variant="outline" className="text-xs gap-1">
          <Sparkles className="h-3.5 w-3.5" /> Take a Quiz
        </Button>
      }
      gradient
    >
      <div className="text-center mb-4">
        <p className="text-muted-foreground">
          Test your knowledge with interactive quizzes on various subjects! 
          Track your progress and earn badges as you improve.
        </p>
      </div>
      
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-t-2 border-primary"></div>
          </div>
        ) : (
          <>
            {recentAttempts.length > 0 ? (
              <div>
                <h3 className="font-medium text-sm mb-3 flex items-center gap-1">
                  <Trophy className="h-4 w-4 text-amber-500" /> Recent Quiz Scores
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {recentAttempts.map((attempt) => (
                    <div 
                      key={attempt.id} 
                      className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border"
                    >
                      <h4 className="font-medium text-sm truncate" title={attempt.quizTitle}>
                        {attempt.quizTitle}
                      </h4>
                      <div className="flex items-center justify-between mt-2">
                        <div className="text-sm text-muted-foreground">
                          {attempt.completedAt.toLocaleDateString()}
                        </div>
                        <div className="font-semibold">
                          {attempt.score}/{attempt.totalQuestions}
                        </div>
                      </div>
                      <div className="mt-1 h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getScoreColorClass(attempt.score / attempt.totalQuestions)}`} 
                          style={{ width: `${(attempt.score / attempt.totalQuestions) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="font-medium mb-2">No Quizzes Attempted Yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Take your first quiz to start tracking your progress!
                </p>
                <Button 
                  onClick={() => navigate('/quizzes')}
                  className="gap-2"
                >
                  <BrainCircuit className="h-4 w-4" /> Start a Quiz
                </Button>
              </div>
            )}
          </>
        )}
      </div>
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
