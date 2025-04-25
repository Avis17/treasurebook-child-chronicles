
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

// Simulated AI insight data type
export interface AIInsightData {
  childSnapshot: {
    name: string;
    age: number;
    class: string;
    growthScore: number;
    topSkill: string;
    weakArea: string;
  };
  academic: {
    averageScore: number;
    strongSubject: string;
    strongGrade: string;
    weakSubject: string;
    weakGrade: string;
    subjectScores: Array<{ subject: string; score: number }>;
  };
  talent: {
    topActivity: string;
    enjoyment: string;
    achievements: string[];
  };
  physical: {
    topSport: string;
    recommendation: string;
    achievements: string[];
  };
  emotional: {
    currentMood: string;
    recommendation: string;
    moodHistory: Array<{ mood: string; count: number }>;
  };
  achievements: {
    recent: string[];
    byCategory: Record<string, number>;
  };
  goals: {
    completed: number;
    pending: string[];
    recommendation: string;
  };
  feedback: {
    positive: string[];
    areasOfImprovement: string[];
  };
  suggestions: string[];
  forecast: string;
  actionPlan: {
    shortTerm: string[];
    mediumTerm: string[];
    longTerm: string[];
  };
}

// Simulate fetching data from Vertex AI
export const fetchInsightData = async (userId: string): Promise<AIInsightData> => {
  console.log("Fetching insight data for user:", userId);
  
  // In a real implementation, this would call Vertex AI with data from Firestore
  // For now, we'll return mock data with a delay to simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        childSnapshot: {
          name: "Alex Johnson",
          age: 9,
          class: "Grade 4",
          growthScore: 78,
          topSkill: "Mathematics",
          weakArea: "Public Speaking",
        },
        academic: {
          averageScore: 82,
          strongSubject: "Mathematics",
          strongGrade: "A",
          weakSubject: "English",
          weakGrade: "B-",
          subjectScores: [
            { subject: "Mathematics", score: 92 },
            { subject: "Science", score: 85 },
            { subject: "English", score: 72 },
            { subject: "Social Studies", score: 78 },
            { subject: "Art", score: 88 },
          ],
        },
        talent: {
          topActivity: "Piano",
          enjoyment: "Shows enthusiasm and practices regularly",
          achievements: ["Completed Grade 2 Piano Examination", "Performed at school concert"],
        },
        physical: {
          topSport: "Swimming",
          recommendation: "Consider joining a competitive swim team",
          achievements: ["50m Freestyle Certificate", "Learn to Swim Level 4"],
        },
        emotional: {
          currentMood: "Happy",
          recommendation: "Continue supporting creative expression through art",
          moodHistory: [
            { mood: "Happy", count: 14 },
            { mood: "Excited", count: 8 },
            { mood: "Tired", count: 5 },
            { mood: "Frustrated", count: 3 },
          ],
        },
        achievements: {
          recent: [
            "Math Competition - 2nd Place",
            "Science Fair Participation",
            "Reading Challenge Completion"
          ],
          byCategory: {
            "Academic": 8,
            "Sports": 5,
            "Arts": 4,
            "Social": 2
          }
        },
        goals: {
          completed: 6,
          pending: [
            "Improve multiplication tables",
            "Read 10 books this semester",
            "Learn to dive in swimming"
          ],
          recommendation: "Focus on one reading goal at a time to build confidence"
        },
        feedback: {
          positive: [
            "Excellent problem-solving skills",
            "Positive attitude in class",
            "Good team player during group activities"
          ],
          areasOfImprovement: [
            "Can be hesitant to speak in front of the class",
            "Occasional difficulty with writing assignments",
            "Could improve organization of school materials"
          ]
        },
        suggestions: [
          "Consider joining the Math Club to further develop strengths",
          "Practice public speaking through small group presentations first",
          "Implement a 15-minute daily reading routine",
          "Try a journaling exercise for writing practice"
        ],
        forecast: "Based on current progress, Alex is on track to excel in STEM subjects. With targeted support in language arts, Alex could see significant improvement by the next term.",
        actionPlan: {
          shortTerm: [
            "Schedule 20 minutes of daily reading with discussion",
            "Use math apps to reinforce classroom learning",
            "Practice one presentation skill each week"
          ],
          mediumTerm: [
            "Enroll in a children's public speaking workshop",
            "Participate in the upcoming science competition",
            "Schedule monthly progress check-ins"
          ],
          longTerm: [
            "Consider advanced math program next year",
            "Develop a portfolio of writing samples",
            "Explore coding or robotics extracurricular activities"
          ]
        }
      });
    }, 1500);
  });
};

// Function to regenerate insights (in a real app, this would call Vertex AI again)
export const regenerateInsights = async (userId: string): Promise<AIInsightData> => {
  console.log("Regenerating insights for user:", userId);
  return fetchInsightData(userId);
};

// Helper to get current user ID with promise
export const getCurrentUserId = (): Promise<string | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user ? user.uid : null);
    });
  });
};
