
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { TrendingUp, TrendingDown, ChevronRight } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface AcademicRecord {
  id: string;
  subject: string;
  score: number;
  maxScore: number;
  isPercentage: boolean;
  grade: string;
  createdAt: any;
}

// Extended interface for processed records with calculated percentage
interface ProcessedRecord extends AcademicRecord {
  calculatedPercentage: number;
}

const MarksSummaryCard = () => {
  const [loading, setLoading] = useState(true);
  const [highestRecord, setHighestRecord] = useState<ProcessedRecord | null>(null);
  const [lowestRecord, setLowestRecord] = useState<ProcessedRecord | null>(null);
  const [recentRecords, setRecentRecords] = useState<ProcessedRecord[]>([]);

  useEffect(() => {
    const fetchAcademicData = async () => {
      try {
        setLoading(true);
        const user = auth.currentUser;
        if (!user) {
          console.log("No authenticated user found");
          return;
        }

        console.log("Fetching academic records for user:", user.uid);
        // Fetch academic records from Firebase
        const academicRef = collection(db, "academicRecords");
        const q = query(
          academicRef, 
          where("userId", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        
        console.log("Records found:", querySnapshot.size);
        
        // Process the data
        const academicRecords: ProcessedRecord[] = [];
        
        querySnapshot.forEach((doc) => {
          const record = doc.data();
          console.log("Processing record:", record);
          
          const score = parseFloat(record.score?.toString() || '0');
          const maxScore = parseFloat(record.maxScore?.toString() || '100');
          let calculatedPercentage: number;
          
          // Calculate percentage based on isPercentage flag
          if (record.isPercentage) {
            calculatedPercentage = score;
          } else {
            calculatedPercentage = (score / maxScore) * 100;
          }
          
          academicRecords.push({
            id: doc.id,
            subject: record.subject || 'Unknown',
            score: score,
            maxScore: maxScore,
            calculatedPercentage,
            isPercentage: record.isPercentage || false,
            grade: record.grade || 'N/A',
            createdAt: record.createdAt
          });
        });
        
        console.log("Processed academic data:", academicRecords);
        
        if (academicRecords.length > 0) {
          // Sort by calculatedPercentage (highest to lowest)
          const sortedByPercentage = [...academicRecords].sort((a, b) => b.calculatedPercentage - a.calculatedPercentage);
          setHighestRecord(sortedByPercentage[0]);
          setLowestRecord(sortedByPercentage[sortedByPercentage.length - 1]);
          
          // Get recent records
          const sortedByDate = [...academicRecords].sort((a, b) => {
            try {
              const dateA = a.createdAt ? (a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt)).getTime() : 0;
              const dateB = b.createdAt ? (b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt)).getTime() : 0;
              return dateB - dateA;
            } catch (error) {
              console.error("Error sorting by date:", error);
              return 0;
            }
          });
          
          // Get up to 5 most recent records
          setRecentRecords(sortedByDate.slice(0, 5));
        } else {
          console.log("No academic records found for the user");
        }
      } catch (error) {
        console.error("Error fetching academic data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAcademicData();
  }, []);

  if (loading) {
    return (
      <Card className="shadow-md border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle>Academic Summary</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse flex space-x-4">
            <div className="space-y-3 flex-1">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md border-gray-200 dark:border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl font-bold">Academic Summary</CardTitle>
          <CardDescription className="text-sm text-gray-500 dark:text-gray-400">Your highest and lowest subject performance</CardDescription>
        </div>
        <a href="/academic-records" className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center">
          View all
          <ChevronRight className="h-4 w-4 ml-1" />
        </a>
      </CardHeader>
      
      <CardContent>
        {highestRecord && lowestRecord ? (
          <div className="space-y-6">
            <div className="flex items-start space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
              <TrendingUp className="text-green-600 dark:text-green-400 h-5 w-5 mt-1" />
              <div>
                <h4 className="font-medium text-sm">Highest Score: {highestRecord.subject}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {highestRecord.isPercentage 
                    ? `${Math.round(highestRecord.calculatedPercentage)}%` 
                    : `${highestRecord.score}/${highestRecord.maxScore} (${Math.round(highestRecord.calculatedPercentage)}%)`}
                  {highestRecord.grade ? ` - Grade: ${highestRecord.grade}` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800">
              <TrendingDown className="text-red-600 dark:text-red-400 h-5 w-5 mt-1" />
              <div>
                <h4 className="font-medium text-sm">Lowest Score: {lowestRecord.subject}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {lowestRecord.isPercentage 
                    ? `${Math.round(lowestRecord.calculatedPercentage)}%` 
                    : `${lowestRecord.score}/${lowestRecord.maxScore} (${Math.round(lowestRecord.calculatedPercentage)}%)`}
                  {lowestRecord.grade ? ` - Grade: ${lowestRecord.grade}` : ''}
                </p>
              </div>
            </div>

            <Accordion type="single" collapsible className="mt-4">
              <AccordionItem value="recentScores">
                <AccordionTrigger className="py-2">Recent Assessments</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {recentRecords.length > 0 ? (
                      recentRecords.map((record, index) => (
                        <div key={index} className="border-b pb-3 last:border-b-0 last:pb-0">
                          <div className="flex justify-between">
                            <span className="font-medium">{record.subject}</span>
                            <span className="font-medium">
                              {record.isPercentage 
                                ? `${Math.round(record.calculatedPercentage)}%` 
                                : `${record.score}/${record.maxScore}`}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {record.createdAt 
                              ? (record.createdAt.toDate 
                                ? new Date(record.createdAt.toDate()).toLocaleDateString() 
                                : new Date(record.createdAt).toLocaleDateString())
                              : 'Unknown date'}
                            {record.grade ? ` - Grade: ${record.grade}` : ''}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground py-2">No recent assessments found</p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        ) : (
          <div className="py-6 text-center text-muted-foreground">
            <p>No academic records found.</p>
            <p className="mt-2">Add some academic records to see your performance summary.</p>
            <a href="/academic-records" className="mt-4 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
              Go to Academic Records
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MarksSummaryCard;
