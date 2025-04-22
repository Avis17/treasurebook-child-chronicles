import { v4 as uuidv4 } from "uuid";

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

// Function to create a new academic record
export const createAcademicRecord = (
  data: Omit<AcademicRecord, "id" | "grade">, 
): AcademicRecord => {
  const grade = calculateGrade(data.score, data.maxScore, data.isPercentage);
  
  const record: AcademicRecord = {
    id: uuidv4(),
    grade,
    ...data,
  };
  
  return record;
};

// Function to save academic records to localStorage
export const saveAcademicRecords = (records: AcademicRecord[]): void => {
  localStorage.setItem('academicRecords', JSON.stringify(records));
};

// Function to load academic records from localStorage
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
    if (filters.year && record.year !== filters.year) return false;
    if (filters.term && record.term !== filters.term) return false;
    if (filters.class && record.class !== filters.class) return false;
    if (filters.examType && record.examType !== filters.examType) return false;
    return true;
  });
};
