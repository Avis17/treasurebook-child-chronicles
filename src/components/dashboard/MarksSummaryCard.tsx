
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { TrendingUp, TrendingDown } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface AcademicRecord {
  id: string;
  subject: string;
  score: number;
  maxScore: number;
  percentage: number;
  isPercentage: boolean;
  grade: string;
  createdAt: any;
}

const MarksSummaryCard = () => {
  const [loading, setLoading] = useState(true);
  const [highestRecord, setHighestRecord] = useState<AcademicRecord | null>(null);
  const [lowestRecord, setLowestRecord] = useState<AcademicRecord | null>(null);
  const [recentRecords, setRecentRecords] = useState<AcademicRecord[]>([]);

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
        
        // Process the data
        const academicRecords: AcademicRecord[] = [];
        
        querySnapshot.forEach((doc) => {
          const record = doc.data();
          console.log("Processing academic record:", record.subject, record.score);
          
          const score = parseFloat(record.score) || 0;
          const maxScore = parseFloat(record.maxScore) || 100;
          const percentage = record.isPercentage ? score : (score / maxScore) * 100;
          
          academicRecords.push({
            id: doc.id,
            subject: record.subject || 'Unknown',
            score: score,
            maxScore: maxScore,
            percentage: percentage,
            isPercentage: record.isPercentage || false,
            grade: record.grade || 'N/A',
            createdAt: record.createdAt
          });
        });
        
        console.log("Fetched academic records:", academicRecords.length);
        
        if (academicRecords.length > 0) {
          // Sort by percentage (highest to lowest)
          const sortedByPercentage = [...academicRecords].sort((a, b) => b.percentage - a.percentage);
          setHighestRecord(sortedByPercentage[0]);
          setLowestRecord(sortedByPercentage[sortedByPercentage.length - 1]);
          
          // Get recent records
          const sortedByDate = [...academicRecords].sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt.toDate()).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt.toDate()).getTime() : 0;
            return dateB - dateA;
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
      <Card>
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Academic Summary</CardTitle>
        <CardDescription>Your highest and lowest subject performance</CardDescription>
      </CardHeader>
      <CardContent>
        {highestRecord && lowestRecord ? (
          <div className="space-y-4">
            <div className="flex items-start space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
              <TrendingUp className="text-green-600 dark:text-green-400 h-5 w-5 mt-1" />
              <div>
                <h4 className="font-medium">Highest Score: {highestRecord.subject}</h4>
                <p className="text-sm text-muted-foreground">
                  {highestRecord.isPercentage 
                    ? `${Math.round(highestRecord.percentage)}%` 
                    : `${highestRecord.score}/${highestRecord.maxScore} (${Math.round(highestRecord.percentage)}%)`}
                  {highestRecord.grade ? ` - Grade: ${highestRecord.grade}` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
              <TrendingDown className="text-red-600 dark:text-red-400 h-5 w-5 mt-1" />
              <div>
                <h4 className="font-medium">Lowest Score: {lowestRecord.subject}</h4>
                <p className="text-sm text-muted-foreground">
                  {lowestRecord.isPercentage 
                    ? `${Math.round(lowestRecord.percentage)}%` 
                    : `${lowestRecord.score}/${lowestRecord.maxScore} (${Math.round(lowestRecord.percentage)}%)`}
                  {lowestRecord.grade ? ` - Grade: ${lowestRecord.grade}` : ''}
                </p>
              </div>
            </div>

            <Accordion type="single" collapsible className="mt-4">
              <AccordionItem value="recentScores">
                <AccordionTrigger>Recent Assessments</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    {recentRecords.length > 0 ? (
                      recentRecords.map((record, index) => (
                        <div key={index} className="border-b pb-2 last:border-b-0">
                          <div className="flex justify-between">
                            <span className="font-medium">{record.subject}</span>
                            <span>
                              {record.isPercentage 
                                ? `${Math.round(record.percentage)}%` 
                                : `${record.score}/${record.maxScore}`}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {record.createdAt ? new Date(record.createdAt.toDate()).toLocaleDateString() : 'Unknown date'}
                            {record.grade ? ` - Grade: ${record.grade}` : ''}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No recent assessments found</p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        ) : (
          <p className="text-muted-foreground">No academic records found. Add some academic records to see your performance summary.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default MarksSummaryCard;
