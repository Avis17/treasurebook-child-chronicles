
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface SportsByCategory {
  name: string;
  count: number;
}

const SportsChart = () => {
  const [chartData, setChartData] = useState<SportsByCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSportsData = async () => {
      try {
        setIsLoading(true);
        const user = auth.currentUser;
        if (!user) return;

        // Fetch sports records from Firebase
        const sportsRef = collection(db, "sportsRecords");
        const q = query(sportsRef, where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        
        // Process the data to group by event type
        const eventTypeCounts: Record<string, number> = {};
        
        querySnapshot.forEach((doc) => {
          const record = doc.data();
          const eventType = record.eventType || 'Other';
          
          if (eventTypeCounts[eventType]) {
            eventTypeCounts[eventType]++;
          } else {
            eventTypeCounts[eventType] = 1;
          }
        });
        
        // Convert to chart format
        const data: SportsByCategory[] = Object.keys(eventTypeCounts).map(key => ({
          name: key,
          count: eventTypeCounts[key]
        }));
        
        setChartData(data);
      } catch (error) {
        console.error('Error fetching sports data:', error);
        setChartData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSportsData();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sports Activities</CardTitle>
          <CardDescription>Distribution of sports activities by type</CardDescription>
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
        <CardTitle>Sports Activities</CardTitle>
        <CardDescription>Distribution of sports activities by type</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value} events`, 'Count']}
                  labelFormatter={(label) => `Sport: ${label}`}
                />
                <Bar dataKey="count" fill="#4f46e5" name="Events" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex justify-center items-center h-64 text-gray-500">
            No sports data available.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SportsChart;
