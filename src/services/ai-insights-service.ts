
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, doc, getDoc, addDoc, serverTimestamp } from "firebase/firestore";

// AI insight data type
export interface AIInsightData {
  childSnapshot: {
    name: string;
    age: number;
    class: string;
    growthScore: number;
    topSkills: string[];
    weakAreas: string[];
  };
  academic: {
    averageScore: number;
    strongSubjects: string[];
    weakSubjects: string[];
    subjectScores: Array<{ subject: string; score: number }>;
  };
  talent: {
    topActivities: string[];
    enjoyment: string;
    achievements: string[];
  };
  physical: {
    topSports: string[];
    recommendations: string[];
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
  timestamp: number; // Added to track when insights were generated
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
    
    // Get academic records - without order by to avoid index requirement
    let academicRecords = [];
    try {
      const academicQuery = query(
        collection(db, "academicRecords"),
        where("userId", "==", userId)
      );
      const academicDocs = await getDocs(academicQuery);
      academicRecords = academicDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Sort client-side instead of using orderBy
      academicRecords.sort((a, b) => {
        if (!a.examDate || !b.examDate) return 0;
        
        const dateA = a.examDate.toDate ? a.examDate.toDate() : new Date(a.examDate);
        const dateB = b.examDate.toDate ? b.examDate.toDate() : new Date(b.examDate);
        
        return dateB.getTime() - dateA.getTime(); // descending order
      });
      
      console.log(`Fetched ${academicRecords.length} academic records`);
    } catch (error) {
      console.warn("Error fetching academic records:", error);
    }
    
    // Get sports records
    let sportsRecords = [];
    try {
      const sportsQuery = query(
        collection(db, "sportsRecords"),
        where("userId", "==", userId)
      );
      const sportsDocs = await getDocs(sportsQuery);
      sportsRecords = sportsDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log(`Fetched ${sportsRecords.length} sports records`);
    } catch (error) {
      console.warn("Error fetching sports records:", error);
    }
    
    // Get extracurricular records
    let extracurricularRecords = [];
    try {
      const extracurricularQuery = query(
        collection(db, "extracurricularRecords"),
        where("userId", "==", userId)
      );
      const extracurricularDocs = await getDocs(extracurricularQuery);
      extracurricularRecords = extracurricularDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log(`Fetched ${extracurricularRecords.length} extracurricular records`);
    } catch (error) {
      console.warn("Error fetching extracurricular records:", error);
    }
    
    // Get journal entries (check both possible collections)
    const journalEntries = [];
    
    try {
      const journalQuery1 = query(
        collection(db, "journalEntries"),
        where("userId", "==", userId)
      );
      const journalDocs1 = await getDocs(journalQuery1);
      journalEntries.push(...journalDocs1.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      console.log(`Fetched ${journalDocs1.size} entries from journalEntries collection`);
    } catch (error) {
      console.warn("Error fetching from journalEntries collection:", error);
    }
    
    try {
      const journalQuery2 = query(
        collection(db, "journal"),
        where("userId", "==", userId)
      );
      const journalDocs2 = await getDocs(journalQuery2);
      journalEntries.push(...journalDocs2.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      console.log(`Fetched ${journalDocs2.size} entries from journal collection`);
    } catch (error) {
      console.warn("Error fetching from journal collection:", error);
    }
    
    // Get goals
    let goals = [];
    try {
      const goalsQuery = query(
        collection(db, "goals"),
        where("userId", "==", userId)
      );
      const goalsDocs = await getDocs(goalsQuery);
      goals = goalsDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log(`Fetched ${goals.length} goals`);
    } catch (error) {
      console.warn("Error fetching goals:", error);
    }
    
    // Get milestones
    let milestones = [];
    try {
      const milestonesQuery = query(
        collection(db, "milestones"),
        where("userId", "==", userId)
      );
      const milestonesDocs = await getDocs(milestonesQuery);
      milestones = milestonesDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log(`Fetched ${milestones.length} milestones`);
    } catch (error) {
      console.warn("Error fetching milestones:", error);
    }
    
    // Get feedback
    let feedback = [];
    try {
      const feedbackQuery = query(
        collection(db, "feedback"),
        where("userId", "==", userId)
      );
      const feedbackDocs = await getDocs(feedbackQuery);
      feedback = feedbackDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log(`Fetched ${feedback.length} feedback items`);
    } catch (error) {
      console.warn("Error fetching feedback:", error);
    }
    
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
        console.log("Found user data in users collection");
      }
    } catch (error) {
      console.warn("Error fetching user data:", error);
    }
    
    // Also check profiles collection
    try {
      const profileDoc = await getDoc(doc(db, "profiles", userId));
      if (profileDoc.exists()) {
        const profileData = profileDoc.data();
        // Give priority to profile data over user data
        name = profileData.childName || profileData.displayName || profileData.name || profileData.firstName || name;
        age = profileData.age || age;
        className = profileData.class || profileData.grade || className;
        console.log("Found user data in profiles collection:", name);
      }
    } catch (error) {
      console.warn("Error fetching profile data:", error);
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
      grade: record.grade || 'N/A',
      term: record.term || 'N/A',
      class: record.class || 'N/A'
    };
  });
  
  // Group scores by subject to get average across terms and classes
  const subjectMap = academicScores.reduce((acc: any, item: any) => {
    if (!acc[item.subject]) {
      acc[item.subject] = { totalScore: 0, count: 0 };
    }
    acc[item.subject].totalScore += item.score;
    acc[item.subject].count += 1;
    return acc;
  }, {});
  
  // Calculate average for each subject
  const subjectAverages = Object.keys(subjectMap).map(subject => ({
    subject,
    score: Math.round(subjectMap[subject].totalScore / subjectMap[subject].count)
  }));
  
  const averageScore = subjectAverages.length > 0
    ? subjectAverages.reduce((sum: number, item: any) => sum + item.score, 0) / subjectAverages.length
    : 0;
  
  // Find strong subjects (above 80%)
  const strongSubjects = subjectAverages
    .filter(item => item.score >= 80)
    .map(item => item.subject);
  
  // Find weak subjects (below 40%)
  const weakSubjects = subjectAverages
    .filter(item => item.score <= 40)
    .map(item => item.subject);
  
  // Process extracurricular data
  const extracurricularRecords = userData.extracurricularRecords || [];
  const activitiesMap = extracurricularRecords.reduce((acc: any, record: any) => {
    const key = record.activityName || 'Unknown';
    if (!acc[key]) {
      acc[key] = { count: 0, achievements: [] };
    }
    acc[key].count += 1;
    
    if (record.achievement) {
      acc[key].achievements.push(record.achievement);
    }
    
    return acc;
  }, {});
  
  // Sort activities by frequency
  const sortedActivities = Object.keys(activitiesMap)
    .map(activity => ({
      name: activity,
      count: activitiesMap[activity].count,
      achievements: activitiesMap[activity].achievements
    }))
    .sort((a, b) => b.count - a.count);
  
  const topActivities = sortedActivities.slice(0, 3).map(a => a.name);
  const allExtracurricularAchievements = sortedActivities
    .flatMap(activity => activity.achievements)
    .filter(Boolean);
  
  // Process sports data
  const sportsRecords = userData.sportsRecords || [];
  const sportsMap = sportsRecords.reduce((acc: any, record: any) => {
    const key = record.sportName || 'Unknown';
    if (!acc[key]) {
      acc[key] = { count: 0, achievements: [], positions: [] };
    }
    acc[key].count += 1;
    
    if (record.achievement) {
      acc[key].achievements.push(record.achievement);
    }
    
    if (record.position) {
      acc[key].positions.push(record.position);
    } else if (record.eventName) {
      acc[key].achievements.push(record.eventName);
    }
    
    return acc;
  }, {});
  
  // Sort sports by frequency
  const sortedSports = Object.keys(sportsMap)
    .map(sport => ({
      name: sport,
      count: sportsMap[sport].count,
      achievements: sportsMap[sport].achievements,
      positions: sportsMap[sport].positions
    }))
    .sort((a, b) => b.count - a.count);
  
  const topSports = sortedSports.slice(0, 3).map(s => s.name);
  const allSportsAchievements = sortedSports
    .flatMap(sport => [...sport.achievements, ...sport.positions])
    .filter(Boolean);
  
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
  const academicScore = averageScore * 0.4;
  const sportsScore = allSportsAchievements.length > 0 ? Math.min(25, allSportsAchievements.length * 5) : 0;
  const activitiesScore = allExtracurricularAchievements.length > 0 ? Math.min(25, allExtracurricularAchievements.length * 5) : 0;
  const goalsScore = completedGoals * 3;
  
  const growthScore = Math.min(
    98,
    Math.max(
      40,
      Math.round(academicScore + sportsScore + activitiesScore + goalsScore)
    )
  );
  
  // Combine all skills - academics, sports, and extracurricular
  let topSkills = [...strongSubjects];
  if (topSports.length > 0) topSkills.push(...topSports);
  if (topActivities.length > 0) topSkills.push(...topActivities);
  
  // If no strong skills found, use the highest scores from each category
  if (topSkills.length === 0) {
    if (subjectAverages.length > 0) {
      const bestSubject = subjectAverages.sort((a, b) => b.score - a.score)[0];
      topSkills.push(bestSubject.subject);
    }
    if (topSports.length > 0) topSkills.push(topSports[0]);
    if (topActivities.length > 0) topSkills.push(topActivities[0]);
  }
  
  // Deduplicate skills
  topSkills = [...new Set(topSkills)];
  
  // Combine all weak areas
  let weakAreas = [...weakSubjects];
  
  // If no weak areas found, use areas of improvement from feedback
  if (weakAreas.length === 0 && areasOfImprovement.length > 0) {
    weakAreas = areasOfImprovement;
  }
  
  // If still no weak areas, use the lowest scoring subjects
  if (weakAreas.length === 0 && subjectAverages.length > 0) {
    const worstSubjects = subjectAverages
      .sort((a, b) => a.score - b.score)
      .slice(0, 2);
      
    weakAreas = worstSubjects.map(s => s.subject);
  }
  
  if (weakAreas.length === 0) {
    weakAreas = ["Time Management"];
  }
  
  // Generate forecast based on comprehensive data
  let forecast = "";
  
  if (topSkills.length > 0) {
    forecast = `Based on current progress, ${userData.name} is showing strong potential in ${topSkills.slice(0, 2).join(' and ')}. `;
  }
  
  if (weakAreas.length > 0) {
    forecast += `With focused effort on ${weakAreas.slice(0, 2).join(' and ')}, significant improvement could be achieved by the next term. `;
  }
  
  if (allSportsAchievements.length > 0 || allExtracurricularAchievements.length > 0) {
    forecast += `${userData.name} also demonstrates good participation in non-academic activities, which contributes to overall development. `;
  }
  
  if (completedGoals > 0) {
    forecast += `Having completed ${completedGoals} goal${completedGoals > 1 ? 's' : ''} shows good progress toward personal development targets.`;
  }
  
  // Generate sports recommendations
  const sportsRecommendations = [];
  
  if (topSports.length > 0) {
    sportsRecommendations.push(`Continue developing skills in ${topSports[0]} with regular practice and structured training.`);
    sportsRecommendations.push(`Consider participating in competitions or events for ${topSports[0]} to gain experience.`);
  }
  
  if (sortedSports.length === 0) {
    sportsRecommendations.push("Consider exploring team sports to develop collaboration skills.");
    sportsRecommendations.push("Enroll in a physical activity that aligns with your interests to maintain fitness.");
  }
  
  if (topSports.length > 1) {
    sportsRecommendations.push(`Balance time between ${topSports.slice(0, 2).join(' and ')} to develop multiple skill sets.`);
  }
  
  // Generate emotional recommendations
  let emotionalRecommendation = "Encourage journaling to track emotional well-being";
  if (currentMood !== "N/A") {
    if (["Happy", "Excited", "Joyful", "Positive"].some(m => currentMood.includes(m))) {
      emotionalRecommendation = "Channel positive energy into challenging academic areas";
    } else if (["Tired", "Stressed", "Worried", "Sad", "Anxious"].some(m => currentMood.includes(m))) {
      emotionalRecommendation = "Consider incorporating relaxation techniques into daily routine";
    }
  }
  
  // Generate goal recommendations
  let goalRecommendation = "Start setting structured goals with clear timelines";
  if (completedGoals > 0 && pendingGoals.length > 0) {
    goalRecommendation = "Focus on one goal at a time to maintain progress momentum";
  } else if (completedGoals > 0 && pendingGoals.length === 0) {
    goalRecommendation = "Great job completing goals! Time to set new challenges";
  }
  
  // Generate suggestions based on all collected data
  const academicSuggestions = [
    strongSubjects.length > 0 ? `Continue developing strengths in ${strongSubjects.join(', ')} with advanced material` : 
                          "Explore different subjects to identify areas of interest",
    weakSubjects.length > 0 ? `Focus on improving ${weakSubjects.join(', ')} with structured practice` : 
                        "Work on building consistent study habits",
    averageScore > 80 ? "Consider participating in academic competitions to challenge yourself" : 
                        "Establish a regular study routine with short, focused sessions"
  ];
  
  const sportsSuggestions = [
    topSports.length > 0 ? `Continue developing skills in ${topSports.join(', ')} through regular practice` : 
                     "Try different sports to find those that match your interests and abilities",
    allSportsAchievements.length > 0 ? "Set specific performance goals for your preferred sports" : 
                                 "Consider joining a school team or club for regular physical activity"
  ];
  
  const extracurricularSuggestions = [
    topActivities.length > 0 ? `Develop your talents in ${topActivities.join(', ')} to build mastery` : 
                         "Explore various extracurricular activities to discover your passions",
    "Consider balancing your activities across arts, sciences, and community service for well-rounded development"
  ];
  
  const journalSuggestions = [
    "Maintain regular journal entries to track your progress and emotions",
    "Use journaling to reflect on your experiences and identify patterns"
  ];
  
  // Combine all suggestions
  const suggestions = [
    ...academicSuggestions,
    ...sportsSuggestions,
    ...extracurricularSuggestions,
    ...journalSuggestions
  ].filter(Boolean);
  
  // Generate action plans
  const shortTermActions = [
    weakSubjects.length > 0 ? `Schedule dedicated practice time for ${weakSubjects.join(', ')}` : 
                        "Create a consistent study schedule",
    "Review class notes within 24 hours of lessons",
    strongSubjects.length > 0 ? `Seek more challenging materials in ${strongSubjects[0]}` : 
                          "Identify subjects that spark curiosity",
    topSports.length > 0 ? `Practice ${topSports[0]} skills twice a week` : 
                     "Try a new physical activity"
  ];
  
  const mediumTermActions = [
    topActivities.length > 0 ? `Participate in ${topActivities[0]} events or competitions` : 
                        "Try at least one new extracurricular activity",
    weakAreas.length > 0 ? `Work with a tutor on improving ${weakAreas[0]}` : 
                    "Develop better time management strategies",
    "Set specific measurable goals for the next academic term",
    topSports.length > 0 ? `Join a club or team for ${topSports[0]}` : 
                     "Establish a regular exercise routine"
  ];
  
  const longTermActions = [
    topSkills.length > 0 ? `Explore advanced opportunities in ${topSkills[0]}` : 
                    "Develop a well-rounded skill set across multiple disciplines",
    "Build a portfolio of achievements and projects",
    "Develop self-reflection and independent learning habits",
    "Consider how your current activities align with future educational goals"
  ];
  
  // Compile the insight data
  return {
    childSnapshot: {
      name: userData.name,
      age: userData.age || 0,
      class: userData.className || "Student",
      growthScore,
      topSkills,
      weakAreas
    },
    academic: {
      averageScore: Math.round(averageScore),
      strongSubjects,
      weakSubjects,
      subjectScores: subjectAverages
    },
    talent: {
      topActivities,
      enjoyment: "Shows interest and participation",
      achievements: allExtracurricularAchievements.slice(0, 5)
    },
    physical: {
      topSports,
      recommendations: sportsRecommendations,
      achievements: allSportsAchievements.slice(0, 5)
    },
    emotional: {
      currentMood,
      recommendation: emotionalRecommendation,
      moodHistory
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
      shortTerm: shortTermActions.filter(a => a),
      mediumTerm: mediumTermActions.filter(a => a),
      longTerm: longTermActions.filter(a => a)
    },
    timestamp: Date.now()
  };
};

// Add a goal to the database
export const addGoalFromActionPlan = async (userId: string, title: string, description: string, timeframe: string) => {
  try {
    // Prepare the goal object
    const goalData = {
      userId,
      title,
      description,
      category: timeframe === "Long-term" ? "Academic" : "Personal",
      status: "In Progress",
      timeframe,
      steps: [
        { text: description, completed: false },
        { text: "Continue building on progress", completed: false }
      ],
      createdAt: serverTimestamp()
    };

    // Add the goal to Firestore
    const docRef = await addDoc(collection(db, "goals"), goalData);
    return { id: docRef.id, ...goalData };
  } catch (error) {
    console.error("Error adding goal:", error);
    throw error;
  }
};

// Main function to fetch insight data
export const fetchInsightData = async (userId: string): Promise<AIInsightData> => {
  console.log("Fetching insight data for user:", userId);
  
  try {
    // Collect all the user data from various collections
    const userData = await collectUserData(userId);
    
    // Process the data and generate insights locally
    return processDataAndGenerateInsights(userData);
  } catch (error) {
    console.error("Error fetching insight data:", error);
    throw error;
  }
};

// Function to regenerate insights
export const regenerateInsights = async (userId: string): Promise<AIInsightData> => {
  console.log("Regenerating insights for user:", userId);
  
  try {
    // Force a clean fetch of all data
    const userData = await collectUserData(userId);
    
    // Process with a fresh timestamp
    return processDataAndGenerateInsights(userData);
  } catch (error) {
    console.error("Error regenerating insights:", error);
    throw error;
  }
};
