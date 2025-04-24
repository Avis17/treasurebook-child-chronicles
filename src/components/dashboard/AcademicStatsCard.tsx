
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { BookOpen } from "lucide-react";

interface GradeDistribution {
  grade: string;
  count: number;
  color: string;
}

const AcademicStatsCard = () => {
  const [loading, setLoading] = useState(true);
  const [gradeDistribution, setGradeDistribution] = useState<GradeDistribution[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [averageScore, setAverageScore] = useState(0);

  // Color mapping for grades
  const gradeColors = {
    'A+': '#22c55e', // Green
    'A': '#4ade80',
    'B+': '#60a5fa', // Blue
    'B': '#93c5fd',
    'C+': '#fbbf24', // Yellow
    'C': '#fcd34d',
    'D': '#f87171', // Red
    'F': '#ef4444',
  };

  useEffect(() => {
    const fetchAcademicStats = async () => {
      try {
        setLoading(true);
        const user = auth.currentUser;
        if (!user) return;

        // Fetch academic records from Firebase
        const academicRef = collection(db, "academicRecords");
        const q = query(academicRef, where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        
        // Process the data
        const gradeCounts: Record<string, number> = {
          'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C+': 0, 'C': 0, 'D': 0, 'F': 0
        };
        
        let totalScore = 0;
        let count = 0;
        
        querySnapshot.forEach((doc) => {
          const record = doc.data();
          const grade = record.grade || 'N/A';
          
          if (gradeCounts.hasOwnProperty(grade)) {
            gradeCounts[grade]++;
          }
          
          // Calculate average score
          if (record.isPercentage) {
            totalScore += record.score;
          } else {
            totalScore += (record.score / record.maxScore) * 100;
          }
          count++;
        });
        
        // Format data for chart
        const chartData: GradeDistribution[] = Object.entries(gradeCounts).map(([grade, count]) => ({
          grade,
          count,
          color: gradeColors[grade as keyof typeof gradeColors] || '#94a3b8'
        }));
        
        setGradeDistribution(chartData);
        setTotalRecords(count);
        setAverageScore(count > 0 ? Math.round(totalScore / count) : 0);
        
      } catch (error) {
        console.error('Error fetching academic stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAcademicStats();
  }, []);

  if (loading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Academic Performance</CardTitle>
          <CardDescription>Overall grade distribution and statistics</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-64">
          <div className="animate-spin w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-500" />
          <div>
            <CardTitle>Academic Performance Overview</CardTitle>
            <CardDescription>Analysis of grades across all subjects</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Assessments</h3>
            <p className="text-3xl font-bold">{totalRecords}</p>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Score</h3>
            <p className="text-3xl font-bold">{averageScore}%</p>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Top Grade</h3>
            <p className="text-3xl font-bold">
              {gradeDistribution.find(g => g.count > 0)?.grade || 'N/A'}
            </p>
          </div>
        </div>
        
        {totalRecords > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="grade" />
                <YAxis allowDecimals={false} />
                <Tooltip 
                  formatter={(value) => [`${value} subjects`, 'Count']}
                  labelFormatter={(label) => `Grade: ${label}`}
                />
                <Bar dataKey="count" fill="#8884d8" name="Subjects">
                  {gradeDistribution.map((entry, index) => (
                    <Bar key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <p>No academic records available.</p>
            <p className="text-sm mt-2">Add some academic records to see your statistics.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AcademicStatsCard;
