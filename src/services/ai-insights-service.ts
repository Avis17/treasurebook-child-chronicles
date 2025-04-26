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

    console.log("data....", profileData)
    
    // Get academic records
    const academicRecords: DocumentData[] = await getCollectionDataByUserId("academicRecords", userId);
    console.log("Academic records:", academicRecords);
    
    // Get sports records
    const sportsRecords: DocumentData[] = await getCollectionDataByUserId("sportsRecords", userId);
    console.log("Sports records:", sportsRecords);
    
    // Get extracurricular records
    const extracurricularRecords: DocumentData[] = await getCollectionDataByUserId("extraCurricularRecords", userId);
    console.log("Extracurricular records:", extracurricularRecords);
    
    // Get journal entries
    const journalEntries: DocumentData[] = await getCollectionDataByUserId("journal", userId);
    console.log("Journal entries:", journalEntries);
    
    // Get goals
    const goals: DocumentData[] = await getCollectionDataByUserId("goals", userId);
    console.log("Goals:", goals);
    
    // Get feedback
    const feedback: DocumentData[] = await getCollectionDataByUserId("feedback", userId);
    console.log("Feedback:", feedback);

    // Get milestones
    const milestones: DocumentData[] = await getCollectionDataByUserId("milestones", userId);
    console.log("Milestones:", milestones);
    
    // Process and transform the data
    const transformedData = transformData(
      profileData, 
      academicRecords, 
      sportsRecords, 
      extracurricularRecords,
      journalEntries,
      goals,
      feedback,
      milestones
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
    const insightRef = doc(db, "insights", userId);
    await setDoc(insightRef, { 
      ...data, 
      updatedAt: Timestamp.now(),
      regenerated: true,
      regenerationCount: Math.floor(Math.random() * 1000) // Add a random value to ensure data changes
    });
    
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
        completed: false,
        text: description
      },
      {
        completed: false,
        text: "NIL"
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
      where("userId", "==", userId)
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
  feedback: DocumentData[],
  milestones: DocumentData[]
): AIInsightData => {
  
  // Extract and process academic data
  const subjectScores = processAcademicRecords(academicRecords);
  const averageScore = calculateAverageScore(subjectScores);
  const strongSubjects = subjectScores
    .filter(s => s.score >= 80)
    .map(s => s.subject);
  
  // Get subjects with scores below 40%
  const weakSubjects = subjectScores
    .filter(s => s.score < 40)
    .map(s => s.subject);
  
  // Extract and process sports data
  const sportsList = processTopActivities(sportsRecords, 'eventType', 'sportName');
  const sportsAchievements = sportsRecords
    .filter(record => record.position && (
      record.position.toLowerCase().includes('win') || 
      record.position.toLowerCase().includes('1st') ||
      record.position.toLowerCase().includes('gold') ||
      record.position.toLowerCase().includes('medal')
    ))
    .map(record => `${record.position} in ${record.eventType || record.sportName || 'Sports'}`);
  
  // Extract and process extracurricular data
  const activitiesList = processTopActivities(extracurricularRecords, 'activity', 'category');
  const extracurricularAchievements = extracurricularRecords
    .filter(record => record.achievement && record.achievement.trim() !== '')
    .map(record => `${record.achievement} in ${record.activity || record.category || 'Activity'}`);
  
  // Process journal entries for mood data
  const moodData = processMoodData(journalEntries);
  
  // Identify weak areas in sports (if any sports events with low performance)
  const weakSports: string[] = [];
  
  // Group sports by type and check performance
  const sportPerformance = new Map<string, { count: number, positions: string[] }>();
  
  sportsRecords.forEach(record => {
    const sportType = record.eventType || record.sportName || 'Unknown';
    if (!sportPerformance.has(sportType)) {
      sportPerformance.set(sportType, { count: 0, positions: [] });
    }
    
    const perf = sportPerformance.get(sportType);
    if (perf) {
      perf.count += 1;
      if (record.position) {
        perf.positions.push(record.position.toLowerCase());
      }
    }
  });
  
  // Analyze each sport's performance
  sportPerformance.forEach((perf, sport) => {
    // Check if there are achievements in this sport
    const hasGoodPerformance = perf.positions.some(pos => 
      pos.includes('1st') || 
      pos.includes('gold') || 
      pos.includes('winner') || 
      pos.includes('first')
    );
    
    const hasAveragePerformance = perf.positions.some(pos => 
      pos.includes('2nd') || 
      pos.includes('3rd') || 
      pos.includes('silver') || 
      pos.includes('bronze')
    );
    
    // If more than 3 events in this sport with no good performance, consider it a weak area
    if (perf.count >= 3 && !hasGoodPerformance) {
      weakSports.push(sport);
    }
    // Or if many events (5+) with no top-3 finishes
    else if (perf.count >= 5 && !hasAveragePerformance) {
      weakSports.push(sport);
    }
  });
  
  // Identify potential weak areas in extracurricular activities
  const weakActivities: string[] = [];
  
  // If there are no extracurricular activities recorded, suggest exploring them
  if (extracurricularRecords.length === 0) {
    weakActivities.push("Creative activities");
    weakActivities.push("Music");
    weakActivities.push("Arts");
  }
  
  // Check if there are any activity categories with no achievements
  const activityCategories = new Set(extracurricularRecords.map(r => r.category || 'Unknown'));
  for (const category of activityCategories) {
    const activitiesInCategory = extracurricularRecords.filter(r => (r.category || 'Unknown') === category);
    const achievementsInCategory = activitiesInCategory.filter(r => r.achievement && r.achievement.trim() !== '');
    
    if (achievementsInCategory.length === 0 && activitiesInCategory.length > 0) {
      weakActivities.push(category);
    }
  }
  
  // Get combined weak areas
  const combinedWeakAreas = [
    ...weakSubjects.map(subject => subject),
    ...weakSports.map(sport => sport),
    ...weakActivities
  ];
  
  // If there are no identified weak areas, add a placeholder
  if (combinedWeakAreas.length === 0 && subjectScores.length > 0) {
    // Find the lowest scoring subjects
    const sortedScores = [...subjectScores].sort((a, b) => a.score - b.score);
    if (sortedScores.length > 0) {
      // Take the lowest scoring subject as an area for improvement
      combinedWeakAreas.push(sortedScores[0].subject);
    }
  }
  
  // Process achievements by category
  const achievementsByCategory: Record<string, number> = {
    Academic: 0,
    Sports: 0,
    Extracurricular: 0
  };
  
  // Add academic achievements
  academicRecords
    .filter(record => record.score >= 80)
    .forEach(() => {
      achievementsByCategory['Academic'] = (achievementsByCategory['Academic'] || 0) + 1;
    });
  
  // Add sports achievements
  sportsRecords
    .filter(record => record.position && (
      record.position.toLowerCase().includes('gold') ||
      record.position.toLowerCase().includes('silver') ||
      record.position.toLowerCase().includes('bronze') ||
      record.position.toLowerCase().includes('1st') ||
      record.position.toLowerCase().includes('2nd') ||
      record.position.toLowerCase().includes('3rd')
    ))
    .forEach(() => {
      achievementsByCategory['Sports'] = (achievementsByCategory['Sports'] || 0) + 1;
    });
  
  // Add extracurricular achievements
  extracurricularRecords
    .filter(record => record.achievement)
    .forEach(() => {
      achievementsByCategory['Extracurricular'] = (achievementsByCategory['Extracurricular'] || 0) + 1;
    });
  
  // Also include milestones in achievements
  milestones.forEach(milestone => {
    const category = milestone.category || 'Other';
    achievementsByCategory[category] = (achievementsByCategory[category] || 0) + 1;
  });
  
  // Process recent achievements
  const recentAchievements = [
    ...sportsAchievements, 
    ...extracurricularAchievements,
    ...academicRecords
      .filter(record => record.score && record.score > 85)
      .map(record => `Scored ${record.score}% in ${record.subject || 'Subject'}`),
    ...milestones.map(m => m.title || m.description || 'Achievement')
  ].slice(0, 7);
  
  // Process goals data
  const completedGoals = goals.filter(goal => goal.status === 'Completed').length;
  const pendingGoals = goals
    .filter(goal => goal.status !== 'Completed')
    .map(goal => goal.title);
  
  // Process feedback data
  const feedbackComments = feedback.map(f => f.content || f.message || '').filter(Boolean);
  // Simple sentiment analysis to determine positive vs improvement areas
  const positiveComments = feedbackComments.filter(comment => 
    /good|excellent|great|wonderful|positive|well done|impressive/i.test(comment)
  );
  const improvementAreas = feedbackComments.filter(comment => 
    /improve|better|work on|focus on|needs|should|could|try to|consider/i.test(comment)
  );
  
  // Get combined top skills (academic, sports, extracurricular)
  const combinedTopSkills = [
    ...strongSubjects.map(subject => ({ type: 'academic', skill: subject })),
    ...sportsList.map(sport => ({ type: 'sports', skill: sport })),
    ...activitiesList.map(activity => ({ type: 'extracurricular', skill: activity }))
  ];
  
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
  
  // Calculate SMART balanced growth score
const academicScore = averageScore; // 0-100

const sportsScore = sportsAchievements.length > 0 ? 100 : (sportsList.length > 0 ? 60 : 40);
const talentScore = extracurricularAchievements.length > 0 ? 100 : (activitiesList.length > 0 ? 60 : 40);
const emotionalScore = moodData.positivePercentage || 50;

const growthScore = Math.min(100, Math.round(
  (academicScore * 0.4) +
  (sportsScore * 0.2) +
  (talentScore * 0.2) +
  (emotionalScore * 0.2)
));

  
  // Build and return the full insight data structure
  return {
    childSnapshot: {
      name: profile?.childName || profile?.name || 'Student',
      age: calculateAgeFromDOB(profile?.birthdate) || 0,
      class: profile?.currentClass || profile?.grade || '--',
      growthScore: Math.min(growthScore, 100),
      topSkills: combinedTopSkills.slice(0, 5).map(item => item.skill),
      weakAreas: combinedWeakAreas.slice(0, 5)
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
      positive: positiveComments.length > 0 ? positiveComments : ['Continues to show good progress overall.'],
      areasOfImprovement: improvementAreas.length > 0 ? improvementAreas : ['Focus on maintaining consistency across all subjects.'],
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
    if (record.subject && record.score !== undefined) {
      // Normalize subject name (lowercase and trim)
      const subject = (record.subject || '').toLowerCase().trim();
      if (!subject) return;
      
      // Calculate percentage score consistently
      let scoreValue: number;
      
      // If isPercentage flag exists and is true, use score directly
      if (record.isPercentage === true) {
        scoreValue = parseFloat(record.score);
      } 
      // Otherwise calculate based on score and maxScore
      else {
        const maxScore = parseFloat(record.maxScore) || 100;
        scoreValue = (parseFloat(record.score) / maxScore) * 100;
      }
      
      if (!isNaN(scoreValue)) {
        if (!subjectScoresMap.has(subject)) {
          subjectScoresMap.set(subject, []);
        }
        subjectScoresMap.get(subject)?.push(scoreValue);
      }
    }
  });
  
  // Calculate average for each subject
  const subjectScores: Array<{subject: string, score: number}> = [];
  
  subjectScoresMap.forEach((scores, subject) => {
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    subjectScores.push({
      subject: subject.charAt(0).toUpperCase() + subject.slice(1), // Capitalize first letter
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
const processTopActivities = (records: DocumentData[], primaryField: string, fallbackField: string): string[] => {
  const activityCounts = new Map<string, number>();
  
  records.forEach(record => {
    // Try to get name from primary field, then fallback field
    const name = (record[primaryField] || record[fallbackField] || '').trim();
    
    if (name) {
      // Normalize and capitalize first letter of each word
      const normalizedName = name.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
      activityCounts.set(normalizedName, (activityCounts.get(normalizedName) || 0) + 1);
    }
  });
  
  // Sort by count and return the names
  return Array.from(activityCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0])
    .slice(0, 5);
};

// Process mood data from journal entries
const processMoodData = (journalEntries: DocumentData[]) => {
  const moodCounts = new Map<string, number>();
  let currentMood = "Neutral";
  let latestMoodTimestamp = new Date(0);
  let positiveCount = 0;
  let totalEntries = 0;
  
  journalEntries.forEach(entry => {
    const mood = entry.mood || "Neutral";
    moodCounts.set(mood, (moodCounts.get(mood) || 0) + 1);
    
    // Track the most recent mood
    const entryDate = entry.createdAt ? 
      (entry.createdAt.toDate ? entry.createdAt.toDate() : new Date(entry.createdAt)) : 
      new Date(entry.date || 0);
      
    if (entryDate > latestMoodTimestamp) {
      latestMoodTimestamp = entryDate;
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
  
  if (sportsList.length > 1) {
    recommendations.push(`Balance time between ${sportsList[0]} and ${sportsList[1]} for well-rounded development.`);
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
  
  // Academic suggestions
  if (strongSubjects.length > 0) {
    suggestions.push(`Continue building on strengths in ${strongSubjects.join(', ')}.`);
    suggestions.push(`Consider exploring advanced topics or competitions in ${strongSubjects[0]}.`);
  }
  
  if (weakSubjects.length > 0) {
    suggestions.push(`Create a focused study plan for ${weakSubjects.join(', ')} to improve understanding.`);
    suggestions.push(`Consider additional support or resources for ${weakSubjects[0]}.`);
  }
  
  // Sports suggestions
  if (sportsList.length > 0) {
    suggestions.push(`Regular practice in ${sportsList.join(', ')} will help develop consistent skills.`);
    suggestions.push(`Look for opportunities to participate in competitions for ${sportsList[0]}.`);
  } else {
    suggestions.push("Consider introducing regular physical activities to support overall development.");
    suggestions.push("Explore various sports to find ones that are enjoyable and engaging.");
  }
  
  // Extracurricular suggestions
  if (activitiesList.length > 0) {
    suggestions.push(`Continue developing creative skills through ${activitiesList.join(', ')}.`);
    suggestions.push(`Seek opportunities to showcase talents in ${activitiesList[0]}.`);
  } else {
    suggestions.push("Explore extracurricular activities to discover new interests and talents.");
    suggestions.push("Try different types of activities - arts, music, technology, language - to find areas of interest.");
  }
  
  // Journal/emotional suggestions
  if (moodData.moodCounts && moodData.moodCounts.length > 0) {
    suggestions.push("Continue using the journal to track and reflect on emotions and experiences.");
    
    if (moodData.currentMood && moodData.currentMood !== "Neutral") {
      if (["Happy", "Excited", "Joyful"].some(m => moodData.currentMood.includes(m))) {
        suggestions.push("Channel positive energy into challenging academic and creative pursuits.");
      } else if (["Sad", "Tired", "Stressed"].some(m => moodData.currentMood.includes(m))) {
        suggestions.push("Build in regular breaks and enjoyable activities to manage stress levels.");
      }
    }
  } else {
    suggestions.push("Start a regular journaling practice to track progress and emotions.");
  }
  
  // Add general suggestions
  suggestions.push("Set specific, measurable goals for both academic and non-academic areas.");
  suggestions.push("Create a balanced weekly schedule with time for study, physical activity, and relaxation.");
  suggestions.push("Celebrate achievements regularly to maintain motivation.");
  suggestions.push("Explore new topics and activities outside regular curriculum to foster well-rounded growth.");
  suggestions.push("Practice mindfulness or relaxation techniques to support emotional well-being.");
  
  // Return a subset to avoid overwhelming the user
  return suggestions.slice(0, 8);
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
    shortTerm.push(`Create a focused study plan for ${weakSubjects.join(', ')} with daily practice sessions.`);
  }
  
  if (sportsList.length > 0) {
    shortTerm.push(`Establish a regular practice routine for ${sportsList.join(', ')}.`);
  } else {
    shortTerm.push("Try different physical activities to find ones that are enjoyable.");
  }
  
  shortTerm.push("Start a daily journal to track progress and reflect on learning.");
  shortTerm.push("Create a visual weekly schedule balancing academic and non-academic activities.");
  
  // Medium term actions
  if (strongSubjects.length > 0) {
    mediumTerm.push(`Explore advanced topics in ${strongSubjects.join(', ')} to deepen understanding.`);
  }
  
  if (activitiesList.length > 0) {
    mediumTerm.push(`Look for opportunities to showcase skills in ${activitiesList.join(', ')}.`);
  }
  
  mediumTerm.push("Develop consistent study habits for all subjects with weekly review sessions.");
  mediumTerm.push("Establish a goal tracking system with regular check-ins and adjustments.");
  
  // Long term actions
  longTerm.push("Work toward mastery in subjects of greatest interest and aptitude.");
  
  if (sportsList.length > 0 || activitiesList.length > 0) {
    const activities = [...sportsList, ...activitiesList].slice(0, 2);
    longTerm.push(`Consider competitions or performances in ${activities.join(' and ')}.`);
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
