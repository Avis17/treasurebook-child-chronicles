
import { useState } from "react";
import { BaseGame } from "@/components/fun-learning/BaseGame";
import { Button } from "@/components/ui/button";
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function Shapes() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  // Available shapes
  const shapeOptions = [
    { name: "Circle", svg: <svg viewBox="0 0 100 100" className="w-full h-full"><circle cx="50" cy="50" r="40" fill="currentColor" /></svg> },
    { name: "Square", svg: <svg viewBox="0 0 100 100" className="w-full h-full"><rect x="10" y="10" width="80" height="80" fill="currentColor" /></svg> },
    { name: "Triangle", svg: <svg viewBox="0 0 100 100" className="w-full h-full"><polygon points="50,10 90,90 10,90" fill="currentColor" /></svg> },
    { name: "Rectangle", svg: <svg viewBox="0 0 100 100" className="w-full h-full"><rect x="10" y="30" width="80" height="40" fill="currentColor" /></svg> },
    { name: "Star", svg: <svg viewBox="0 0 100 100" className="w-full h-full"><polygon points="50,10 61,35 90,35 65,55 75,80 50,65 25,80 35,55 10,35 39,35" fill="currentColor" /></svg> },
    { name: "Heart", svg: <svg viewBox="0 0 100 100" className="w-full h-full"><path d="M50,30 C35,10 10,20 10,40 C10,75 50,90 50,90 C50,90 90,75 90,40 C90,20 65,10 50,30 Z" fill="currentColor" /></svg> },
    { name: "Diamond", svg: <svg viewBox="0 0 100 100" className="w-full h-full"><polygon points="50,10 90,50 50,90 10,50" fill="currentColor" /></svg> },
    { name: "Oval", svg: <svg viewBox="0 0 100 100" className="w-full h-full"><ellipse cx="50" cy="50" rx="40" ry="25" fill="currentColor" /></svg> },
  ];
  
  const [currentOptions, setCurrentOptions] = useState<typeof shapeOptions>([]);
  const [targetShape, setTargetShape] = useState<(typeof shapeOptions)[0]>({ name: "", svg: <></> });
  
  const generateQuestion = () => {
    // Get 4 random shapes
    const shuffled = [...shapeOptions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 4);
    setCurrentOptions(selected);
    
    // Randomly select one of them as the target
    const target = selected[Math.floor(Math.random() * selected.length)];
    setTargetShape(target);
  };
  
  const checkAnswer = (selectedShape: (typeof shapeOptions)[0]) => {
    return selectedShape.name === targetShape.name;
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
        Find the <span className="font-bold">{targetShape.name}</span> shape
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        {currentOptions.map((shape, index) => (
          <Button
            key={index}
            onClick={() => checkAnswer(shape)}
            className="h-28 w-full flex items-center justify-center p-4 hover:bg-primary/90"
            variant="outline"
          >
            <div className="w-20 h-20 text-primary">
              {shape.svg}
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
  
  return (
    <BaseGame
      gameTitle="Shape Recognition"
      gameType="shapes"
      emoji="🧩"
      renderQuestion={renderQuestion}
      checkAnswer={checkAnswer}
      generateQuestion={generateQuestion}
      onGameComplete={saveGameResult}
    />
  );
}

export default Shapes;
