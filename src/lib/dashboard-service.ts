import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, onSnapshot, doc, getDoc } from "firebase/firestore";
import { useState, useEffect } from "react";

// Generic function to fetch user-specific data
export const fetchUserData = async <T>(userId: string, collectionName: string): Promise<T[]> => {
  try {
    const q = query(
      collection(db, collectionName),
      where("userId", "==", userId)
    );
    const querySnapshot = await getDocs(q);
    
    const data: T[] = [];
    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() } as T);
    });
    
    return data;
  } catch (error) {
    console.error(`Error fetching ${collectionName}:`, error);
    return [];
  }
};

// Custom hook to listen to user data with realtime updates
export const useFirebaseData = <T>(userId: string | undefined, collectionName: string) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    const q = query(
      collection(db, collectionName),
      where("userId", "==", userId)
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const items: T[] = [];
        querySnapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() } as T);
        });
        setData(items);
        setLoading(false);
      },
      (err) => {
        console.error(`Error listening to ${collectionName}:`, err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId, collectionName]);

  return { data, loading, error };
};

// Specific data interfaces
export interface AcademicRecord {
  id: string;
  subject: string;
  term: string;
  score: number;
  maxScore: number;
  grade: string;
  examDate?: any;
  userId: string;
  class?: string;
  isPercentage?: boolean;
  year?: string;
  examType?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface SportsRecord {
  id: string;
  sportName: string;
  eventName: string;
  position: "Gold" | "Silver" | "Bronze" | "Finalist" | string;
  eventDate: any;
  userId: string;
  eventType?: string;
  venue?: string;
  coach?: string;
  level?: string;
  notes?: string;
  achievement?: string;
  date?: string;
}

export interface ExtracurricularRecord {
  id: string;
  activity: string;
  category: string;
  achievement: string;
  eventDate?: any;
  date?: string;
  userId: string;
  level?: string;
  organizer?: string;
  certificate?: boolean;
  notes?: string;
}

export interface Goal {
  id: string;
  title: string;
  category: string;
  status: "Completed" | "In Progress";
  progress: number;
  steps: { title: string; completed: boolean }[];
  userId: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: any;
  category: string;
  status: string;
  userId: string;
  time?: string;
}

export interface Milestone {
  id: string;
  title: string;
  date: any;
  category: string;
  icon?: string;
  userId: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: string;
  tags: string[];
  date: any;
  userId: string;
}

export interface Feedback {
  id: string;
  from: string;
  message: string;
  category: string;
  date: any;
  userId: string;
  author?: string;
  content?: string;
}

export interface Resource {
  id: string;
  title: string;
  link: string;
  category: string;
  isFavorite: boolean;
  lastVisited?: any;
  userId: string;
}

// Custom hooks for specific collections
export const useAcademicRecords = (userId: string | undefined) => 
  useFirebaseData<AcademicRecord>(userId, "academicRecords");

export const useSportsRecords = (userId: string | undefined) => 
  useFirebaseData<SportsRecord>(userId, "sportsRecords");

export const useExtracurricularRecords = (userId: string | undefined) => 
  useFirebaseData<ExtracurricularRecord>(userId, "extraCurricularRecords");

export const useGoals = (userId: string | undefined) => 
  useFirebaseData<Goal>(userId, "goals");

export const useCalendarEvents = (userId: string | undefined) => 
  useFirebaseData<CalendarEvent>(userId, "calendarEvents");

export const useMilestones = (userId: string | undefined) => 
  useFirebaseData<Milestone>(userId, "milestones");

// Modified to check both "journal" and "journalEntries" collections
export const useJournalEntries = (userId: string | undefined) => {
  const [data, setData] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Try with journalEntries collection first
    const q1 = query(
      collection(db, "journalEntries"),
      where("userId", "==", userId)
    );

    // Also try with journal collection
    const q2 = query(
      collection(db, "journal"),
      where("userId", "==", userId)
    );

    // Subscribe to both collections
    const unsubscribe1 = onSnapshot(
      q1,
      (querySnapshot) => {
        const items: JournalEntry[] = [];
        querySnapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() } as JournalEntry);
        });
        setData(prevData => {
          // Combine with any data we might have from the other collection
          const newData = [...prevData];
          items.forEach(item => {
            if (!newData.some(existing => existing.id === item.id)) {
              newData.push(item);
            }
          });
          return newData;
        });
        setLoading(false);
      },
      (err) => {
        console.log("No data in journalEntries collection or error:", err);
        // Don't set error here as we're also checking another collection
      }
    );

    const unsubscribe2 = onSnapshot(
      q2,
      (querySnapshot) => {
        const items: JournalEntry[] = [];
        querySnapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() } as JournalEntry);
        });
        setData(prevData => {
          // Combine with any data we might have from the other collection
          const newData = [...prevData];
          items.forEach(item => {
            if (!newData.some(existing => existing.id === item.id)) {
              newData.push(item);
            }
          });
          return newData;
        });
        setLoading(false);
      },
      (err) => {
        console.error(`Error listening to journal collection:`, err);
        setError(err);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe1();
      unsubscribe2();
    };
  }, [userId]);

  return { data, loading, error };
};

export const useFeedback = (userId: string | undefined) => 
  useFirebaseData<Feedback>(userId, "feedback");

export const useResources = (userId: string | undefined) => 
  useFirebaseData<Resource>(userId, "resources");

// Helper functions for dashboard charts and analytics
export const calculateTrend = (records: AcademicRecord[]): "Improving" | "Declining" | "Consistent" => {
  if (records.length < 2) return "Consistent";
  
  // Filter out records with missing examDate first
  const validRecords = records.filter(record => record.examDate);
  
  if (validRecords.length < 2) return "Consistent";
  
  try {
    const sortedRecords = [...validRecords].sort((a, b) => {
      // Handle different date formats safely
      const getDate = (record: any) => {
        if (!record.examDate) return new Date(0);
        
        try {
          if (record.examDate && record.examDate.toDate && typeof record.examDate.toDate === 'function') {
            return record.examDate.toDate();
          }
          
          if (record.examDate instanceof Date) {
            return record.examDate;
          }
          
          // Handle string or timestamp
          return new Date(record.examDate);
        } catch (error) {
          console.error("Failed to parse date:", error);
          return new Date(0);
        }
      };
      
      return getDate(a).getTime() - getDate(b).getTime();
    });
    
    const recentScores = sortedRecords.slice(-3).map(r => {
      if (r.isPercentage) {
        return r.score;
      }
      return (r.score / r.maxScore) * 100;
    });
    
    if (recentScores.length < 2) return "Consistent";
    
    const trend = recentScores[recentScores.length - 1] - recentScores[0];
    
    if (trend > 5) return "Improving";
    if (trend < -5) return "Declining";
    return "Consistent";
  } catch (error) {
    console.error("Error calculating trend:", error);
    return "Consistent";
  }
};

export const getLatestExamGrade = (records: AcademicRecord[]): { grade: string, subject: string } => {
  if (records.length === 0) return { grade: "N/A", subject: "N/A" };
  
  // Filter out records with missing examDate first
  const validRecords = records.filter(record => record.examDate || record.grade);
  
  if (validRecords.length === 0) return { grade: "N/A", subject: "N/A" };
  
  // Try to sort by exam date if available
  try {
    const sortedRecords = [...validRecords].sort((a, b) => {
      const getDate = (record: any) => {
        if (!record.examDate) return new Date(0);
        
        try {
          if (record.examDate.toDate && typeof record.examDate.toDate === 'function') {
            return record.examDate.toDate();
          }
          
          if (record.examDate instanceof Date) {
            return record.examDate;
          }
          
          // Handle string or timestamp
          return new Date(record.examDate);
        } catch (error) {
          console.error("Failed to parse date:", error);
          return new Date(0);
        }
      };
      
      return getDate(b).getTime() - getDate(a).getTime();
    });
    
    return { 
      grade: sortedRecords[0].grade || 'N/A',
      subject: sortedRecords[0].subject || 'N/A'
    };
  } catch (error) {
    console.error("Error sorting records by date:", error);
    
    // Fallback to just return the first record's grade
    return { 
      grade: validRecords[0].grade || 'N/A',
      subject: validRecords[0].subject || 'N/A'
    };
  }
};

export const formatDate = (date: any): string => {
  if (!date) return "";
  try {
    if (date.toDate) {
      const d = date.toDate();
      return new Intl.DateTimeFormat('en-US', { 
        month: 'short',
        day: 'numeric'
      }).format(d);
    } else {
      return new Intl.DateTimeFormat('en-US', { 
        month: 'short',
        day: 'numeric'
      }).format(new Date(date));
    }
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};

export const useDashboardStats = (userId: string | undefined) => {
  const [data, setData] = useState({
    totalExams: 0,
    totalSportsEvents: 0,
    totalAchievements: 0,
    upcomingEvents: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        const examSnapshot = await getDocs(query(
          collection(db, "academicRecords"),
          where("userId", "==", userId)
        ));

        const sportsSnapshot = await getDocs(query(
          collection(db, "sportsRecords"),
          where("userId", "==", userId)
        ));

        const achievementsSnapshot = await getDocs(query(
          collection(db, "milestones"),
          where("userId", "==", userId)
        ));

        const now = new Date();
        const futureDate = new Date();
        futureDate.setMonth(futureDate.getMonth() + 1);

        // Check calendarEvents collection
        const eventsSnapshot1 = await getDocs(query(
          collection(db, "calendarEvents"),
          where("userId", "==", userId)
        ));

        // Also check the events collection
        const eventsSnapshot2 = await getDocs(query(
          collection(db, "events"),
          where("userId", "==", userId)
        ));

        // Filter events that are upcoming
        const upcomingEvents1 = eventsSnapshot1.docs.filter(doc => {
          const data = doc.data();
          if (!data.date) return false;
          
          let eventDate;
          try {
            if (typeof data.date === 'string') {
              eventDate = new Date(data.date);
            } else if (data.date.toDate) {
              eventDate = data.date.toDate();
            } else {
              eventDate = new Date(data.date);
            }
            
            return eventDate >= now;
          } catch (e) {
            console.error("Error parsing date:", e);
            return false;
          }
        });

        const upcomingEvents2 = eventsSnapshot2.docs.filter(doc => {
          const data = doc.data();
          if (!data.date) return false;
          
          let eventDate;
          try {
            if (typeof data.date === 'string') {
              eventDate = new Date(data.date);
            } else if (data.date.toDate) {
              eventDate = data.date.toDate();
            } else {
              eventDate = new Date(data.date);
            }
            
            return eventDate >= now;
          } catch (e) {
            console.error("Error parsing date:", e);
            return false;
          }
        });

        setData({
          totalExams: examSnapshot.size,
          totalSportsEvents: sportsSnapshot.size,
          totalAchievements: achievementsSnapshot.size,
          upcomingEvents: upcomingEvents1.length + upcomingEvents2.length
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  return { data, loading };
};

interface Profile {
  childName: string;
  age: string;
  currentClass: string;
  photoURL?: string;
  // ... other profile fields
}

// Add new profile hook
export const useProfile = (userId: string | undefined) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const profileDoc = await getDoc(doc(db, "profiles", userId));
        if (profileDoc.exists()) {
          setProfile(profileDoc.data() as Profile);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  return { profile, loading };
};

// Helper function to calculate average academic score
const calculateAverageScore = (academicRecords: AcademicRecord[]): number => {
  if (academicRecords.length === 0) return 0;
  
  const scores = academicRecords.map(record => {
    // Calculate percentage based on isPercentage flag
    return record.isPercentage ? 
      Number(record.score) : 
      (Number(record.score) / (Number(record.maxScore) || 100)) * 100;
  }).filter(score => !isNaN(score));
  
  if (scores.length === 0) return 0;
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
};

// Helper function to calculate sports score
const calculateSportsScore = (sportsRecords: SportsRecord[]): number => {
  if (sportsRecords.length === 0) return 0;
  
  const positionScores = sportsRecords.map(record => {
    const position = record.position?.toLowerCase() || '';
    if (position.includes('1st') || position.includes('gold')) return 100;
    if (position.includes('2nd') || position.includes('silver')) return 80;
    if (position.includes('3rd') || position.includes('bronze')) return 60;
    if (position.includes('finalist')) return 40;
    if (position.includes('semi')) return 30;
    return 20; // participation or other
  });
  
  return positionScores.reduce((sum, score) => sum + score, 0) / positionScores.length;
};

// Helper function to calculate extracurricular score
const calculateExtracurricularScore = (extraRecords: ExtracurricularRecord[]): number => {
  if (extraRecords.length === 0) return 0;
  
  const achievementScores = extraRecords.map(record => {
    const achievement = record.achievement?.toLowerCase() || '';
    if (achievement.includes('1st') || achievement.includes('gold')) return 100;
    if (achievement.includes('2nd') || achievement.includes('silver')) return 80;
    if (achievement.includes('3rd') || achievement.includes('bronze')) return 60;
    if (achievement.includes('special') || achievement.includes('recognition')) return 50;
    if (achievement.includes('honorable')) return 40;
    return 30; // participation or other
  });
  
  return achievementScores.reduce((sum, score) => sum + score, 0) / achievementScores.length;
};

// Helper function to calculate goals & milestones score
const calculateGoalsScore = (goals: Goal[], milestones: Milestone[]): number => {
  let score = 0;
  
  // Calculate goals completion score
  if (goals.length > 0) {
    const completedGoals = goals.filter(goal => goal.status === 'Completed').length;
    score += (completedGoals / goals.length) * 80;
  }
  
  // Add milestone bonus
  if (milestones.length > 0) {
    score += Math.min(milestones.length * 5, 20);
  }
  
  return score;
};

// Helper function to calculate journal engagement score
const calculateJournalScore = (journalEntries: JournalEntry[]): number => {
  if (journalEntries.length === 0) return 0;
  
  // Simple scoring based on number of entries
  return Math.min(journalEntries.length * 10, 100);
};

// Update growth score calculation
export const calculateGrowthScore = (
  academicRecords: AcademicRecord[],
  sportsRecords: SportsRecord[],
  extraRecords: ExtracurricularRecord[],
  goals: Goal[],
  milestones: Milestone[],
  journalEntries: JournalEntry[]
): number => {
  // Calculate individual scores
  const academicScore = calculateAverageScore(academicRecords);
  const sportsScore = calculateSportsScore(sportsRecords);
  const extraScore = calculateExtracurricularScore(extraRecords);
  const goalsScore = calculateGoalsScore(goals, milestones);
  const journalScore = calculateJournalScore(journalEntries);
  
  // Weight each component appropriately
  const totalScore = (academicScore * 0.4) +  // 40% weightage
                     (sportsScore * 0.2) +    // 20% weightage
                     (extraScore * 0.2) +     // 20% weightage
                     (goalsScore * 0.1) +     // 10% weightage
                     (journalScore * 0.1);    // 10% weightage
  
  // Calculate final growth score, ensuring it's between 0-100
  return Math.min(Math.round(totalScore), 100);
};

// Helper function to identify weak areas
export const identifyWeakAreas = (
  academicRecords: AcademicRecord[],
  sportsRecords: SportsRecord[],
  extraRecords: ExtracurricularRecord[]
): string[] => {
  const weakAreas: string[] = [];

  // Group academic records by subject and calculate average
  const subjectScores = new Map<string, number[]>();
  
  academicRecords.forEach(record => {
    const score = record.isPercentage ? record.score : (record.score / record.maxScore) * 100;
    if (isNaN(score)) return;
    
    const subject = record.subject.toLowerCase();
    
    if (!subjectScores.has(subject)) {
      subjectScores.set(subject, []);
    }
    subjectScores.get(subject)?.push(score);
  });

  // Find subjects with average below 40%
  subjectScores.forEach((scores, subject) => {
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    if (average < 40) {
      weakAreas.push(`${subject.charAt(0).toUpperCase()}${subject.slice(1)}`);
    }
  });

  // Identify weak sports areas (no achievements or consistently low performance)
  const sportsPerformance = new Map<string, number[]>();
  sportsRecords.forEach(record => {
    const sport = record.sportName || record.eventType || '';
    if (!sport) return;
    
    let score = 0;
    if (record.position?.toLowerCase().includes('gold') || record.position?.toLowerCase().includes('1st')) {
      score = 100;
    } else if (record.position?.toLowerCase().includes('silver') || record.position?.toLowerCase().includes('2nd')) {
      score = 80;
    } else if (record.position?.toLowerCase().includes('bronze') || record.position?.toLowerCase().includes('3rd')) {
      score = 60;
    } else if (record.position?.toLowerCase().includes('finalist')) {
      score = 40;
    } else {
      score = 20;
    }

    if (!sportsPerformance.has(sport)) {
      sportsPerformance.set(sport, []);
    }
    sportsPerformance.get(sport)?.push(score);
  });

  sportsPerformance.forEach((scores, sport) => {
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    if (average < 40) {
      weakAreas.push(`${sport} (Sports)`);
    }
  });

  // Identify weak extracurricular areas
  const extraPerformance = new Map<string, number[]>();
  extraRecords.forEach(record => {
    const activity = record.activity || '';
    if (!activity) return;
    
    let score = 0;
    if (record.achievement?.toLowerCase().includes('1st') || record.achievement?.toLowerCase().includes('gold')) {
      score = 100;
    } else if (record.achievement?.toLowerCase().includes('2nd') || record.achievement?.toLowerCase().includes('silver')) {
      score = 80;
    } else if (record.achievement?.toLowerCase().includes('3rd') || record.achievement?.toLowerCase().includes('bronze')) {
      score = 60;
    } else {
      score = 40;
    }

    if (!extraPerformance.has(activity)) {
      extraPerformance.set(activity, []);
    }
    extraPerformance.get(activity)?.push(score);
  });

  extraPerformance.forEach((scores, activity) => {
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    if (average < 40) {
      weakAreas.push(`${activity} (Activity)`);
    }
  });

  return weakAreas;
};
