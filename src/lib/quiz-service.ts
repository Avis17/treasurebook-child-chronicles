
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";

export interface QuizStats {
  totalQuizzes: number;
  quizzesCompleted: number;
  avgScore: number;
  highestScore: number;
  attemptsByCategory: {
    category: string;
    count: number;
    avgScore: number;
  }[];
  recentAttempts: {
    id: string;
    categoryName: string;
    score: number;
    date: Date;
    difficulty: string;
  }[];
}

export const fetchQuizStatistics = async (userId: string): Promise<QuizStats> => {
  try {
    const q = query(
      collection(db, "quizAttempts"),
      where("userId", "==", userId),
      orderBy("timestamp", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    
    let totalQuizzes = 0;
    let totalScore = 0;
    let highestScore = 0;
    const categoryData: Record<string, { count: number; totalScore: number }> = {};
    const recentAttempts: QuizStats['recentAttempts'] = [];
    
    querySnapshot.forEach((doc) => {
      const attempt = doc.data();
      totalQuizzes++;
      totalScore += attempt.score || 0;
      
      if (attempt.score > highestScore) {
        highestScore = attempt.score;
      }
      
      // Track category statistics
      const category = attempt.categoryName || 'Unknown';
      if (!categoryData[category]) {
        categoryData[category] = { count: 0, totalScore: 0 };
      }
      categoryData[category].count++;
      categoryData[category].totalScore += attempt.score || 0;
      
      // Add to recent attempts (limit to 5)
      if (recentAttempts.length < 5) {
        recentAttempts.push({
          id: doc.id,
          categoryName: attempt.categoryName || 'Unknown',
          score: attempt.score || 0,
          date: attempt.timestamp?.toDate() || new Date(),
          difficulty: attempt.difficulty || 'Medium'
        });
      }
    });
    
    const avgScore = totalQuizzes > 0 ? Math.round(totalScore / totalQuizzes) : 0;
    
    const attemptsByCategory = Object.entries(categoryData).map(([category, data]) => ({
      category,
      count: data.count,
      avgScore: Math.round(data.totalScore / data.count)
    }));
    
    return {
      totalQuizzes,
      quizzesCompleted: totalQuizzes,
      avgScore,
      highestScore,
      attemptsByCategory,
      recentAttempts
    };
  } catch (error) {
    console.error("Error fetching quiz statistics:", error);
    return {
      totalQuizzes: 0,
      quizzesCompleted: 0,
      avgScore: 0,
      highestScore: 0,
      attemptsByCategory: [],
      recentAttempts: []
    };
  }
};

// Calculate badge level based on quiz performance
export const calculateQuizBadgeLevel = (stats: QuizStats): {
  level: string;
  icon: string;
  description: string;
  color: string;
} => {
  if (stats.totalQuizzes === 0) {
    return {
      level: "Beginner",
      icon: "🧩",
      description: "Take your first quiz to earn a badge!",
      color: "bg-gray-200 text-gray-800"
    };
  }
  
  if (stats.totalQuizzes >= 25 && stats.avgScore >= 85) {
    return {
      level: "Quiz Master",
      icon: "🏆",
      description: "Completed 25+ quizzes with an average score of 85%+",
      color: "bg-gradient-to-r from-amber-500 to-yellow-300 text-white"
    };
  }
  
  if (stats.totalQuizzes >= 15 && stats.avgScore >= 80) {
    return {
      level: "Knowledge Expert",
      icon: "🎓",
      description: "Completed 15+ quizzes with an average score of 80%+",
      color: "bg-gradient-to-r from-purple-600 to-purple-400 text-white"
    };
  }
  
  if (stats.totalQuizzes >= 10 && stats.avgScore >= 75) {
    return {
      level: "Quiz Scholar",
      icon: "📚",
      description: "Completed 10+ quizzes with an average score of 75%+",
      color: "bg-gradient-to-r from-blue-600 to-blue-400 text-white"
    };
  }
  
  if (stats.totalQuizzes >= 5 && stats.avgScore >= 70) {
    return {
      level: "Quiz Enthusiast",
      icon: "🧠",
      description: "Completed 5+ quizzes with an average score of 70%+",
      color: "bg-gradient-to-r from-green-600 to-green-400 text-white"
    };
  }
  
  return {
    level: "Quiz Novice",
    icon: "🔍",
    description: `Completed ${stats.totalQuizzes} ${stats.totalQuizzes === 1 ? 'quiz' : 'quizzes'} with an average score of ${stats.avgScore}%`,
    color: "bg-gradient-to-r from-blue-400 to-teal-300 text-white"
  };
};
