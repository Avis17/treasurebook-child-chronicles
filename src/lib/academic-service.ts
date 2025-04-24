
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/firebase";
import { collection, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";

export interface AcademicRecord {
  id: string;
  year: string;
  term: string;
  examType: string;
  class: string;
  subject: string;
  score: number;
  maxScore: number;
  grade: string;
  remarks: string;
  isPercentage: boolean;
  userId: string;
  notes?: string;
  createdAt?: any;
  updatedAt?: any;
}

// Helper function to calculate grade based on score
export const calculateGrade = (score: number, maxScore: number, isPercentage: boolean): string => {
  const percentage = isPercentage ? score : (score / maxScore) * 100;
  
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B+";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C+";
  if (percentage >= 40) return "C";
  if (percentage >= 33) return "D";
  return "F";
};

// Function to create and save a new academic record to Firebase
export const createAcademicRecord = async (
  data: Omit<AcademicRecord, "id" | "grade" | "createdAt" | "updatedAt">, 
): Promise<AcademicRecord | null> => {
  try {
    const grade = calculateGrade(data.score, data.maxScore, data.isPercentage);
    
    const recordData = {
      ...data,
      grade,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Use addDoc to let Firestore generate the document ID
    const docRef = await addDoc(collection(db, "academicRecords"), recordData);
    
    return {
      ...recordData,
      id: docRef.id
    };
  } catch (error) {
    console.error("Error creating academic record:", error);
    return null;
  }
};

// Function to update an academic record
export const updateAcademicRecord = async (record: AcademicRecord): Promise<boolean> => {
  try {
    if (!record.id) {
      console.error("Update failed: Record ID is missing");
      return false;
    }
    
    console.log("Updating record with ID:", record.id);
    const { id, ...data } = record;
    
    // Update the document with the specified ID
    await updateDoc(doc(db, "academicRecords", id), {
      ...data,
      updatedAt: serverTimestamp()
    });
    
    console.log("Update successful for record:", id);
    return true;
  } catch (error) {
    console.error("Error updating academic record:", error);
    return false;
  }
};

// Function to delete an academic record
export const deleteAcademicRecord = async (id: string): Promise<boolean> => {
  try {
    if (!id) {
      console.error("Delete failed: Record ID is missing");
      return false;
    }
    
    console.log("Deleting record with ID:", id);
    await deleteDoc(doc(db, "academicRecords", id));
    console.log("Delete successful for record:", id);
    return true;
  } catch (error) {
    console.error("Error deleting academic record:", error);
    return false;
  }
};

// Function to fetch all academic records for a user
export const fetchAcademicRecords = async (userId: string): Promise<AcademicRecord[]> => {
  try {
    console.log("Fetching academic records for user:", userId);
    const recordsQuery = query(
      collection(db, "academicRecords"),
      where("userId", "==", userId)
    );
    
    const querySnapshot = await getDocs(recordsQuery);
    
    const records: AcademicRecord[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      records.push({
        ...data,
        id: doc.id,
      } as AcademicRecord);
    });
    
    console.log("Fetched records count:", records.length);
    return records;
  } catch (error) {
    console.error("Error fetching academic records:", error);
    return [];
  }
};

// For backward compatibility
export const saveAcademicRecords = (records: AcademicRecord[]): void => {
  localStorage.setItem('academicRecords', JSON.stringify(records));
};

// For backward compatibility
export const loadAcademicRecords = (): AcademicRecord[] => {
  const records = localStorage.getItem('academicRecords');
  return records ? JSON.parse(records) : [];
};

// Function to filter academic records
export const filterAcademicRecords = (
  records: AcademicRecord[],
  filters: {
    year?: string;
    term?: string;
    class?: string;
    examType?: string;
  }
): AcademicRecord[] => {
  return records.filter(record => {
    if (filters.year && filters.year !== 'all' && record.year !== filters.year) return false;
    if (filters.term && filters.term !== 'all' && record.term !== filters.term) return false;
    if (filters.class && filters.class !== 'all' && record.class !== filters.class) return false;
    if (filters.examType && filters.examType !== 'all' && record.examType !== filters.examType) return false;
    return true;
  });
};
