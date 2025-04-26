
import { useState, useEffect } from "react";
import { BaseGame } from "@/components/fun-learning/BaseGame";
import { Button } from "@/components/ui/button";
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// Fallback flag data in case the API fails
const fallbackFlags = [
  { name: "United States", image: "https://flagcdn.com/w320/us.png" },
  { name: "United Kingdom", image: "https://flagcdn.com/w320/gb.png" },
  { name: "Canada", image: "https://flagcdn.com/w320/ca.png" },
  { name: "Australia", image: "https://flagcdn.com/w320/au.png" },
  { name: "Japan", image: "https://flagcdn.com/w320/jp.png" },
  { name: "Brazil", image: "https://flagcdn.com/w320/br.png" },
  { name: "India", image: "https://flagcdn.com/w320/in.png" },
  { name: "South Africa", image: "https://flagcdn.com/w320/za.png" },
  { name: "Mexico", image: "https://flagcdn.com/w320/mx.png" },
  { name: "France", image: "https://flagcdn.com/w320/fr.png" },
];

interface Flag {
  name: string;
  image: string;
}

export function Flags() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [flags, setFlags] = useState<Flag[]>(fallbackFlags);
  const [loading, setLoading] = useState(true);
  const [currentOptions, setCurrentOptions] = useState<Flag[]>([]);
  const [targetFlag, setTargetFlag] = useState<Flag>({ name: "", image: "" });
  
  // Fetch flags from API once when component loads
  useEffect(() => {
    fetchFlags();
  }, []);
  
  const fetchFlags = async () => {
    try {
      // Try to use the RestCountries API
      const response = await fetch("https://restcountries.com/v3.1/all?fields=name,flags");
      
      if (response.ok) {
        const data = await response.json();
        const formattedFlags = data.map((country: any) => ({
          name: country.name.common,
          image: country.flags.png
        }));
        setFlags(formattedFlags);
      } else {
        // Use fallback if API fails
        setFlags(fallbackFlags);
      }
    } catch (error) {
      console.error("Error fetching flags:", error);
      // Use fallback if API fails
      setFlags(fallbackFlags);
    } finally {
      setLoading(false);
    }
  };
  
  const generateQuestion = () => {
    if (flags.length < 4) {
      setFlags(fallbackFlags);
    }
    
    // Get 4 random flags
    const shuffled = [...flags].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 4);
    setCurrentOptions(selected);
    
    // Randomly select one of them as the target
    const target = selected[Math.floor(Math.random() * selected.length)];
    setTargetFlag(target);
  };
  
  const checkAnswer = (selectedFlag: Flag) => {
    return selectedFlag.name === targetFlag.name;
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
        Find the flag of <span className="font-bold">{targetFlag.name}</span>
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        {currentOptions.map((flag, index) => (
          <Button
            key={index}
            onClick={() => checkAnswer(flag)}
            className="h-28 w-full overflow-hidden"
            variant="outline"
            style={{ padding: 0 }}
          >
            <img 
              src={flag.image} 
              alt={`Flag of ${flag.name}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = `https://flagcdn.com/w320/${flag.name.substring(0, 2).toLowerCase()}.png`;
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
      gameTitle="Country Flags"
      gameType="flags"
      emoji="🌎"
      renderQuestion={renderQuestion}
      checkAnswer={checkAnswer}
      generateQuestion={generateQuestion}
      onGameComplete={saveGameResult}
    />
  );
}

export default Flags;
