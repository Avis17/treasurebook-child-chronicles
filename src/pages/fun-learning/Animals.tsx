
import { useState, useEffect } from "react";
import { BaseGame } from "@/components/fun-learning/BaseGame";
import { Button } from "@/components/ui/button";
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// Fallback animal data in case the API fails
const fallbackAnimals = [
  { name: "Lion", image: "https://source.unsplash.com/featured/?lion" },
  { name: "Elephant", image: "https://source.unsplash.com/featured/?elephant" },
  { name: "Giraffe", image: "https://source.unsplash.com/featured/?giraffe" },
  { name: "Zebra", image: "https://source.unsplash.com/featured/?zebra" },
  { name: "Penguin", image: "https://source.unsplash.com/featured/?penguin" },
  { name: "Tiger", image: "https://source.unsplash.com/featured/?tiger" },
  { name: "Monkey", image: "https://source.unsplash.com/featured/?monkey" },
  { name: "Kangaroo", image: "https://source.unsplash.com/featured/?kangaroo" },
  { name: "Panda", image: "https://source.unsplash.com/featured/?panda" },
  { name: "Koala", image: "https://source.unsplash.com/featured/?koala" },
];

interface Animal {
  name: string;
  image: string;
}

export function Animals() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [animals, setAnimals] = useState<Animal[]>(fallbackAnimals);
  const [loading, setLoading] = useState(true);
  const [currentOptions, setCurrentOptions] = useState<Animal[]>([]);
  const [targetAnimal, setTargetAnimal] = useState<Animal>({ name: "", image: "" });
  
  // Fetch animals from API once when component loads
  useEffect(() => {
    fetchAnimals();
  }, []);
  
  const fetchAnimals = async () => {
    try {
      // Try to use the Zoo Animal API
      const response = await fetch("https://zoo-animal-api.herokuapp.com/animals/rand/10");
      
      if (response.ok) {
        const data = await response.json();
        const formattedAnimals = data.map((animal: any) => ({
          name: animal.name,
          image: animal.image_link
        }));
        setAnimals(formattedAnimals);
      } else {
        // Use fallback if API fails
        setAnimals(fallbackAnimals);
      }
    } catch (error) {
      console.error("Error fetching animals:", error);
      // Use fallback if API fails
      setAnimals(fallbackAnimals);
    } finally {
      setLoading(false);
    }
  };
  
  const generateQuestion = () => {
    if (animals.length < 4) {
      setAnimals(fallbackAnimals);
    }
    
    // Get 4 random animals
    const shuffled = [...animals].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 4);
    setCurrentOptions(selected);
    
    // Randomly select one of them as the target
    const target = selected[Math.floor(Math.random() * selected.length)];
    setTargetAnimal(target);
  };
  
  const checkAnswer = (selectedAnimal: Animal) => {
    return selectedAnimal.name === targetAnimal.name;
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
        Find the <span className="font-bold">{targetAnimal.name}</span>
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        {currentOptions.map((animal, index) => (
          <Button
            key={index}
            onClick={() => checkAnswer(animal)}
            className="h-40 w-full p-1 overflow-hidden"
            variant="outline"
            style={{ 
              padding: 0,
              backgroundPosition: 'center',
              backgroundSize: 'cover',
            }}
          >
            <img 
              src={animal.image} 
              alt={animal.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = `https://source.unsplash.com/featured/?${animal.name}`;
              }}
            />
          </Button>
        ))}
      </div>
    </div>
  );
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <BaseGame
      gameTitle="Animal Match"
      gameType="animals"
      emoji="🐾"
      renderQuestion={renderQuestion}
      checkAnswer={checkAnswer}
      generateQuestion={generateQuestion}
      onGameComplete={saveGameResult}
    />
  );
}

export default Animals;
