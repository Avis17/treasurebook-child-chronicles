
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface GradeScore {
  subject: string;
  score: number;
  maxScore: number;
  percentage: number;
  createdAt: Date;
}

const AcademicChart = () => {
  const [chartData, setChartData] = useState<GradeScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAcademicData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const user = auth.currentUser;
        if (!user) return;

        // Fetch academic records from Firebase
        const academicRef = collection(db, "academicRecords");
        const q = query(
          academicRef, 
          where("userId", "==", user.uid)
        );
        
        console.log("Fetching academic records for user:", user.uid);
        const querySnapshot = await getDocs(q);
        console.log("Records found:", querySnapshot.size);
        
        // Process the data
        const academicData: GradeScore[] = [];
        
        querySnapshot.forEach((doc) => {
          const record = doc.data();
          console.log("Processing record:", record);
          
          const score = parseFloat(record.score) || 0;
          const maxScore = parseFloat(record.maxScore) || 100;
          const percentage = record.isPercentage ? score : (score / maxScore) * 100;
          const createdAtDate = record.createdAt ? new Date(record.createdAt.toDate()) : new Date();
          
          academicData.push({
            subject: record.subject || 'Unknown',
            score,
            maxScore,
            percentage: Math.round(percentage),
            createdAt: createdAtDate
          });
        });
        
        // Sort by subject name for consistent display
        academicData.sort((a, b) => a.subject.localeCompare(b.subject));
        console.log("Processed academic data:", academicData);
        
        setChartData(academicData);
      } catch (error) {
        console.error('Error fetching academic data:', error);
        setError('Failed to load academic data. Please try again later.');
        setChartData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAcademicData();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Academic Performance</CardTitle>
          <CardDescription>Subject-wise performance in percentage</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-64">
          <div className="animate-spin w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Academic Performance</CardTitle>
          <CardDescription>Subject-wise performance in percentage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-64 text-red-500">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Academic Performance</CardTitle>
        <CardDescription>Subject-wise performance in percentage</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Score']}
                  labelFormatter={(label) => `Subject: ${label}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="percentage"
                  stroke="#4f46e5"
                  activeDot={{ r: 8 }}
                  name="Score (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex justify-center items-center h-64 text-gray-500">
            No academic data available.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AcademicChart;
