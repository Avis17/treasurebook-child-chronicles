
import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface ActivityCount {
  name: string;
  value: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const ExtracurricularChart = () => {
  const [chartData, setChartData] = useState<ActivityCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExtracurricularData = async () => {
      try {
        setIsLoading(true);
        const user = auth.currentUser;
        if (!user) return;

        // Fetch extracurricular records from Firebase
        const activitiesRef = collection(db, "extraCurricularRecords");
        const q = query(activitiesRef, where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        
        // Process the data to group by category
        const categoryCounts: Record<string, number> = {};
        
        querySnapshot.forEach((doc) => {
          const record = doc.data();
          const category = record.category || 'Other';
          
          if (categoryCounts[category]) {
            categoryCounts[category]++;
          } else {
            categoryCounts[category] = 1;
          }
        });
        
        // Convert to chart format
        const data: ActivityCount[] = Object.keys(categoryCounts).map(key => ({
          name: key,
          value: categoryCounts[key]
        }));
        
        setChartData(data);
      } catch (error) {
        console.error('Error fetching extracurricular data:', error);
        setChartData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExtracurricularData();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Extracurricular Activities</CardTitle>
          <CardDescription>Distribution by category</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-64">
          <div className="animate-spin w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Extracurricular Activities</CardTitle>
        <CardDescription>Distribution by category</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} activities`, 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex justify-center items-center h-64 text-gray-500">
            No extracurricular data available.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExtracurricularChart;
