
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, query, where, getDocs, orderBy, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { GameCard } from "@/components/fun-learning/GameCard";
import { Gamepad, ShapesIcon, Palette, Flag, Hash } from "lucide-react";
import { doc, updateDoc, increment } from "firebase/firestore";

export const FunLearning = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      // Check if user has permission to access fun learning
      // Similar to how other features check permissions
      const hasPermission = 
        user.permissions?.funLearning || 
        user.isAdmin;

      setHasPermission(hasPermission !== false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const incrementLearningAttempt = async () => {
    if (!currentUser?.uid) return;
    
    try {
      const userProfileRef = doc(db, "profiles", currentUser.uid);
      await updateDoc(userProfileRef, {
        learningGamesCount: increment(1)
      });
    } catch (error) {
      console.error("Error updating learning games count:", error);
    }
  };

  const saveGameResult = async (gameData: {
    gameType: string;
    correctAnswers: number;
    totalQuestions: number;
  }) => {
    try {
      if (!currentUser) return;
      
      await addDoc(collection(db, "learningRecords"), {
        userId: currentUser.uid,
        gameType: gameData.gameType,
        correctAnswers: gameData.correctAnswers,
        totalQuestions: gameData.totalQuestions,
        date: new Date().toISOString().split('T')[0],
        createdAt: serverTimestamp()
      });
      
      // Increment the profile counter
      await incrementLearningAttempt();
      
      toast({
        title: "Game Results Saved",
        description: `You got ${gameData.correctAnswers} out of ${gameData.totalQuestions} correct!`,
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

  const games = [
    {
      id: "colors",
      title: "Find the Colors",
      description: "Test your knowledge of colors. Can you find the right one?",
      icon: <Palette className="h-10 w-10 text-pink-500" />,
      path: "/fun-learning/colors",
      emoji: "🎨",
      color: "bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900 dark:to-pink-800",
      iconColor: "text-pink-500 dark:text-pink-400"
    },
    {
      id: "animals",
      title: "Animal Match",
      description: "Match the animal to its name. How many can you get right?",
      icon: <Gamepad className="h-10 w-10 text-blue-500" />,
      path: "/fun-learning/animals",
      emoji: "🐾",
      color: "bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800",
      iconColor: "text-blue-500 dark:text-blue-400"
    },
    {
      id: "numbers",
      title: "Number Identification",
      description: "Can you identify the correct numbers? Test your number skills!",
      icon: <Hash className="h-10 w-10 text-green-500" />,
      path: "/fun-learning/numbers",
      emoji: "🔢",
      color: "bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800",
      iconColor: "text-green-500 dark:text-green-400"
    },
    {
      id: "shapes",
      title: "Shape Recognition",
      description: "Learn about different shapes and test your knowledge.",
      icon: <ShapesIcon className="h-10 w-10 text-purple-500" />,
      path: "/fun-learning/shapes",
      emoji: "🧩",
      color: "bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800",
      iconColor: "text-purple-500 dark:text-purple-400"
    },
    {
      id: "flags",
      title: "Country Flags",
      description: "Learn flags from around the world in this fun game!",
      icon: <Flag className="h-10 w-10 text-red-500" />,
      path: "/fun-learning/flags",
      emoji: "🌎",
      color: "bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900 dark:to-red-800",
      iconColor: "text-red-500 dark:text-red-400"
    },
  ];

  if (!hasPermission) {
    return (
      <AppLayout title="Fun Learning">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Access Restricted</h2>
          <p>You don't have permission to access Fun Learning games.</p>
          <p className="mt-2">Please contact an administrator to request access.</p>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Fun Learning">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Interactive Learning Games</h1>
        <p className="text-muted-foreground">
          Choose a fun learning game to play and learn while having fun!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => (
          <GameCard 
            key={game.id} 
            game={game} 
            onClick={() => navigate(game.path)} 
          />
        ))}
      </div>
    </AppLayout>
  );
};

export default FunLearning;
