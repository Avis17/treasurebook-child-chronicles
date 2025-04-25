import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
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
  marks: number;
  totalMarks: number;
  grade: string;
  examDate: any;
  userId: string;
  class?: string; // Add class property as optional since it might not exist in all records
}

export interface SportsRecord {
  id: string;
  sportName: string;
  eventName: string;
  position: "Gold" | "Silver" | "Bronze" | "Finalist" | string;
  eventDate: any;
  userId: string;
  eventType?: string; // Add eventType property as optional
  venue?: string;
  coach?: string;
  level?: string;
  notes?: string;
  achievement?: string;
  date?: string;
}

export interface ExtracurricularRecord {
  id: string;
  activityName: string;
  eventName: string;
  achievement: string;
  eventDate: any;
  userId: string;
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
  time?: string; // Add time property as optional
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
  author?: string; // Add author property as optional
  content?: string; // Add content property as optional
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
  useFirebaseData<ExtracurricularRecord>(userId, "extracurricularRecords");

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
  
  const sortedRecords = [...validRecords].sort((a, b) => {
    // Handle different date formats safely
    const dateA = a.examDate.toDate ? a.examDate.toDate() : new Date(a.examDate);
    const dateB = b.examDate.toDate ? b.examDate.toDate() : new Date(b.examDate);
    return dateA.getTime() - dateB.getTime();
  });
  
  const recentScores = sortedRecords.slice(-3).map(r => (r.marks / r.totalMarks) * 100);
  
  if (recentScores.length < 2) return "Consistent";
  
  const trend = recentScores[recentScores.length - 1] - recentScores[0];
  
  if (trend > 5) return "Improving";
  if (trend < -5) return "Declining";
  return "Consistent";
};

export const getLatestExamGrade = (records: AcademicRecord[]): { grade: string, subject: string } => {
  if (records.length === 0) return { grade: "N/A", subject: "N/A" };
  
  // Filter out records with missing examDate first
  const validRecords = records.filter(record => record.examDate);
  
  if (validRecords.length === 0) return { grade: "N/A", subject: "N/A" };
  
  const sortedRecords = [...validRecords].sort((a, b) => {
    // Handle different date formats safely
    const dateA = a.examDate.toDate ? a.examDate.toDate() : new Date(a.examDate);
    const dateB = b.examDate.toDate ? b.examDate.toDate() : new Date(b.examDate);
    return dateB.getTime() - dateA.getTime();
  });
  
  return { 
    grade: sortedRecords[0].grade,
    subject: sortedRecords[0].subject
  };
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
