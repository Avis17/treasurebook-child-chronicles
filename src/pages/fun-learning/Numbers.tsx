
import { useState } from "react";
import { BaseGame } from "@/components/fun-learning/BaseGame";
import { Button } from "@/components/ui/button";
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function Numbers() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [currentOptions, setCurrentOptions] = useState<number[]>([]);
  const [targetNumber, setTargetNumber] = useState<number>(0);
  
  const generateQuestion = () => {
    // Generate random numbers between 1 and 20
    const allNumbers = Array.from({ length: 20 }, (_, i) => i + 1);
    const shuffled = [...allNumbers].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 4);
    setCurrentOptions(selected);
    
    // Randomly select one of them as the target
    const target = selected[Math.floor(Math.random() * selected.length)];
    setTargetNumber(target);
  };
  
  const checkAnswer = (selectedNumber: number) => {
    return selectedNumber === targetNumber;
  };
  
  const saveGameResult = async (result: {
    gameType: string;
    correctAnswers: number;
    totalQuestions: number;
  }) => {
    try {
      if (!currentUser) return;
      
      await addDoc(collection(db, "learningRecords"), {
        userId: currentUser.uid,
        gameType: result.gameType,
        correctAnswers: result.correctAnswers,
        totalQuestions: result.totalQuestions,
        date: new Date().toISOString().split('T')[0],
        createdAt: serverTimestamp()
      });
      
      // Update profile counter
      if (currentUser?.uid) {
        const userProfileRef = doc(db, "profiles", currentUser.uid);
        await updateDoc(userProfileRef, {
          learningGamesCount: increment(1)
        });
      }
      
      toast({
        title: "Game Results Saved",
        description: `You got ${result.correctAnswers} out of ${result.totalQuestions} correct!`,
      });
    } catch (error) {
      console.error("Error saving game results:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save game results.",
      });
    }
  };
  
  const renderQuestion = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-medium text-center mb-6">
        Find the number <span className="font-bold text-3xl">{targetNumber}</span>
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        {currentOptions.map((number) => (
          <Button
            key={number}
            onClick={() => checkAnswer(number)}
            className="h-24 w-full text-3xl font-bold hover:bg-primary/90"
            variant="outline"
          >
            {number}
          </Button>
        ))}
      </div>
    </div>
  );
  
  return (
    <BaseGame
      gameTitle="Number Identification"
      gameType="numbers"
      emoji="🔢"
      renderQuestion={renderQuestion}
      checkAnswer={checkAnswer}
      generateQuestion={generateQuestion}
      onGameComplete={saveGameResult}
    />
  );
}

export default Numbers;
