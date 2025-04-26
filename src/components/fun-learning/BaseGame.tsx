
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Trophy } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import confetti from "canvas-confetti";
import { useAuth } from "@/contexts/AuthContext";

interface BaseGameProps {
  gameTitle: string;
  gameType: string;
  emoji: string;
  renderQuestion: (currentQuestion: number) => React.ReactNode;
  checkAnswer: (answer: any) => boolean;
  generateQuestion: () => void;
  totalQuestions?: number;
  onGameComplete: (results: { gameType: string; correctAnswers: number; totalQuestions: number }) => void;
}

export function BaseGame({
  gameTitle,
  gameType,
  emoji,
  renderQuestion,
  checkAnswer,
  generateQuestion,
  totalQuestions = 5,
  onGameComplete,
}: BaseGameProps) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize the game
  useEffect(() => {
    generateQuestion();
    setLoading(false);
  }, []);

  const handleAnswer = (answer: any) => {
    const correct = checkAnswer(answer);
    
    setIsCorrect(correct);
    
    if (correct) {
      setScore(score + 1);
      triggerConfetti();
    }
    
    // Move to the next question or end the game
    setTimeout(() => {
      if (currentQuestion >= totalQuestions - 1) {
        endGame();
      } else {
        setCurrentQuestion(currentQuestion + 1);
        generateQuestion();
        setIsCorrect(null);
      }
    }, 1000);
  };
  
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const endGame = () => {
    setGameOver(true);
    onGameComplete({
      gameType: gameType,
      correctAnswers: score,
      totalQuestions: totalQuestions,
    });
  };

  const restartGame = () => {
    setCurrentQuestion(0);
    setScore(0);
    setGameOver(false);
    setIsCorrect(null);
    generateQuestion();
  };

  if (loading) {
    return (
      <AppLayout title={gameTitle}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={gameTitle}>
      <div className="flex justify-between items-center mb-8">
        <Button 
          variant="ghost" 
          className="flex items-center gap-2" 
          onClick={() => navigate("/fun-learning")}
        >
          <ArrowLeft className="h-4 w-4" /> Back to Games
        </Button>
        <div className="text-2xl font-bold flex items-center gap-2">
          {emoji} {gameTitle}
        </div>
      </div>

      {!gameOver ? (
        <Card className="p-6">
          <div className="mb-4 flex justify-between items-center">
            <div className="text-sm font-medium">
              Question {currentQuestion + 1} of {totalQuestions}
            </div>
            <div className="text-sm font-medium">
              Score: {score}
            </div>
          </div>
          
          <div className={`transition-all duration-300 ${
            isCorrect === true ? "bg-green-100 dark:bg-green-900/30 p-4 rounded-md" : 
            isCorrect === false ? "bg-red-100 dark:bg-red-900/30 p-4 rounded-md" : ""
          }`}>
            {renderQuestion(currentQuestion)}
          </div>
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center mt-8">
          <div className="text-5xl mb-4">🏆</div>
          <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
          <div className="text-xl mb-6">
            You scored <span className="font-bold text-primary">{score}</span> out of {totalQuestions}
          </div>
          
          {score === totalQuestions && (
            <div className="text-xl text-green-600 dark:text-green-400 mb-6">
              Perfect Score! Amazing job!
            </div>
          )}
          
          {score > 0 && score < totalQuestions && (
            <div className="text-xl text-blue-600 dark:text-blue-400 mb-6">
              Good job! Keep practicing!
            </div>
          )}
          
          {score === 0 && (
            <div className="text-xl text-amber-600 dark:text-amber-400 mb-6">
              Don't give up! Try again!
            </div>
          )}
          
          <div className="flex gap-4">
            <Button onClick={restartGame} className="flex items-center gap-2">
              <Trophy className="h-4 w-4" /> Play Again
            </Button>
            <Button variant="outline" onClick={() => navigate("/fun-learning")}>
              Back to Games
            </Button>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
