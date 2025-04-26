
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface Question {
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
  userAnswer?: string;
  isCorrect?: boolean;
}

interface QuizAttemptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quiz: {
    class: string;
    category: string;
    categoryId: number;
    categoryName: string;
    difficulty: string;
    type: string;
    questions: Question[];
  };
  onComplete: (result: any) => void;
}

export function QuizAttemptModal({
  open,
  onOpenChange,
  quiz,
  onComplete
}: QuizAttemptModalProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(quiz.questions.length).fill(''));
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  
  // Timer effect
  useEffect(() => {
    if (!open || quizCompleted) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleCompleteQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [open, quizCompleted]);
  
  // Prepare answer options for current question
  const getOptions = () => {
    if (!currentQuestion) return [];
    
    if (quiz.type === 'boolean') {
      return ['True', 'False'];
    } else {
      // For multiple choice, shuffle the answers
      const options = [
        currentQuestion.correct_answer,
        ...currentQuestion.incorrect_answers
      ];
      return shuffleArray(options);
    }
  };
  
  // Shuffle array helper function
  const shuffleArray = (array: string[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };
  
  // Format time remaining
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Handle answer selection
  const handleSelectAnswer = (answer: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answer;
    setAnswers(newAnswers);
  };
  
  // Navigate to next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setAnswerSubmitted(false);
    } else {
      handleCompleteQuiz();
    }
  };
  
  // Submit current answer
  const handleSubmitAnswer = () => {
    setAnswerSubmitted(true);
  };
  
  // Complete the quiz and calculate results
  const handleCompleteQuiz = () => {
    setQuizCompleted(true);
    
    // Process questions and answers
    const processedQuestions = quiz.questions.map((q, index) => {
      const userAnswer = answers[index] || '';
      const isCorrect = userAnswer.toLowerCase() === q.correct_answer.toLowerCase();
      
      return {
        ...q,
        userAnswer,
        isCorrect
      };
    });
    
    // Calculate total results
    const correctAnswers = processedQuestions.filter(q => q.isCorrect).length;
    const wrongAnswers = quiz.questions.length - correctAnswers;
    const percentage = Math.round((correctAnswers / quiz.questions.length) * 100);
    
    onComplete({
      questions: processedQuestions,
      totalQuestions: quiz.questions.length,
      correctAnswers,
      wrongAnswers,
      percentage
    });
  };
  
  // Handle clicking outside modal
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !quizCompleted) {
      // Confirm before closing if quiz is in progress
      if (window.confirm("Are you sure you want to exit the quiz? Your progress will be lost.")) {
        onOpenChange(false);
      }
    } else {
      onOpenChange(newOpen);
    }
  };

  const options = getOptions();
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between mb-2">
            <DialogTitle>
              {quiz.categoryName} Quiz 
              <Badge variant="outline" className="ml-2 capitalize">
                {quiz.difficulty}
              </Badge>
            </DialogTitle>
            <Badge 
              variant={timeLeft < 60 ? "destructive" : "outline"} 
              className="text-base py-1"
            >
              {formatTime(timeLeft)}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
            <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
            <span>Class: {quiz.class}</span>
          </div>
          
          <Progress value={progress} className="h-2 mb-4" />
        </DialogHeader>
        
        {currentQuestion && (
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-6">{currentQuestion.question}</h3>
              
              <RadioGroup 
                value={answers[currentQuestionIndex]} 
                onValueChange={handleSelectAnswer}
                disabled={answerSubmitted}
                className="space-y-3"
              >
                {options.map((option, index) => {
                  const isSelected = answers[currentQuestionIndex] === option;
                  const isCorrect = option === currentQuestion.correct_answer;
                  
                  return (
                    <div 
                      key={index}
                      className={`
                        relative flex items-center border rounded-lg p-4 transition-colors
                        ${isSelected ? 'border-primary' : 'border-input'}
                        ${answerSubmitted && isSelected && isCorrect ? 'bg-green-50 dark:bg-green-900/20' : ''}
                        ${answerSubmitted && isSelected && !isCorrect ? 'bg-red-50 dark:bg-red-900/20' : ''}
                        ${answerSubmitted && !isSelected && isCorrect ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                        ${answerSubmitted ? '' : 'hover:bg-accent'}
                      `}
                    >
                      <RadioGroupItem 
                        value={option} 
                        id={`option-${index}`}
                        className="mr-3"
                      />
                      <Label 
                        htmlFor={`option-${index}`}
                        className={`flex-1 text-base cursor-pointer ${answerSubmitted && 'pointer-events-none'}`}
                      >
                        {option}
                      </Label>
                      
                      {answerSubmitted && (
                        <div className="absolute right-4">
                          {isSelected && isCorrect && <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />}
                          {isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />}
                          {!isSelected && isCorrect && <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
                        </div>
                      )}
                    </div>
                  );
                })}
              </RadioGroup>
            </CardContent>
          </Card>
        )}
        
        <div className="flex justify-between mt-6">
          <Button 
            variant="outline" 
            onClick={() => handleOpenChange(false)}
          >
            Exit Quiz
          </Button>
          
          {!answerSubmitted ? (
            <Button 
              onClick={handleSubmitAnswer} 
              disabled={!answers[currentQuestionIndex]}
            >
              Submit Answer
            </Button>
          ) : (
            <Button 
              onClick={handleNextQuestion}
            >
              {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'Complete Quiz'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
