
// AI Insights Service
import { collection, doc, getDoc, setDoc, query, where, orderBy, getDocs, addDoc, Timestamp, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { v4 as uuidv4 } from "uuid";

// Define types for our data structure
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
    subjectScores: Array<{subject: string, score: number}>;
    recentAssessments: any[];
  };
  talent: {
    topActivities: string[];
    achievements: string[];
    enjoyment: string;
  };
  physical: {
    topSports: string[];
    achievements: string[];
    recommendations: string[];
  };
  emotional: {
    currentMood: string;
    moodHistory: Array<{mood: string, count: number}>;
    recommendation: string;
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
    shortterm: string[];
    mediumterm: string[];
    longterm: string[];
  };
}

// Fetch insight data from Firestore
export const fetchInsightData = async (userId: string): Promise<AIInsightData> => {
  try {
    console.log("Fetching data for user:", userId);
    
    // Get basic profile data
    const profileRef = doc(db, "profiles", userId);
    const profileSnap = await getDoc(profileRef);
    const profileData = profileSnap.exists() ? profileSnap.data() : null;
    
    // Get academic records
    const academicRecords: DocumentData[] = await getCollectionDataByUserId("academicRecords", userId);
    console.log("Academic records:", academicRecords);
    
    // Get sports records
    const sportsRecords: DocumentData[] = await getCollectionDataByUserId("sportsRecords", userId);
    console.log("Sports records:", sportsRecords);
    
    // Get extracurricular records
    const extracurricularRecords: DocumentData[] = await getCollectionDataByUserId("extracurricular", userId);
    console.log("Extracurricular records:", extracurricularRecords);
    
    // Get journal entries
    const journalEntries: DocumentData[] = await getCollectionDataByUserId("journals", userId);
    console.log("Journal entries:", journalEntries);
    
    // Get goals
    const goals: DocumentData[] = await getCollectionDataByUserId("goals", userId);
    console.log("Goals:", goals);
    
    // Get feedback
    const feedback: DocumentData[] = await getCollectionDataByUserId("feedback", userId);
    console.log("Feedback:", feedback);
    
    // Process and transform the data
    const transformedData = transformData(
      profileData, 
      academicRecords, 
      sportsRecords, 
      extracurricularRecords,
      journalEntries,
      goals,
      feedback
    );
    
    return transformedData;
  } catch (error) {
    console.error("Error fetching insight data:", error);
    throw error;
  }
};

// Regenerate insights
export const regenerateInsights = async (userId: string): Promise<AIInsightData> => {
  try {
    console.log("Regenerating insights for user:", userId);
    
    // Force refetch all data 
    const data = await fetchInsightData(userId);
    
    // We could save this regenerated data if needed
    // const insightRef = doc(db, "insights", userId);
    // await setDoc(insightRef, { ...data, updatedAt: Timestamp.now() });
    
    return data;
  } catch (error) {
    console.error("Error regenerating insights:", error);
    throw error;
  }
};

// Add a goal from the action plan
export const addGoalFromActionPlan = async (
  userId: string, 
  title: string,
  description: string,
  timeframe: string
): Promise<void> => {
  try {
    // Map timeframe to category
    let category = "Academic";
    if (description.toLowerCase().includes("sport") || 
        description.toLowerCase().includes("physical") ||
        description.toLowerCase().includes("exercise")) {
      category = "Sports";
    } else if (description.toLowerCase().includes("art") || 
               description.toLowerCase().includes("music") ||
               description.toLowerCase().includes("hobby")) {
      category = "Extracurricular";
    }
    
    // Create steps array
    const steps = [
      {
        text: description,
        completed: false
      },
      {
        text: "NIL",
        completed: false
      }
    ];
    
    // Create the goal object
    const goalData = {
      userId,
      title,
      description,
      category,
      timeframe,
      status: "In Progress",
      steps,
      createdAt: Timestamp.now()
    };
    
    // Add the goal to Firestore
    const goalsRef = collection(db, "goals");
    await addDoc(goalsRef, goalData);
    
    console.log("Goal added:", title);
  } catch (error) {
    console.error("Error adding goal:", error);
    throw error;
  }
};

// Helper function to get collection data by userId
const getCollectionDataByUserId = async (
  collectionName: string, 
  userId: string
): Promise<DocumentData[]> => {
  try {
    const collectionRef = collection(db, collectionName);
    const q = query(
      collectionRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
  } catch (error) {
    console.error(`Error fetching ${collectionName}:`, error);
    return [];
  }
};

// Helper function to transform raw data into insight data structure
const transformData = (
  profile: any,
  academicRecords: DocumentData[],
  sportsRecords: DocumentData[],
  extracurricularRecords: DocumentData[],
  journalEntries: DocumentData[],
  goals: DocumentData[],
  feedback: DocumentData[]
): AIInsightData => {
  
  // Extract and process academic data
  const subjectScores = processAcademicRecords(academicRecords);
  const averageScore = calculateAverageScore(subjectScores);
  const strongSubjects = subjectScores
    .filter(s => s.score >= 80)
    .map(s => s.subject);
  const weakSubjects = subjectScores
    .filter(s => s.score < 40)
    .map(s => s.subject);
  
  // Extract and process sports data
  const sportsList = processTopActivities(sportsRecords, 'sportName');
  const sportsAchievements = sportsRecords
    .filter(record => record.position && (record.position.toLowerCase().includes('win') || 
                                         record.position.toLowerCase().includes('first') ||
                                         record.position.toLowerCase().includes('medal')))
    .map(record => `${record.position} in ${record.sportName}`);
  
  // Extract and process extracurricular data
  const activitiesList = processTopActivities(extracurricularRecords, 'activityName');
  const extracurricularAchievements = extracurricularRecords
    .filter(record => record.achievements && record.achievements.trim() !== '')
    .map(record => record.achievements);
  
  // Process journal entries for mood data
  const moodData = processMoodData(journalEntries);
  
  // Process achievements by category
  const achievementsByCategory: Record<string, number> = {};
  [...sportsRecords, ...extracurricularRecords, ...academicRecords]
    .filter(record => record.achievements || record.position || (record.marks && record.marks > 80))
    .forEach(record => {
      const category = record.sportName 
        ? 'Sports' 
        : record.activityName 
          ? 'Extracurricular' 
          : 'Academic';
      
      achievementsByCategory[category] = (achievementsByCategory[category] || 0) + 1;
    });
  
  // Process recent achievements
  const recentAchievements = [
    ...sportsAchievements, 
    ...extracurricularAchievements,
    ...academicRecords
      .filter(record => record.marks && record.marks > 85)
      .map(record => `Scored ${record.marks}% in ${record.subject}`)
  ].slice(0, 5);
  
  // Process goals data
  const completedGoals = goals.filter(goal => goal.status === 'Completed').length;
  const pendingGoals = goals
    .filter(goal => goal.status !== 'Completed')
    .map(goal => goal.title);
  
  // Process feedback data
  const positiveComments = feedback
    .filter(f => f.type === 'positive' || f.rating >= 4)
    .map(f => f.comment || f.feedback);
  
  const improvementAreas = feedback
    .filter(f => f.type === 'improvement' || f.rating < 3)
    .map(f => f.comment || f.feedback);
  
  // Generate suggestions based on available data
  const suggestions = generateSuggestions(
    subjectScores, 
    strongSubjects, 
    weakSubjects, 
    sportsList, 
    activitiesList, 
    moodData
  );
  
  // Generate action plan
  const actionPlan = generateActionPlan(
    strongSubjects,
    weakSubjects,
    sportsList,
    activitiesList,
    pendingGoals
  );
  
  // Calculate overall growth score
  const growthScore = Math.round(
    (averageScore * 0.4) + 
    (sportsList.length > 0 ? 20 : 0) + 
    (activitiesList.length > 0 ? 20 : 0) +
    (moodData.positivePercentage || 0)
  );
  
  // Build and return the full insight data structure
  return {
    childSnapshot: {
      name: profile?.displayName || profile?.name || 'Student',
      age: profile?.age || calculateAgeFromDOB(profile?.dob) || 0,
      class: profile?.class || profile?.grade || 'Student',
      growthScore: Math.min(growthScore, 100),
      topSkills: [...strongSubjects, ...sportsList, ...activitiesList].slice(0, 3),
      weakAreas: weakSubjects,
    },
    academic: {
      averageScore,
      strongSubjects,
      weakSubjects,
      subjectScores,
      recentAssessments: academicRecords.slice(0, 3),
    },
    talent: {
      topActivities: activitiesList,
      achievements: extracurricularAchievements,
      enjoyment: 'Continues to show interest and enjoyment in creative activities.',
    },
    physical: {
      topSports: sportsList,
      achievements: sportsAchievements,
      recommendations: generateSportsRecommendations(sportsList),
    },
    emotional: {
      currentMood: moodData.currentMood,
      moodHistory: moodData.moodCounts,
      recommendation: generateMoodRecommendation(moodData.currentMood),
    },
    achievements: {
      recent: recentAchievements,
      byCategory: achievementsByCategory,
    },
    goals: {
      completed: completedGoals,
      pending: pendingGoals,
      recommendation: generateGoalRecommendation(completedGoals, pendingGoals.length),
    },
    feedback: {
      positive: positiveComments,
      areasOfImprovement: improvementAreas,
    },
    suggestions,
    forecast: generateForecast(strongSubjects, weakSubjects, sportsList, activitiesList, growthScore),
    actionPlan,
  };
};

// Helper function to process academic records and calculate scores
const processAcademicRecords = (academicRecords: DocumentData[]): Array<{subject: string, score: number}> => {
  const subjectScoresMap = new Map<string, number[]>();
  
  // Group scores by subject
  academicRecords.forEach(record => {
    if (record.subject && record.marks) {
      const subject = record.subject;
      const score = parseFloat(record.marks);
      
      if (!isNaN(score)) {
        if (!subjectScoresMap.has(subject)) {
          subjectScoresMap.set(subject, []);
        }
        subjectScoresMap.get(subject)?.push(score);
      }
    }
  });
  
  // Calculate average for each subject
  const subjectScores: Array<{subject: string, score: number}> = [];
  
  subjectScoresMap.forEach((scores, subject) => {
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    subjectScores.push({
      subject,
      score: Math.round(average)
    });
  });
  
  return subjectScores;
};

// Calculate overall average score
const calculateAverageScore = (subjectScores: Array<{subject: string, score: number}>): number => {
  if (subjectScores.length === 0) return 0;
  
  const sum = subjectScores.reduce((total, subject) => total + subject.score, 0);
  return Math.round(sum / subjectScores.length);
};

// Process top activities from records
const processTopActivities = (records: DocumentData[], nameField: string): string[] => {
  const activityCounts = new Map<string, number>();
  
  records.forEach(record => {
    const name = record[nameField];
    if (name) {
      activityCounts.set(name, (activityCounts.get(name) || 0) + 1);
    }
  });
  
  // Sort by count and return the names
  return Array.from(activityCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0])
    .slice(0, 3);
};

// Process mood data from journal entries
const processMoodData = (journalEntries: DocumentData[]) => {
  const moodCounts = new Map<string, number>();
  let currentMood = "Neutral";
  let positiveCount = 0;
  let totalEntries = 0;
  
  journalEntries.forEach(entry => {
    const mood = entry.mood || "Neutral";
    moodCounts.set(mood, (moodCounts.get(mood) || 0) + 1);
    
    if (entry.createdAt && (!currentMood || entry.createdAt.toDate() > new Date())) {
      currentMood = mood;
    }
    
    if (["Happy", "Excited", "Joyful", "Cheerful", "Elated"].some(m => mood.includes(m))) {
      positiveCount++;
    }
    
    totalEntries++;
  });
  
  // Convert map to array for easier consumption
  const moodCountsArray = Array.from(moodCounts.entries())
    .map(([mood, count]) => ({ mood, count }))
    .sort((a, b) => b.count - a.count);
  
  const positivePercentage = totalEntries > 0 ? Math.round((positiveCount / totalEntries) * 100) : 0;
  
  return {
    currentMood,
    moodCounts: moodCountsArray,
    positivePercentage
  };
};

// Generate sports recommendations
const generateSportsRecommendations = (sportsList: string[]): string[] => {
  const recommendations = [
    "Regular practice sessions will help build consistency and skill development.",
    "Consider cross-training to improve overall athletic performance.",
    "Focus on developing fundamental skills before advancing to complex techniques."
  ];
  
  if (sportsList.length > 0) {
    recommendations.unshift(`Continue to develop skills in ${sportsList[0]} through regular practice.`);
  }
  
  return recommendations;
};

// Generate mood recommendation based on current mood
const generateMoodRecommendation = (mood: string): string => {
  if (["Happy", "Excited", "Joyful", "Cheerful", "Elated"].some(m => mood.includes(m))) {
    return "Maintain positive engagement through activities that bring joy and fulfillment.";
  } else if (["Sad", "Down", "Disappointed", "Upset"].some(m => mood.includes(m))) {
    return "Consider supportive conversations and engaging in favorite activities to improve mood.";
  } else if (["Tired", "Stressed", "Anxious", "Worried"].some(m => mood.includes(m))) {
    return "Focus on rest, relaxation techniques, and breaking tasks into smaller pieces.";
  } else if (["Calm", "Peaceful", "Relaxed"].some(m => mood.includes(m))) {
    return "This is a good time for reflection, planning, and thoughtful activities.";
  } else if (["Focused", "Determined", "Productive"].some(m => mood.includes(m))) {
    return "Channel this energy into challenging tasks and goal-oriented activities.";
  }
  
  return "Continue to express feelings through journaling and discussions.";
};

// Generate goal recommendation
const generateGoalRecommendation = (completed: number, pending: number): string => {
  if (completed === 0 && pending === 0) {
    return "Start by setting a few simple, achievable goals to build momentum.";
  } else if (completed > pending) {
    return "Great job completing goals! Continue setting new challenges to maintain progress.";
  } else if (pending > 3) {
    return "Consider prioritizing goals and focusing on completing a few at a time.";
  }
  
  return "Keep working steadily toward current goals while celebrating small victories.";
};

// Generate suggestions based on data
const generateSuggestions = (
  subjectScores: Array<{subject: string, score: number}>,
  strongSubjects: string[],
  weakSubjects: string[],
  sportsList: string[],
  activitiesList: string[],
  moodData: any
): string[] => {
  const suggestions: string[] = [];
  
  if (strongSubjects.length > 0) {
    suggestions.push(`Continue building on strengths in ${strongSubjects[0]}.`);
  }
  
  if (weakSubjects.length > 0) {
    suggestions.push(`Create a focused study plan for ${weakSubjects[0]} to improve understanding.`);
  }
  
  if (sportsList.length > 0) {
    suggestions.push(`Regular practice in ${sportsList[0]} will help develop consistent skills.`);
  } else {
    suggestions.push("Consider introducing regular physical activities to support overall development.");
  }
  
  if (activitiesList.length > 0) {
    suggestions.push(`Continue developing creative skills through ${activitiesList[0]}.`);
  } else {
    suggestions.push("Explore extracurricular activities to discover new interests and talents.");
  }
  
  if (moodData.moodCounts.length > 0) {
    suggestions.push("Continue using the journal to track and reflect on emotions and experiences.");
  } else {
    suggestions.push("Start a regular journaling practice to track progress and emotions.");
  }
  
  // Add general suggestions
  suggestions.push("Set specific, measurable goals for both academic and non-academic areas.");
  suggestions.push("Create a balanced weekly schedule with time for study, physical activity, and relaxation.");
  suggestions.push("Celebrate achievements regularly to maintain motivation.");
  
  return suggestions;
};

// Generate action plan
const generateActionPlan = (
  strongSubjects: string[],
  weakSubjects: string[],
  sportsList: string[],
  activitiesList: string[],
  pendingGoals: string[]
): {shortterm: string[], mediumterm: string[], longterm: string[]} => {
  const shortTerm: string[] = [];
  const mediumTerm: string[] = [];
  const longTerm: string[] = [];
  
  // Short term actions
  if (weakSubjects.length > 0) {
    shortTerm.push(`Create a focused study plan for ${weakSubjects[0]} with daily practice sessions.`);
  }
  
  if (sportsList.length > 0) {
    shortTerm.push(`Establish a regular practice routine for ${sportsList[0]}.`);
  } else {
    shortTerm.push("Try different physical activities to find ones that are enjoyable.");
  }
  
  shortTerm.push("Start a daily journal to track progress and reflect on learning.");
  shortTerm.push("Create a visual weekly schedule balancing academic and non-academic activities.");
  
  // Medium term actions
  if (strongSubjects.length > 0) {
    mediumTerm.push(`Explore advanced topics in ${strongSubjects[0]} to deepen understanding.`);
  }
  
  if (activitiesList.length > 0) {
    mediumTerm.push(`Look for opportunities to showcase skills in ${activitiesList[0]}.`);
  }
  
  mediumTerm.push("Develop consistent study habits for all subjects with weekly review sessions.");
  mediumTerm.push("Establish a goal tracking system with regular check-ins and adjustments.");
  
  // Long term actions
  longTerm.push("Work toward mastery in subjects of greatest interest and aptitude.");
  
  if (sportsList.length > 0 || activitiesList.length > 0) {
    longTerm.push(`Consider competitions or performances in ${sportsList[0] || activitiesList[0]}.`);
  }
  
  longTerm.push("Develop independent research projects in areas of interest.");
  longTerm.push("Establish consistent balance across academic, physical, and creative pursuits.");
  
  // Add any pending goals if they exist
  if (pendingGoals.length > 0) {
    shortTerm.push(`Complete current goal: ${pendingGoals[0]}`);
  }
  
  return {
    shortterm: shortTerm,
    mediumterm: mediumTerm,
    longterm: longTerm
  };
};

// Generate forecast
const generateForecast = (
  strongSubjects: string[],
  weakSubjects: string[],
  sportsList: string[],
  activitiesList: string[],
  growthScore: number
): string => {
  let forecast = "";
  
  if (growthScore > 75) {
    forecast = "Excellent progress across multiple domains indicates strong potential for continued growth. ";
  } else if (growthScore > 50) {
    forecast = "Good progress with opportunities for further development in specific areas. ";
  } else {
    forecast = "Early stages of development show potential that can be cultivated with focused support. ";
  }
  
  if (strongSubjects.length > 0) {
    forecast += `Continued focus on ${strongSubjects.join(' and ')} will help build a strong academic foundation. `;
  }
  
  if (weakSubjects.length > 0) {
    forecast += `Addressing challenges in ${weakSubjects.join(' and ')} will create more balanced academic progress. `;
  }
  
  if (sportsList.length > 0 || activitiesList.length > 0) {
    const activities = [...sportsList, ...activitiesList].slice(0, 2);
    forecast += `Development in ${activities.join(' and ')} contributes to a well-rounded growth profile. `;
  } else {
    forecast += "Exploring physical and creative activities will support well-rounded development. ";
  }
  
  forecast += "With consistent support and opportunities for practice, steady progress is expected across all areas.";
  
  return forecast;
};

// Calculate age from date of birth
const calculateAgeFromDOB = (dob: any): number => {
  if (!dob) return 0;
  
  try {
    const birthDate = dob instanceof Timestamp ? dob.toDate() : new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  } catch (error) {
    console.error("Error calculating age:", error);
    return 0;
  }
};
