
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface AcademicRecord {
  id: string;
  subject: string;
  score: number;
  maxScore: number;
  isPercentage: boolean;
  grade: string;
  class?: string;
  term?: string;
  createdAt: any;
  examType?: string;
  year?: string;
}

// Extend the interface for chart data
interface ChartRecord extends AcademicRecord {
  calculatedPercentage: number;
}

const AcademicChart = () => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');

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
        const academicData: ChartRecord[] = [];
        
        querySnapshot.forEach((doc) => {
          const record = doc.data();
          console.log("Processing record:", record);
          
          const score = parseFloat(record.score?.toString() || '0');
          const maxScore = parseFloat(record.maxScore?.toString() || '100');
          
          // Calculate percentage based on isPercentage flag
          const calculatedPercentage = record.isPercentage ? score : (score / maxScore) * 100;
          
          academicData.push({
            id: doc.id,
            subject: record.subject || 'Unknown',
            score: score,
            maxScore: maxScore,
            isPercentage: record.isPercentage || false,
            calculatedPercentage: Math.round(calculatedPercentage),
            grade: record.grade || 'N/A',
            class: record.class || '',
            term: record.term || '',
            examType: record.examType || '',
            year: record.year || '',
            createdAt: record.createdAt
          });
        });
        
        // Group data by subject
        const subjectData: Record<string, any> = {};
        
        academicData.forEach(record => {
          if (!record.subject) return;
          
          const subject = record.subject;
          if (!subjectData[subject]) {
            subjectData[subject] = {
              subject,
              count: 0,
              totalPercentage: 0,
              scores: []
            };
          }
          
          subjectData[subject].count += 1;
          subjectData[subject].totalPercentage += record.calculatedPercentage;
          subjectData[subject].scores.push({
            score: record.score,
            maxScore: record.maxScore,
            calculatedPercentage: record.calculatedPercentage
          });
        });
        
        // Convert to chart data format
        const formattedData = Object.entries(subjectData).map(([subject, data]) => {
          const avgPercentage = data.totalPercentage / data.count;
          
          return {
            subject,
            percentage: Math.round(avgPercentage),
            count: data.count
          };
        }).sort((a, b) => a.subject.localeCompare(b.subject));
        
        console.log("Formatted chart data:", formattedData);
        setChartData(formattedData);
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

  const toggleChartType = () => {
    setChartType(prev => prev === 'bar' ? 'line' : 'bar');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Subject Performance</h3>
        <button 
          onClick={toggleChartType}
          className="px-3 py-1 text-xs bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors"
        >
          Switch to {chartType === 'bar' ? 'Line' : 'Bar'} Chart
        </button>
      </div>
      
      {chartData.length > 0 ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="subject" 
                  tick={{ fontSize: 12 }}
                  height={40}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis 
                  domain={[0, 100]} 
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Score']}
                  labelFormatter={(label) => `Subject: ${label}`}
                />
                <Legend />
                <Bar
                  dataKey="percentage"
                  name="Score (%)"
                  fill="#4f46e5"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            ) : (
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="subject" 
                  tick={{ fontSize: 12 }}
                  height={40}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis 
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Score']}
                  labelFormatter={(label) => `Subject: ${label}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="percentage"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 8 }}
                  name="Score (%)"
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex justify-center items-center h-64 text-gray-500">
          No academic data available.
        </div>
      )}
      
      {chartData.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-gray-500">
            Showing average scores across {chartData.length} subjects
          </p>
        </div>
      )}
    </div>
  );
};

export default AcademicChart;
