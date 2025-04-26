
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuizAttempt } from "@/pages/Quizzes";
import { format } from "date-fns";
import { CheckCircle, XCircle, Award, BarChart2 } from "lucide-react";

interface QuizResultsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quizAttempt: QuizAttempt;
}

export function QuizResultsModal({
  open,
  onOpenChange,
  quizAttempt
}: QuizResultsModalProps) {
  // Get result feedback based on score
  const getFeedback = (score: number) => {
    if (score >= 90) return "Outstanding! Exceptional knowledge!";
    if (score >= 80) return "Excellent work! You've mastered this topic.";
    if (score >= 70) return "Great job! You have strong understanding.";
    if (score >= 60) return "Good effort! Keep practicing to improve.";
    if (score >= 50) return "You're on the right track. More practice needed.";
    if (score >= 40) return "Let's practice more to strengthen your knowledge.";
    return "More study needed. Don't give up!";
  };
  
  // Get badge style based on score
  const getScoreBadge = (score: number) => {
    if (score >= 80) return "success";
    if (score >= 60) return "default";
    if (score >= 40) return "secondary";
    return "destructive";
  };
  
  // Get feedback color based on score
  const getFeedbackColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-blue-600 dark:text-blue-400";
    if (score >= 40) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            Quiz Results
            <Badge variant={getScoreBadge(quizAttempt.percentage)}>
              {quizAttempt.percentage}%
            </Badge>
          </DialogTitle>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-4">
            <div className="text-center p-2 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Category</p>
              <p className="font-medium truncate">{quizAttempt.categoryName}</p>
            </div>
            
            <div className="text-center p-2 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Class</p>
              <p className="font-medium">{quizAttempt.class}</p>
            </div>
            
            <div className="text-center p-2 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Difficulty</p>
              <p className="font-medium capitalize">{quizAttempt.difficulty}</p>
            </div>
            
            <div className="text-center p-2 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Date</p>
              <p className="font-medium text-sm">{format(new Date(quizAttempt.date), "MMM dd, yyyy")}</p>
            </div>
          </div>
        </DialogHeader>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Performance Summary</CardTitle>
              <BarChart2 className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Progress visualization */}
              <div>
                <div className="flex justify-between items-center mb-2 text-sm">
                  <span>Score: {quizAttempt.percentage}%</span>
                  <span>{quizAttempt.correctAnswers} of {quizAttempt.totalQuestions} correct</span>
                </div>
                <Progress
                  value={quizAttempt.percentage}
                  className="h-3"
                />
              </div>
              
              {/* Stats cards */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg text-center">
                  <p className="text-xs text-green-800 dark:text-green-300">Correct</p>
                  <p className="text-xl font-bold text-green-700 dark:text-green-400 flex items-center justify-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    {quizAttempt.correctAnswers}
                  </p>
                </div>
                
                <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg text-center">
                  <p className="text-xs text-red-800 dark:text-red-300">Incorrect</p>
                  <p className="text-xl font-bold text-red-700 dark:text-red-400 flex items-center justify-center gap-1">
                    <XCircle className="h-4 w-4" />
                    {quizAttempt.wrongAnswers}
                  </p>
                </div>
                
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg text-center">
                  <p className="text-xs text-blue-800 dark:text-blue-300">Questions</p>
                  <p className="text-xl font-bold text-blue-700 dark:text-blue-400">
                    {quizAttempt.totalQuestions}
                  </p>
                </div>
              </div>
              
              {/* Feedback */}
              <div className="mt-6 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Award className="h-5 w-5 mr-2 text-yellow-500" />
                  <h3 className="font-medium">Feedback</h3>
                </div>
                <p className={`text-lg font-medium ${getFeedbackColor(quizAttempt.percentage)}`}>
                  {getFeedback(quizAttempt.percentage)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="questions" className="mt-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="answers">Your Answers</TabsTrigger>
          </TabsList>
          
          <TabsContent value="questions" className="space-y-4 mt-4">
            {quizAttempt.questions.map((question, index) => (
              <Card key={index} className={`border-l-4 ${
                question.isCorrect 
                  ? "border-l-green-500 dark:border-l-green-700" 
                  : "border-l-red-500 dark:border-l-red-700"
              }`}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium mb-3 flex-1">{index + 1}. {question.question}</h4>
                    {question.isCorrect 
                      ? <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 ml-2" /> 
                      : <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 ml-2" />
                    }
                  </div>
                  
                  <div className="space-y-2 mt-3">
                    <div className="text-sm">
                      <span className="font-semibold text-muted-foreground">Your answer: </span>
                      <span className={question.isCorrect ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                        {question.userAnswer || "No answer"}
                      </span>
                    </div>
                    
                    {!question.isCorrect && (
                      <div className="text-sm">
                        <span className="font-semibold text-muted-foreground">Correct answer: </span>
                        <span className="text-green-600 dark:text-green-400">{question.correct_answer}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="answers" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Answer Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {quizAttempt.questions.map((question, index) => (
                    <div key={index} className="py-3 flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium truncate">{index + 1}. {question.question}</p>
                        <p className="text-xs text-muted-foreground">
                          Your answer: {question.userAnswer || "No answer"}
                        </p>
                      </div>
                      {question.isCorrect 
                        ? <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 ml-3" /> 
                        : <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 ml-3" />
                      }
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
