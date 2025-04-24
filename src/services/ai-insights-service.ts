import { auth, db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  DocumentData,
  QuerySnapshot,
} from "firebase/firestore";
import suggestions from "@/data/ai-insights/suggestions.json";
import forecasts from "@/data/ai-insights/forecasts.json";
import actionPlans from "@/data/ai-insights/action-plans.json";

export interface ChildData {
  name: string;
  age: number;
  class: string;
  topSkill: string;
  weakArea: string;
  growthScore: number;
}

export interface AcademicData {
  averageScore: number;
  strongSubject: string;
  strongGrade: string;
  weakSubject: string;
  weakGrade: string;
  subjectScores: Array<{ subject: string; score: number; grade: string }>;
}

export interface TalentData {
  topActivity: string;
  achievements: string[];
  enjoyment: string;
}

export interface PhysicalData {
  topSport: string;
  achievements: string[];
  recommendation: string;
}

export interface EmotionalData {
  currentMood: string;
  moodHistory: Array<{ mood: string; count: number }>;
  recommendation: string;
}

export interface AchievementData {
  recent: string[];
  byCategory: { [key: string]: number };
}

export interface GoalData {
  completed: number;
  pending: string[];
  recommendation: string;
}

export interface FeedbackData {
  positive: string[];
  areasOfImprovement: string[];
  recommendation: string;
}

export interface AIInsightData {
  childSnapshot: ChildData;
  academic: AcademicData;
  talent: TalentData;
  physical: PhysicalData;
  emotional: EmotionalData;
  achievements: AchievementData;
  goals: GoalData;
  feedback: FeedbackData;
  suggestions: string[];
  forecast: string;
  actionPlan: {
    shortTerm: string[];
    mediumTerm: string[];
    longTerm: string[];
  };
}

interface ForecastCondition {
  type: string;
  subjects?: string[] | null;
  activities?: string[] | null;
  keyword?: string | null;
  minCount?: number;
  deviation?: number;
}

interface ForecastTrigger {
  conditions: ForecastCondition[];
}

interface Forecast {
  id: string;
  trigger: ForecastTrigger;
  content: string;
}

interface ActionPlanTrigger {
  condition: string;
  subject: string | null;
  activity: string | null;
  threshold: number;
  operator?: string;
}

interface ActionPlan {
  id: string;
  trigger: ActionPlanTrigger;
  shortTerm: string[];
  mediumTerm: string[];
  longTerm: string[];
}

interface SuggestionTrigger {
  condition: string;
  subject?: string | null;
  activity?: string | null;
  activityType?: string | null;
  threshold?: number;
  timeframe?: string;
  operator?: string;
  completed?: boolean;
}

interface Suggestion {
  id: string;
  trigger: SuggestionTrigger;
  content: string;
  priority: number;
  category: string;
}

const typedForecasts = forecasts as Forecast[];
const typedActionPlans = actionPlans as ActionPlan[];
const typedSuggestions = suggestions as Suggestion[];

const getGradeFromScore = (score: number): string => {
  if (score >= 90) return "A";
  if (score >= 80) return "B+";
  if (score >= 70) return "B";
  if (score >= 60) return "C+";
  if (score >= 50) return "C";
  if (score >= 40) return "D";
  return "F";
};

const calculateAverageScore = (scores: number[]): number => {
  if (scores.length === 0) return 0;
  const sum = scores.reduce((a, b) => a + b, 0);
  return Math.round((sum / scores.length) * 100) / 100;
};

const processAcademicData = (academicRecords: DocumentData[]): AcademicData => {
  if (academicRecords.length === 0) {
    return {
      averageScore: 0,
      strongSubject: "N/A",
      strongGrade: "N/A",
      weakSubject: "N/A",
      weakGrade: "N/A",
      subjectScores: [],
    };
  }

  const subjectData: { [key: string]: { scores: number[]; grades: string[] } } = {};

  academicRecords.forEach((record) => {
    const subject = record.subject;
    const score = record.isPercentage 
      ? record.score 
      : (record.score / record.maxScore) * 100;
    const grade = record.grade || getGradeFromScore(score);

    if (!subjectData[subject]) {
      subjectData[subject] = { scores: [], grades: [] };
    }
    
    subjectData[subject].scores.push(score);
    subjectData[subject].grades.push(grade);
  });

  const subjectScores = Object.entries(subjectData).map(([subject, data]) => {
    const avgScore = calculateAverageScore(data.scores);
    const grade = data.grades.length > 0 ? data.grades[data.grades.length - 1] : getGradeFromScore(avgScore);
    
    return { subject, score: Math.round(avgScore), grade };
  });

  subjectScores.sort((a, b) => b.score - a.score);

  const allScores = subjectScores.map(item => item.score);
  const averageScore = calculateAverageScore(allScores);

  const strongSubject = subjectScores.length > 0 ? subjectScores[0].subject : "N/A";
  const strongGrade = subjectScores.length > 0 ? subjectScores[0].grade : "N/A";
  
  const weakSubject = subjectScores.length > 0 
    ? subjectScores[subjectScores.length - 1].subject 
    : "N/A";
  const weakGrade = subjectScores.length > 0 
    ? subjectScores[subjectScores.length - 1].grade 
    : "N/A";

  return {
    averageScore: Math.round(averageScore),
    strongSubject,
    strongGrade,
    weakSubject,
    weakGrade,
    subjectScores,
  };
};

const processTalentData = (extraRecords: DocumentData[]): TalentData => {
  if (extraRecords.length === 0) {
    return {
      topActivity: "N/A",
      achievements: [],
      enjoyment: "Not enough data available",
    };
  }

  const activityCount: { [key: string]: number } = {};
  extraRecords.forEach((record) => {
    const activity = record.activity;
    activityCount[activity] = (activityCount[activity] || 0) + 1;
  });

  const topActivity = Object.entries(activityCount)
    .sort(([, a], [, b]) => b - a)[0][0];

  const achievements = extraRecords
    .filter(record => record.activity === topActivity && record.achievement)
    .map(record => record.achievement);

  const enjoyment = achievements.length > 0
    ? `Child shows consistent engagement in ${topActivity} with notable achievements.`
    : `Child regularly participates in ${topActivity} activities.`;

  return {
    topActivity,
    achievements: achievements.slice(0, 3),
    enjoyment,
  };
};

const processPhysicalData = (sportsRecords: DocumentData[]): PhysicalData => {
  if (sportsRecords.length === 0) {
    return {
      topSport: "N/A",
      achievements: [],
      recommendation: "Not enough data available",
    };
  }

  const sportCount: { [key: string]: number } = {};
  sportsRecords.forEach((record) => {
    const sport = record.sport;
    sportCount[sport] = (sportCount[sport] || 0) + 1;
  });

  const topSport = Object.entries(sportCount)
    .sort(([, a], [, b]) => b - a)[0][0];

  const achievements = sportsRecords
    .filter(record => record.sport === topSport && record.achievement)
    .map(record => record.achievement);

  let recommendation = "";
  
  const sportsArray = Object.keys(sportCount);
  if (sportsArray.length === 1) {
    recommendation = `Consider adding another physical activity like swimming to complement ${topSport}.`;
  } else if (sportCount[topSport] > 5) {
    recommendation = `Strong progress in ${topSport}. Consider competitive opportunities.`;
  } else {
    recommendation = `Regular practice will help build skills in ${topSport}.`;
  }

  return {
    topSport,
    achievements: achievements.slice(0, 3),
    recommendation,
  };
};

const processEmotionalData = (journalRecords: DocumentData[]): EmotionalData => {
  if (journalRecords.length === 0) {
    return {
      currentMood: "Unknown",
      moodHistory: [],
      recommendation: "Start journaling to track emotional growth",
    };
  }

  const sortedJournals = [...journalRecords].sort(
    (a, b) => (b.date?.toMillis() || 0) - (a.date?.toMillis() || 0)
  );

  const currentMood = sortedJournals[0]?.mood || "Unknown";

  const moodCount: { [key: string]: number } = {};
  journalRecords.forEach((record) => {
    if (record.mood) {
      moodCount[record.mood] = (moodCount[record.mood] || 0) + 1;
    }
  });

  const moodHistory = Object.entries(moodCount)
    .map(([mood, count]) => ({ mood, count }))
    .sort((a, b) => b.count - a.count);

  let recommendation = "";
  if (journalRecords.length < 4) {
    recommendation = "Encourage more regular journaling to better understand emotional patterns.";
  } else if (Object.keys(moodCount).length < 3) {
    recommendation = "Explore a wider range of emotions in journal entries.";
  } else {
    recommendation = "Continue the consistent journaling habit to maintain emotional awareness.";
  }

  return {
    currentMood,
    moodHistory,
    recommendation,
  };
};

const processAchievementData = (
  academicRecords: DocumentData[],
  extraRecords: DocumentData[],
  sportsRecords: DocumentData[]
): AchievementData => {
  const achievements: {
    text: string;
    category: string;
    date: number;
  }[] = [];

  academicRecords.forEach(record => {
    if (record.achievement || (record.score && record.score > 80)) {
      achievements.push({
        text: record.achievement || `High score in ${record.subject}: ${record.score}`,
        category: "Academic",
        date: record.date?.toMillis() || 0,
      });
    }
  });

  extraRecords.forEach(record => {
    if (record.achievement) {
      achievements.push({
        text: record.achievement,
        category: "Arts",
        date: record.date?.toMillis() || 0,
      });
    }
  });

  sportsRecords.forEach(record => {
    if (record.achievement) {
      achievements.push({
        text: record.achievement,
        category: "Sports",
        date: record.date?.toMillis() || 0,
      });
    }
  });

  achievements.sort((a, b) => b.date - a.date);

  const byCategory: { [key: string]: number } = {};
  achievements.forEach(item => {
    byCategory[item.category] = (byCategory[item.category] || 0) + 1;
  });

  return {
    recent: achievements.slice(0, 5).map(item => item.text),
    byCategory,
  };
};

const processGoalData = (goalRecords: DocumentData[]): GoalData => {
  if (goalRecords.length === 0) {
    return {
      completed: 0,
      pending: [],
      recommendation: "Set some goals to track progress",
    };
  }

  const completed = goalRecords.filter(goal => goal.completed).length;
  
  const pendingGoals = goalRecords
    .filter(goal => !goal.completed)
    .sort((a, b) => (a.priority || 999) - (b.priority || 999))
    .map(goal => goal.title);

  let recommendation = "";
  const completionRate = goalRecords.length > 0 
    ? completed / goalRecords.length
    : 0;

  if (completionRate < 0.3) {
    recommendation = "Focus on completing one goal at a time.";
  } else if (pendingGoals.length > 3) {
    recommendation = "Prioritize the top 3 pending goals for focus.";
  } else if (pendingGoals.length === 0) {
    recommendation = "Set new challenging goals to continue growth.";
  } else {
    recommendation = `Focus on the ${pendingGoals[0]} goal first.`;
  }

  return {
    completed,
    pending: pendingGoals.slice(0, 3),
    recommendation,
  };
};

const processFeedbackData = (feedbackRecords: DocumentData[]): FeedbackData => {
  if (feedbackRecords.length === 0) {
    return {
      positive: [],
      areasOfImprovement: [],
      recommendation: "No feedback data available",
    };
  }

  const sortedFeedback = [...feedbackRecords].sort(
    (a, b) => (b.date?.toMillis() || 0) - (a.date?.toMillis() || 0)
  );

  const positive = sortedFeedback
    .filter(record => record.positivePoints)
    .flatMap(record => record.positivePoints)
    .filter((item: string, index: number, self: string[]) => 
      self.indexOf(item) === index
    );

  const areasOfImprovement = sortedFeedback
    .filter(record => record.improvementAreas)
    .flatMap(record => record.improvementAreas)
    .filter((item: string, index: number, self: string[]) => 
      self.indexOf(item) === index
    );

  let recommendation = "";
  
  if (sortedFeedback.length > 0 && sortedFeedback[0].teacherRecommendation) {
    recommendation = sortedFeedback[0].teacherRecommendation;
  } else if (areasOfImprovement.length > 0) {
    recommendation = `Focus on improving: ${areasOfImprovement[0]}.`;
  } else {
    recommendation = "Continue building on strengths.";
  }

  return {
    positive: positive.slice(0, 3),
    areasOfImprovement: areasOfImprovement.slice(0, 2),
    recommendation,
  };
};

const determineStrengthsAndWeaknesses = (
  academic: AcademicData,
  talent: TalentData,
  physical: PhysicalData
): { topSkill: string, weakArea: string, growthScore: number } => {
  let topSkill = "Not enough data";
  let weakArea = "Not enough data";
  let growthScore = 50;

  if (academic.subjectScores.length > 0 && academic.strongSubject !== "N/A") {
    if (talent.topActivity !== "N/A" && physical.topSport !== "N/A") {
      const academicScore = academic.subjectScores.find(s => s.subject === academic.strongSubject)?.score || 0;
      const hasExtracurricularAchievements = talent.achievements.length > 0;
      const hasSportsAchievements = physical.achievements.length > 0;
      
      if (hasExtracurricularAchievements && (!hasSportsAchievements && academicScore < 85)) {
        topSkill = talent.topActivity;
      } else if (hasSportsAchievements && (!hasExtracurricularAchievements && academicScore < 85)) {
        topSkill = physical.topSport;
      } else if (academicScore > 85) {
        topSkill = academic.strongSubject;
      } else {
        if (hasExtracurricularAchievements && hasSportsAchievements) {
          topSkill = `${talent.topActivity} + ${physical.topSport}`;
        } else {
          topSkill = academic.strongSubject;
        }
      }
    } else if (talent.topActivity !== "N/A") {
      topSkill = talent.topActivity;
    } else if (physical.topSport !== "N/A") {
      topSkill = physical.topSport;
    } else {
      topSkill = academic.strongSubject;
    }
  } else if (talent.topActivity !== "N/A") {
    topSkill = talent.topActivity;
  } else if (physical.topSport !== "N/A") {
    topSkill = physical.topSport;
  }
  
  if (academic.subjectScores.length > 0 && academic.weakSubject !== "N/A") {
    weakArea = academic.weakSubject;
  }
  
  if (academic.subjectScores.length > 0) {
    growthScore = academic.averageScore;
    
    if (talent.achievements.length > 0) {
      growthScore += 5;
    }
    
    if (physical.achievements.length > 0) {
      growthScore += 5;
    }
    
    growthScore = Math.min(100, Math.round(growthScore));
  }
  
  return { topSkill, weakArea, growthScore };
};

const getSuggestionsForStudent = (
  academic: AcademicData,
  talent: TalentData,
  physical: PhysicalData,
  emotional: EmotionalData,
  goals: GoalData
): string[] => {
  const matchedSuggestions: string[] = [];
  
  typedSuggestions.forEach(suggestion => {
    let isMatch = false;
    
    if (suggestion.trigger.condition === "academicScore" && suggestion.trigger.subject) {
      const subjectScore = academic.subjectScores.find(
        s => s.subject.toLowerCase() === suggestion.trigger.subject.toLowerCase()
      )?.score;
      
      if (subjectScore !== undefined && suggestion.trigger.threshold !== undefined) {
        if (suggestion.trigger.operator === "lt" && subjectScore < suggestion.trigger.threshold) {
          isMatch = true;
        } else if (suggestion.trigger.operator === "gt" && subjectScore > suggestion.trigger.threshold) {
          isMatch = true;
        } else if (suggestion.trigger.operator === "gte" && subjectScore >= suggestion.trigger.threshold) {
          isMatch = true;
        } else if (suggestion.trigger.operator === "eq" && subjectScore === suggestion.trigger.threshold) {
          isMatch = true;
        } else if (!suggestion.trigger.operator && subjectScore === suggestion.trigger.threshold) {
          isMatch = true;
        }
      }
    } else if (suggestion.trigger.condition === "academicScore" && suggestion.trigger.activity) {
      if (talent.topActivity === suggestion.trigger.activity && suggestion.trigger.threshold !== undefined) {
        if (academic.averageScore !== undefined) {
          if (suggestion.trigger.operator === "lt" && academic.averageScore < suggestion.trigger.threshold) {
            isMatch = true;
          } else if (suggestion.trigger.operator === "gt" && academic.averageScore > suggestion.trigger.threshold) {
            isMatch = true;
          } else if (suggestion.trigger.operator === "gte" && academic.averageScore >= suggestion.trigger.threshold) {
            isMatch = true;
          } else if (suggestion.trigger.operator === "eq" && academic.averageScore === suggestion.trigger.threshold) {
            isMatch = true;
          }
        }
      }
    } else if (suggestion.trigger.condition === "activityEngagement" && suggestion.trigger.activity) {
      if (talent.topActivity === suggestion.trigger.activity || physical.topSport === suggestion.trigger.activity) {
        isMatch = true;
      }
    } else if (suggestion.trigger.condition === "journalCount") {
      const journalCount = emotional.moodHistory.reduce((sum, item) => sum + item.count, 0);
      
      if (suggestion.trigger.threshold !== undefined) {
        if (suggestion.trigger.operator === "lt" && journalCount < suggestion.trigger.threshold) {
          isMatch = true;
        } else if (suggestion.trigger.operator === "gt" && journalCount > suggestion.trigger.threshold) {
          isMatch = true;
        } else if (suggestion.trigger.operator === "gte" && journalCount >= suggestion.trigger.threshold) {
          isMatch = true;
        } else if (suggestion.trigger.operator === "eq" && journalCount === suggestion.trigger.threshold) {
          isMatch = true;
        }
      }
    } else if (suggestion.trigger.condition === "moodPattern" && suggestion.trigger.subject) {
      const subjectScore = academic.subjectScores.find(
        s => s.subject.toLowerCase() === suggestion.trigger.subject.toLowerCase()
      )?.score;
      
      if (subjectScore !== undefined && suggestion.trigger.threshold !== undefined) {
        if (suggestion.trigger.operator === "lt" && subjectScore < suggestion.trigger.threshold) {
          isMatch = true;
        } else if (suggestion.trigger.operator === "gt" && subjectScore > suggestion.trigger.threshold) {
          isMatch = true;
        } else if (suggestion.trigger.operator === "gte" && subjectScore >= suggestion.trigger.threshold) {
          isMatch = true;
        } else if (suggestion.trigger.operator === "eq" && subjectScore === suggestion.trigger.threshold) {
          isMatch = true;
        }
      }
    } else if (suggestion.trigger.condition === "moodPattern" && suggestion.trigger.activity) {
      if ((talent.topActivity === suggestion.trigger.activity || physical.topSport === suggestion.trigger.activity) 
          && suggestion.trigger.threshold !== undefined) {
        const journalCount = emotional.moodHistory.reduce((sum, item) => sum + item.count, 0);
        
        if (suggestion.trigger.operator === "lt" && journalCount < suggestion.trigger.threshold) {
          isMatch = true;
        } else if (suggestion.trigger.operator === "gt" && journalCount > suggestion.trigger.threshold) {
          isMatch = true;
        } else if (suggestion.trigger.operator === "gte" && journalCount >= suggestion.trigger.threshold) {
          isMatch = true;
        } else if (suggestion.trigger.operator === "eq" && journalCount === suggestion.trigger.threshold) {
          isMatch = true;
        }
      }
    } else if (suggestion.trigger.condition === "goalExists") {
      if (suggestion.trigger.activity) {
        const matchingGoal = goals.pending.some(goal => 
          goal.toLowerCase().includes(suggestion.trigger.activity?.toLowerCase() || "")
        );
        
        if (matchingGoal) {
          isMatch = true;
        }
      } else if (suggestion.trigger.subject) {
        const matchingGoal = goals.pending.some(goal => 
          goal.toLowerCase().includes(suggestion.trigger.subject?.toLowerCase() || "")
        );
        
        if (matchingGoal) {
          isMatch = true;
        }
      } else if (suggestion.trigger.threshold !== undefined) {
        if (suggestion.trigger.operator === "lt" && goals.completed < suggestion.trigger.threshold) {
          isMatch = true;
        } else if (suggestion.trigger.operator === "gt" && goals.completed > suggestion.trigger.threshold) {
          isMatch = true;
        } else if (suggestion.trigger.operator === "gte" && goals.completed >= suggestion.trigger.threshold) {
          isMatch = true;
        } else if (suggestion.trigger.operator === "eq" && goals.completed === suggestion.trigger.threshold) {
          isMatch = true;
        }
      }
    }
    
    if (isMatch) {
      matchedSuggestions.push(suggestion.content);
    }
  });
  
  if (matchedSuggestions.length === 0) {
    if (academic.weakSubject !== "N/A") {
      matchedSuggestions.push(`Focus on improving ${academic.weakSubject} with regular practice.`);
    } else {
      matchedSuggestions.push("Set specific goals and track progress regularly.");
    }
  }
  
  return matchedSuggestions;
};

const getForecastForStudent = (
  academic: AcademicData,
  talent: TalentData,
  physical: PhysicalData,
  emotional: EmotionalData,
  feedback: FeedbackData
): string => {
  for (const forecast of typedForecasts) {
    let allConditionsMet = true;
    
    for (const condition of forecast.trigger.conditions) {
      let conditionMet = false;
      
      switch (condition.type) {
        case "academicStrength":
          if (condition.subjects && condition.minCount) {
            const strongSubjectsCount = condition.subjects.filter(subject => {
              const matchingSubject = academic.subjectScores.find(
                s => s.subject && subject && s.subject.toLowerCase() === subject.toLowerCase()
              );
              return matchingSubject && matchingSubject.score > 75;
            }).length;
            
            conditionMet = strongSubjectsCount >= condition.minCount;
          } else if (condition.activities && condition.minCount) {
            conditionMet = condition.activities.some(activity =>
              activity && physical.topSport && physical.topSport.toLowerCase().includes(activity.toLowerCase())
            );
          } else {
            conditionMet = true;
          }
          break;

        case "activityEngagement":
          if (condition.activities && condition.minCount) {
            const activityMatched = condition.activities.some(activity => 
              activity && talent.topActivity && talent.topActivity.toLowerCase().includes(activity.toLowerCase())
            );
            
            conditionMet = activityMatched;
          } else {
            conditionMet = true;
          }
          break;

        case "sportAchievement":
          if (condition.minCount) {
            conditionMet = physical.achievements.length >= condition.minCount;
          } else {
            conditionMet = true;
          }
          break;

        case "balancedScores":
          if (academic.subjectScores.length > 1 && condition.deviation) {
            const scores = academic.subjectScores.map(s => s.score);
            const max = Math.max(...scores);
            const min = Math.min(...scores);
            conditionMet = (max - min) <= condition.deviation;
          } else {
            conditionMet = false;
          }
          break;
          
        case "projectParticipation":
          if (condition.subjects && condition.minCount) {
            const relevantSubjectsCount = condition.subjects.filter(subject => {
              return academic.subjectScores.some(s => 
                subject && s.subject && s.subject.toLowerCase() === subject.toLowerCase() && s.score > 70
              );
            }).length;
            
            conditionMet = relevantSubjectsCount >= condition.minCount;
          } else if (condition.activities && condition.minCount) {
            conditionMet = condition.activities.some(activity => {
              return activity && (
                (talent.topActivity && talent.topActivity.toLowerCase() === activity.toLowerCase()) ||
                (physical.topSport && physical.topSport.toLowerCase() === activity.toLowerCase())
              );
            });
          } else if (condition.keyword && condition.minCount) {
            const keywordCount = [...feedback.positive, ...feedback.areasOfImprovement].filter(
              item => item.toLowerCase().includes(condition.keyword?.toLowerCase() || "")
            ).length;
            
            conditionMet = keywordCount >= condition.minCount;
          } else {
            conditionMet = true;
          }
          break;
          
        case "journalMood":
          if (condition.subjects && condition.minCount) {
            const moodEntryCount = emotional.moodHistory.reduce((sum, item) => sum + item.count, 0);
            conditionMet = moodEntryCount >= condition.minCount;
          } else if (condition.activities && condition.minCount) {
            const moodEntryCount = emotional.moodHistory.reduce((sum, item) => sum + item.count, 0);
            conditionMet = moodEntryCount >= condition.minCount;
          } else if (condition.keyword && condition.minCount) {
            const moodWithKeywordCount = emotional.moodHistory
              .filter(m => m.mood.toLowerCase().includes(condition.keyword?.toLowerCase() || ""))
              .reduce((sum, item) => sum + item.count, 0);
            
            conditionMet = moodWithKeywordCount >= condition.minCount;
          } else if (condition.minCount) {
            const moodEntryCount = emotional.moodHistory.reduce((sum, item) => sum + item.count, 0);
            conditionMet = moodEntryCount >= condition.minCount;
          } else {
            conditionMet = true;
          }
          break;
          
        case "feedback":
          if (condition.subjects && condition.minCount) {
            const feedbackCount = [...feedback.positive, ...feedback.areasOfImprovement].filter(item => 
              condition.subjects?.some(subject => 
                subject && item.toLowerCase().includes(subject.toLowerCase())
              )
            ).length;
            
            conditionMet = feedbackCount >= condition.minCount;
          } else if (condition.activities && condition.minCount) {
            const feedbackCount = [...feedback.positive, ...feedback.areasOfImprovement].filter(item => 
              condition.activities?.some(activity => 
                activity && item.toLowerCase().includes(activity.toLowerCase())
              )
            ).length;
            
            conditionMet = feedbackCount >= condition.minCount;
          } else if (condition.keyword && condition.minCount) {
            const feedbackCount = [...feedback.positive, ...feedback.areasOfImprovement].filter(
              item => item.toLowerCase().includes(condition.keyword?.toLowerCase() || "")
            ).length;
            
            conditionMet = feedbackCount >= condition.minCount;
          } else if (condition.minCount) {
            conditionMet = feedback.positive.length + feedback.areasOfImprovement.length >= condition.minCount;
          } else {
            conditionMet = true;
          }
          break;

        case "gradeLevel":
          if (condition.subject) {
            const subjectScore = academic.subjectScores.find(
              s => s.subject.toLowerCase() === condition.subject?.toLowerCase()
            )?.score;
            
            if (subjectScore !== undefined && condition.threshold !== undefined) {
              if (condition.operator === "lt" && subjectScore < condition.threshold) {
                conditionMet = true;
              } else if (condition.operator === "gt" && subjectScore > condition.threshold) {
                conditionMet = true;
              } else if (condition.operator === "gte" && subjectScore >= condition.threshold) {
                conditionMet = true;
              } else if (condition.operator === "eq" && subjectScore === condition.threshold) {
                conditionMet = true;
              }
            }
          } else if (condition.activity && condition.threshold !== undefined) {
            if (talent.topActivity === condition.activity || physical.topSport === condition.activity) {
              if (academic.averageScore !== undefined) {
                if (condition.operator === "lt" && academic.averageScore < condition.threshold) {
                  conditionMet = true;
                } else if (condition.operator === "gt" && academic.averageScore > condition.threshold) {
                  conditionMet = true;
                } else if (condition.operator === "gte" && academic.averageScore >= condition.threshold) {
                  conditionMet = true;
                } else if (condition.operator === "eq" && academic.averageScore === condition.threshold) {
                  conditionMet = true;
                }
              }
            }
          } else if (condition.threshold !== undefined) {
            if (condition.operator === "eq" && academic.averageScore === condition.threshold) {
              conditionMet = true;
            } else if (condition.operator === "lt" && academic.averageScore < condition.threshold) {
              conditionMet = true;
            } else if (condition.operator === "gt" && academic.averageScore > condition.threshold) {
              conditionMet = true;
            } else if (condition.operator === "gte" && academic.averageScore >= condition.threshold) {
              conditionMet = true;
            }
          }
          break;

        default:
          conditionMet = true;
          break;
      }

      if (!conditionMet) {
        allConditionsMet = false;
        break;
      }
    }
    
    if (allConditionsMet) {
      return forecast.content;
    }
  }
  
  return "Continue to monitor progress across different areas to identify emerging patterns and strengths.";
};

const getActionPlanForStudent = (
  academic: AcademicData,
  talent: TalentData,
  physical: PhysicalData,
  emotional: EmotionalData
): { shortTerm: string[]; mediumTerm: string[]; longTerm: string[] } => {
  const result = {
    shortTerm: [] as string[],
    mediumTerm: [] as string[],
    longTerm: [] as string[]
  };
  
  for (const plan of typedActionPlans) {
    let isMatch = false;
    
    if (plan.trigger.condition === "academicScore" && plan.trigger.subject) {
      const subjectScore = academic.subjectScores.find(
        s => s.subject.toLowerCase() === plan.trigger.subject.toLowerCase()
      )?.score;
      
      if (subjectScore !== undefined && plan.trigger.threshold !== undefined) {
        if (plan.trigger.operator === "lt" && subjectScore < plan.trigger.threshold) {
          isMatch = true;
        } else if (plan.trigger.operator === "gt" && subjectScore > plan.trigger.threshold) {
          isMatch = true;
        } else if (plan.trigger.operator === "gte" && subjectScore >= plan.trigger.threshold) {
          isMatch = true;
        } else if (plan.trigger.operator === "eq" && subjectScore === plan.trigger.threshold) {
          isMatch = true;
        }
      }
    } else if (plan.trigger.condition === "academicScore" && plan.trigger.activity) {
      if ((talent.topActivity === plan.trigger.activity || physical.topSport === plan.trigger.activity) 
          && plan.trigger.threshold !== undefined) {
        if (academic.averageScore !== undefined) {
          if (plan.trigger.operator === "lt" && academic.averageScore < plan.trigger.threshold) {
            isMatch = true;
          } else if (plan.trigger.operator === "gt" && academic.averageScore > plan.trigger.threshold) {
            isMatch = true;
          } else if (plan.trigger.operator === "gte" && academic.averageScore >= plan.trigger.threshold) {
            isMatch = true;
          } else if (plan.trigger.operator === "eq" && academic.averageScore === plan.trigger.threshold) {
            isMatch = true;
          }
        }
      }
    } else if (plan.trigger.condition === "activityEngagement") {
      if (plan.trigger.activity && (talent.topActivity === plan.trigger.activity || physical.topSport === plan.trigger.activity)) {
        isMatch = true;
      } else if (plan.trigger.subject) {
        const isRelevantSubject = academic.subjectScores.some(
          s => s.subject.toLowerCase() === plan.trigger.subject?.toLowerCase()
        );
        if (isRelevantSubject) {
          isMatch = true;
        }
      } else if (plan.trigger.threshold !== undefined) {
        if (plan.trigger.operator === "eq" && academic.averageScore === plan.trigger.threshold) {
          isMatch = true;
        } else if (plan.trigger.operator === "lt" && academic.averageScore < plan.trigger.threshold) {
          isMatch = true;
        } else if (plan.trigger.operator === "gt" && academic.averageScore > plan.trigger.threshold) {
          isMatch = true;
        } else if (plan.trigger.operator === "gte" && academic.averageScore >= plan.trigger.threshold) {
          isMatch = true;
        }
      }
    } else if (plan.trigger.condition === "sportEngagement") {
      if (plan.trigger.activity && physical.topSport === plan.trigger.activity) {
        isMatch = true;
      } else if (physical.topSport !== "N/A") {
        isMatch = true;
      }
    } else if (plan.trigger.condition === "journalCount" || plan.trigger.condition === "moodPattern") {
      const journalCount = emotional.moodHistory.reduce((sum, item) => sum + item.count, 0);
      if (plan.trigger.threshold !== undefined) {
        if (plan.trigger.operator === "gt" && journalCount > plan.trigger.threshold) {
          isMatch = true;
        } else if (plan.trigger.operator === "lt" && journalCount < plan.trigger.threshold) {
          isMatch = true;
        } else if (plan.trigger.operator === "eq" && journalCount === plan.trigger.threshold) {
          isMatch = true;
        } else if (plan.trigger.operator === "gte" && journalCount >= plan.trigger.threshold) {
          isMatch = true;
        }
      }
    } else if (plan.trigger.condition === "gradeLevel") {
      if (plan.trigger.subject) {
        const subjectScore = academic.subjectScores.find(
          s => s.subject.toLowerCase() === plan.trigger.subject?.toLowerCase()
        )?.score;
        
        if (subjectScore !== undefined && plan.trigger.threshold !== undefined) {
          if (plan.trigger.operator === "lt" && subjectScore < plan.trigger.threshold) {
            isMatch = true;
          } else if (plan.trigger.operator === "gt" && subjectScore > plan.trigger.threshold) {
            isMatch = true;
          } else if (plan.trigger.operator === "gte" && subjectScore >= plan.trigger.threshold) {
            isMatch = true;
          } else if (plan.trigger.operator === "eq" && subjectScore === plan.trigger.threshold) {
            isMatch = true;
          }
        }
      } else if (plan.trigger.activity && plan.trigger.threshold !== undefined) {
        if (talent.topActivity === plan.trigger.activity || physical.topSport === plan.trigger.activity) {
          if (academic.averageScore !== undefined) {
            if (plan.trigger.operator === "lt" && academic.averageScore < plan.trigger.threshold) {
              isMatch = true;
            } else if (plan.trigger.operator === "gt" && academic.averageScore > plan.trigger.threshold) {
              isMatch = true;
            } else if (plan.trigger.operator === "gte" && academic.averageScore >= plan.trigger.threshold) {
              isMatch = true;
            } else if (plan.trigger.operator === "eq" && academic.averageScore === plan.trigger.threshold) {
              isMatch = true;
            }
          }
        }
      } else if (plan.trigger.threshold !== undefined) {
        if (plan.trigger.operator === "eq" && academic.averageScore === plan.trigger.threshold) {
          isMatch = true;
        } else if (plan.trigger.operator === "lt" && academic.averageScore < plan.trigger.threshold) {
          isMatch = true;
        } else if (plan.trigger.operator === "gt" && academic.averageScore > plan.trigger.threshold) {
          isMatch = true;
        } else if (plan.trigger.operator === "gte" && academic.averageScore >= plan.trigger.threshold) {
          isMatch = true;
        }
      }
    }
    
    if (isMatch) {
      plan.shortTerm.forEach(item => {
        if (!result.shortTerm.includes(item)) {
          result.shortTerm.push(item);
        }
      });
      
      plan.mediumTerm.forEach(item => {
        if (!result.mediumTerm.includes(item)) {
          result.mediumTerm.push(item);
        }
      });
      
      plan.longTerm.forEach(item => {
        if (!result.longTerm.includes(item)) {
          result.longTerm.push(item);
        }
      });
    }
  }
  
  if (result.shortTerm.length === 0) {
    result.shortTerm.push("Set specific learning goals for the next month");
  }
  
  if (result.mediumTerm.length === 0) {
    result.mediumTerm.push("Explore new learning activities based on interests");
  }
  
  if (result.longTerm.length === 0) {
    result.longTerm.push("Develop a balanced growth plan across academic and extracurricular areas");
  }
  
  return result;
};

export const fetchInsightData = async (userId: string): Promise<AIInsightData | null> => {
  try {
    const academicQuery = query(
      collection(db, "academicRecords"),
      where("userId", "==", userId),
      orderBy("date", "desc")
    );
    const academicSnapshot = await getDocs(academicQuery);
    const academicRecords = academicSnapshot.docs.map(doc => doc.data());
    
    const extraQuery = query(
      collection(db, "extraCurricularRecords"),
      where("userId", "==", userId),
      orderBy("date", "desc")
    );
    const extraSnapshot = await getDocs(extraQuery);
    const extraRecords = extraSnapshot.docs.map(doc => doc.data());
    
    const sportsQuery = query(
      collection(db, "sportsRecords"),
      where("userId", "==", userId),
      orderBy("date", "desc")
    );
    const sportsSnapshot = await getDocs(sportsQuery);
    const sportsRecords = sportsSnapshot.docs.map(doc => doc.data());
    
    const journalsQuery = query(
      collection(db, "journals"),
      where("userId", "==", userId),
      orderBy("date", "desc")
    );
    const journalsSnapshot = await getDocs(journalsQuery);
    const journalRecords = journalsSnapshot.docs.map(doc => doc.data());
    
    const goalsQuery = query(
      collection(db, "goals"),
      where("userId", "==", userId)
    );
    const goalsSnapshot = await getDocs(goalsQuery);
    const goalRecords = goalsSnapshot.docs.map(doc => doc.data());
    
    const feedbackQuery = query(
      collection(db, "feedback"),
      where("userId", "==", userId),
      orderBy("date", "desc")
    );
    const feedbackSnapshot = await getDocs(feedbackQuery);
    const feedbackRecords = feedbackSnapshot.docs.map(doc => doc.data());
    
    const profileQuery = query(
      collection(db, "profiles"),
      where("userId", "==", userId),
      limit(1)
    );
    const profileSnapshot = await getDocs(profileQuery);
    const profileData = profileSnapshot.docs.length > 0 ? profileSnapshot.docs[0].data() : null;
    
    const academic = processAcademicData(academicRecords);
    const talent = processTalentData(extraRecords);
    const physical = processPhysicalData(sportsRecords);
    const emotional = processEmotionalData(journalRecords);
    const achievements = processAchievementData(academicRecords, extraRecords, sportsRecords);
    const goals = processGoalData(goalRecords);
    const feedback = processFeedbackData(feedbackRecords);
    
    const { topSkill, weakArea, growthScore } = determineStrengthsAndWeaknesses(
      academic, talent, physical
    );
    
    const suggestions = getSuggestionsForStudent(academic, talent, physical, emotional, goals);
    const forecast = getForecastForStudent(academic, talent, physical, emotional, feedback);
    const actionPlan = getActionPlanForStudent(academic, talent, physical, emotional);
    
    const childSnapshot: ChildData = {
      name: profileData?.fullName || "Student",
      age: profileData?.age || calculateAgeFromGrade(profileData?.grade),
      class: profileData?.grade || "Grade 5",
      topSkill,
      weakArea,
      growthScore,
    };
    
    return {
      childSnapshot,
      academic,
      talent,
      physical,
      emotional,
      achievements,
      goals,
      feedback,
      suggestions,
      forecast,
      actionPlan,
    };
  } catch (error) {
    console.error("Error fetching insight data:", error);
    return null;
  }
};

const calculateAgeFromGrade = (grade?: string): number => {
  if (!grade) return 10;
  
  const gradeNum = parseInt(grade.match(/\d+/)?.[0] || "5");
  
  return gradeNum + 5;
};

export default {
  fetchInsightData,
};
