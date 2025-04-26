
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BaseGame } from "@/components/fun-learning/BaseGame";
import { Button } from "@/components/ui/button";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function Colors() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  // Available colors with their names and hex values
  const colorOptions = [
    { name: "Red", value: "#FF0000" },
    { name: "Blue", value: "#0000FF" },
    { name: "Green", value: "#00FF00" },
    { name: "Yellow", value: "#FFFF00" },
    { name: "Purple", value: "#800080" },
    { name: "Orange", value: "#FFA500" },
    { name: "Pink", value: "#FFC0CB" },
    { name: "Brown", value: "#A52A2A" },
    { name: "Gray", value: "#808080" },
    { name: "Black", value: "#000000" },
    { name: "White", value: "#FFFFFF" },
    { name: "Cyan", value: "#00FFFF" },
  ];
  
  const [currentOptions, setCurrentOptions] = useState<{ name: string, value: string }[]>([]);
  const [targetColor, setTargetColor] = useState<{ name: string, value: string }>({ name: "", value: "" });
  
  const generateQuestion = () => {
    // Get 4 random colors
    const shuffled = [...colorOptions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 4);
    setCurrentOptions(selected);
    
    // Randomly select one of them as the target
    const target = selected[Math.floor(Math.random() * selected.length)];
    setTargetColor(target);
  };
  
  const checkAnswer = (selectedColor: { name: string, value: string }) => {
    return selectedColor.name === targetColor.name;
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
        Find the <span className="font-bold">{targetColor.name}</span> color
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        {currentOptions.map((color) => (
          <Button
            key={color.name}
            onClick={() => checkAnswer(color)}
            className="h-24 w-full text-transparent hover:text-white transition-colors"
            style={{ 
              backgroundColor: color.value,
              border: color.name === "White" ? "1px solid #ddd" : "none"
            }}
          >
            {color.name}
          </Button>
        ))}
      </div>
    </div>
  );
  
  return (
    <BaseGame
      gameTitle="Find the Colors"
      gameType="colors"
      emoji="🎨"
      renderQuestion={renderQuestion}
      checkAnswer={checkAnswer}
      generateQuestion={generateQuestion}
      onGameComplete={saveGameResult}
    />
  );
}

export default Colors;
