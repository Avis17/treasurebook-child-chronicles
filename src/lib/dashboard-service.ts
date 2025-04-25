
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

export const useJournalEntries = (userId: string | undefined) => 
  useFirebaseData<JournalEntry>(userId, "journalEntries");

export const useFeedback = (userId: string | undefined) => 
  useFirebaseData<Feedback>(userId, "feedback");

export const useResources = (userId: string | undefined) => 
  useFirebaseData<Resource>(userId, "resources");

// Helper functions for dashboard charts and analytics
export const calculateTrend = (records: AcademicRecord[]): "Improving" | "Declining" | "Consistent" => {
  if (records.length < 2) return "Consistent";
  
  const sortedRecords = [...records].sort((a, b) => 
    new Date(a.examDate.toDate()).getTime() - new Date(b.examDate.toDate()).getTime()
  );
  
  const recentScores = sortedRecords.slice(-3).map(r => (r.marks / r.totalMarks) * 100);
  
  if (recentScores.length < 2) return "Consistent";
  
  const trend = recentScores[recentScores.length - 1] - recentScores[0];
  
  if (trend > 5) return "Improving";
  if (trend < -5) return "Declining";
  return "Consistent";
};

export const getLatestExamGrade = (records: AcademicRecord[]): { grade: string, subject: string } => {
  if (records.length === 0) return { grade: "N/A", subject: "N/A" };
  
  const sortedRecords = [...records].sort((a, b) => 
    new Date(b.examDate.toDate()).getTime() - new Date(a.examDate.toDate()).getTime()
  );
  
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
