
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, doc, getDoc, orderBy, limit } from "firebase/firestore";

// AI insight data type
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

// Helper to get current user ID with promise
export const getCurrentUserId = (): Promise<string | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user ? user.uid : null);
    });
  });
};

// Function to collect user data from various collections
const collectUserData = async (userId: string) => {
  try {
    console.log("Collecting data for user:", userId);
    
    // Get academic records
    const academicQuery = query(
      collection(db, "academicRecords"),
      where("userId", "==", userId),
      orderBy("examDate", "desc")
    );
    const academicDocs = await getDocs(academicQuery);
    const academicRecords = academicDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Get sports records
    const sportsQuery = query(
      collection(db, "sportsRecords"),
      where("userId", "==", userId)
    );
    const sportsDocs = await getDocs(sportsQuery);
    const sportsRecords = sportsDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Get extracurricular records
    const extracurricularQuery = query(
      collection(db, "extracurricularRecords"),
      where("userId", "==", userId)
    );
    const extracurricularDocs = await getDocs(extracurricularQuery);
    const extracurricularRecords = extracurricularDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Get journal entries (check both possible collections)
    const journalEntries = [];
    
    const journalQuery1 = query(
      collection(db, "journalEntries"),
      where("userId", "==", userId)
    );
    const journalDocs1 = await getDocs(journalQuery1);
    journalEntries.push(...journalDocs1.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    
    const journalQuery2 = query(
      collection(db, "journal"),
      where("userId", "==", userId)
    );
    const journalDocs2 = await getDocs(journalQuery2);
    journalEntries.push(...journalDocs2.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    
    // Get goals
    const goalsQuery = query(
      collection(db, "goals"),
      where("userId", "==", userId)
    );
    const goalsDocs = await getDocs(goalsQuery);
    const goals = goalsDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Get milestones
    const milestonesQuery = query(
      collection(db, "milestones"),
      where("userId", "==", userId)
    );
    const milestonesDocs = await getDocs(milestonesQuery);
    const milestones = milestonesDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Get feedback
    const feedbackQuery = query(
      collection(db, "feedback"),
      where("userId", "==", userId)
    );
    const feedbackDocs = await getDocs(feedbackQuery);
    const feedback = feedbackDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Get user profile data
    let name = "Student";
    let age = 0;
    let className = "";
    
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        name = userData.displayName || userData.firstName || "Student";
        age = userData.age || 0;
        className = userData.class || userData.grade || "";
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
    
    // Also check profiles collection
    try {
      const profileDoc = await getDoc(doc(db, "profiles", userId));
      if (profileDoc.exists()) {
        const profileData = profileDoc.data();
        if (!name || name === "Student") {
          name = profileData.displayName || profileData.name || profileData.firstName || "Student";
        }
        if (!age) {
          age = profileData.age || 0;
        }
        if (!className) {
          className = profileData.class || profileData.grade || "";
        }
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
    
    return {
      userId,
      name,
      age,
      className,
      academicRecords,
      sportsRecords,
      extracurricularRecords,
      journalEntries,
      goals,
      milestones,
      feedback
    };
  } catch (error) {
    console.error("Error collecting user data:", error);
    throw error;
  }
};

// Process the raw data and generate insights
const processDataAndGenerateInsights = (userData: any): AIInsightData => {
  console.log("Processing data to generate insights");
  
  // Process academic data
  const academicRecords = userData.academicRecords || [];
  const academicScores = academicRecords.map((record: any) => {
    const score = record.isPercentage ? record.score : (record.score / record.maxScore) * 100;
    return {
      subject: record.subject,
      score: score,
      grade: record.grade || 'N/A'
    };
  });
  
  const averageScore = academicScores.length > 0
    ? academicScores.reduce((sum: number, item: any) => sum + item.score, 0) / academicScores.length
    : 0;
  
  // Sort by score to find strongest and weakest subjects
  const sortedScores = [...academicScores].sort((a, b) => b.score - a.score);
  const strongSubject = sortedScores.length > 0 ? sortedScores[0].subject : "N/A";
  const strongGrade = sortedScores.length > 0 ? sortedScores[0].grade : "N/A";
  const weakSubject = sortedScores.length > 1 ? sortedScores[sortedScores.length - 1].subject : "N/A";
  const weakGrade = sortedScores.length > 1 ? sortedScores[sortedScores.length - 1].grade : "N/A";
  
  // Process extracurricular data
  const extracurricularRecords = userData.extracurricularRecords || [];
  const topActivities = extracurricularRecords.reduce((acc: any, record: any) => {
    acc[record.activityName] = (acc[record.activityName] || 0) + 1;
    return acc;
  }, {});
  
  // Find most frequent activity
  let topActivity = "N/A";
  let topActivityCount = 0;
  Object.entries(topActivities).forEach(([activity, count]: [string, any]) => {
    if (count > topActivityCount) {
      topActivity = activity;
      topActivityCount = count;
    }
  });
  
  // Process sports data
  const sportsRecords = userData.sportsRecords || [];
  const sportsCounts = sportsRecords.reduce((acc: any, record: any) => {
    acc[record.sportName] = (acc[record.sportName] || 0) + 1;
    return acc;
  }, {});
  
  // Find most frequent sport
  let topSport = "N/A";
  let topSportCount = 0;
  Object.entries(sportsCounts).forEach(([sport, count]: [string, any]) => {
    if (count > topSportCount) {
      topSport = sport;
      topSportCount = count;
    }
  });
  
  // Process journal entries for mood analysis
  const journalEntries = userData.journalEntries || [];
  const moodCounts: Record<string, number> = {};
  
  journalEntries.forEach((entry: any) => {
    if (entry.mood) {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    }
  });
  
  const moodHistory = Object.entries(moodCounts)
    .map(([mood, count]) => ({ mood, count }))
    .sort((a, b) => b.count - a.count);
  
  // Current mood is the most frequent one
  const currentMood = moodHistory.length > 0 ? moodHistory[0].mood : "N/A";
  
  // Process goals
  const goals = userData.goals || [];
  const completedGoals = goals.filter((goal: any) => goal.status === "Completed").length;
  const pendingGoals = goals
    .filter((goal: any) => goal.status !== "Completed")
    .map((goal: any) => goal.title);
  
  // Process milestones and achievements
  const milestones = userData.milestones || [];
  const achievements = milestones.map((milestone: any) => milestone.title);
  
  // Group achievements by category
  const achievementsByCategory: Record<string, number> = {};
  milestones.forEach((milestone: any) => {
    if (milestone.category) {
      achievementsByCategory[milestone.category] = (achievementsByCategory[milestone.category] || 0) + 1;
    }
  });
  
  // Process feedback
  const feedbackItems = userData.feedback || [];
  const positive = feedbackItems
    .filter((item: any) => item.category === "positive" || item.category === "strength")
    .map((item: any) => item.content || item.message);
  
  const areasOfImprovement = feedbackItems
    .filter((item: any) => item.category === "improvement" || item.category === "weakness")
    .map((item: any) => item.content || item.message);
  
  // Calculate a growth score based on completed goals and achievements
  const growthScore = Math.min(
    98,
    Math.max(
      40,
      Math.round(
        (completedGoals * 10 + achievements.length * 5 + averageScore * 0.5) / 
        (goals.length > 0 ? 1 : 2) // Adjust if no goals
      )
    )
  );
  
  // Determine top skill based on academic scores and extracurricular activities
  let topSkill = strongSubject !== "N/A" ? strongSubject : (topActivity !== "N/A" ? topActivity : "General Learning");
  
  // Determine weak area that needs improvement
  let weakArea = weakSubject !== "N/A" ? weakSubject : (areasOfImprovement.length > 0 ? areasOfImprovement[0] : "Time Management");
  
  // Generate forecast based on academic trends and completed goals
  const forecast = `Based on current progress, ${userData.name} is showing strong potential in ${topSkill}. With continued focus on ${weakArea}, significant improvement could be achieved by the next academic term.`;
  
  // Generate recommendations based on the data collected
  let sportRecommendation = "Consider exploring team sports to develop collaboration skills";
  if (topSport !== "N/A") {
    sportRecommendation = `Continue developing skills in ${topSport} with structured practice sessions`;
  }
  
  let emotionalRecommendation = "Encourage journaling to track emotional well-being";
  if (currentMood !== "N/A") {
    if (["Happy", "Excited", "Joyful"].includes(currentMood)) {
      emotionalRecommendation = "Channel positive energy into challenging academic areas";
    } else if (["Tired", "Stressed", "Worried"].includes(currentMood)) {
      emotionalRecommendation = "Consider incorporating relaxation techniques into daily routine";
    }
  }
  
  let goalRecommendation = "Start setting structured goals with clear timelines";
  if (completedGoals > 0 && pendingGoals.length > 0) {
    goalRecommendation = "Focus on one goal at a time to maintain progress momentum";
  } else if (completedGoals > 0 && pendingGoals.length === 0) {
    goalRecommendation = "Great job completing goals! Time to set new challenges";
  }
  
  // Generate suggestions based on the collected data
  const suggestions = [
    topSkill !== "N/A" ? `Continue developing strengths in ${topSkill} with advanced material` : "Explore different subjects to identify areas of interest",
    weakArea !== "N/A" ? `Focus on improving ${weakArea} with structured practice` : "Work on building consistent study habits",
    averageScore > 80 ? "Consider participating in academic competitions to challenge yourself" : "Establish a regular study routine with short, focused sessions",
    topActivity !== "N/A" ? `Continue developing skills in ${topActivity} through regular practice` : "Explore different extracurricular activities to find areas of interest"
  ];
  
  // Generate action plans
  const shortTermActions = [
    weakSubject !== "N/A" ? `Schedule dedicated practice time for ${weakSubject}` : "Create a consistent study schedule",
    "Review class notes within 24 hours of lessons",
    strongSubject !== "N/A" ? `Seek more challenging materials in ${strongSubject}` : "Identify subjects that spark curiosity"
  ];
  
  const mediumTermActions = [
    topActivity !== "N/A" ? `Participate in ${topActivity} events or competitions` : "Try at least one new extracurricular activity",
    weakArea !== "N/A" ? `Work with a tutor on improving ${weakArea}` : "Develop better time management strategies",
    "Set specific measurable goals for the next academic term"
  ];
  
  const longTermActions = [
    topSkill !== "N/A" ? `Explore advanced opportunities in ${topSkill}` : "Develop a well-rounded skill set across multiple disciplines",
    "Build a portfolio of achievements and projects",
    "Develop self-reflection and independent learning habits"
  ];
  
  // Compile the insight data
  return {
    childSnapshot: {
      name: userData.name,
      age: userData.age || 0,
      class: userData.className || "Student",
      growthScore,
      topSkill,
      weakArea
    },
    academic: {
      averageScore: Math.round(averageScore),
      strongSubject,
      strongGrade,
      weakSubject,
      weakGrade,
      subjectScores: academicScores.map(s => ({
        subject: s.subject,
        score: Math.round(s.score)
      }))
    },
    talent: {
      topActivity,
      enjoyment: "Shows interest and participation",
      achievements: extracurricularRecords
        .filter((record: any) => record.activityName === topActivity)
        .map((record: any) => record.achievement || record.eventName)
        .slice(0, 3)
    },
    physical: {
      topSport,
      recommendation: sportRecommendation,
      achievements: sportsRecords
        .filter((record: any) => record.sportName === topSport)
        .map((record: any) => record.achievement || record.eventName || record.position)
        .slice(0, 3)
    },
    emotional: {
      currentMood,
      recommendation: emotionalRecommendation,
      moodHistory: moodHistory.slice(0, 5)
    },
    achievements: {
      recent: achievements.slice(0, 5),
      byCategory: achievementsByCategory
    },
    goals: {
      completed: completedGoals,
      pending: pendingGoals.slice(0, 5),
      recommendation: goalRecommendation
    },
    feedback: {
      positive: positive.slice(0, 5),
      areasOfImprovement: areasOfImprovement.slice(0, 5)
    },
    suggestions: suggestions.filter(s => s),
    forecast,
    actionPlan: {
      shortTerm: shortTermActions,
      mediumTerm: mediumTermActions,
      longTerm: longTermActions
    }
  };
};

// Main function to fetch insight data
export const fetchInsightData = async (userId: string): Promise<AIInsightData> => {
  console.log("Fetching insight data for user:", userId);
  
  try {
    // Collect all the user data from various collections
    const userData = await collectUserData(userId);
    
    // In a production app, we would send this data to Vertex AI
    // For now, we'll process the data and generate insights locally
    return processDataAndGenerateInsights(userData);
  } catch (error) {
    console.error("Error fetching insight data:", error);
    throw error;
  }
};

// Function to regenerate insights
export const regenerateInsights = async (userId: string): Promise<AIInsightData> => {
  console.log("Regenerating insights for user:", userId);
  return fetchInsightData(userId);
};
