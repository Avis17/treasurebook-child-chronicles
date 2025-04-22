
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTheme } from "@/providers/ThemeProvider";

interface AcademicData {
  subject: string;
  score: number;
  color: string;
}

const sampleData: AcademicData[] = [
  { subject: "Mathematics", score: 90, color: "#4361EE" },
  { subject: "Science", score: 85, color: "#4361EE" },
  { subject: "English", score: 95, color: "#4361EE" },
  { subject: "Social Studies", score: 80, color: "#4361EE" },
  { subject: "Arts", score: 92, color: "#4361EE" },
];

const AcademicChart = () => {
  const [chartWidth, setChartWidth] = useState(0);
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setChartWidth(300);
      } else {
        setChartWidth(500);
      }
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <Card className="dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-lg text-treasure-blue dark:text-blue-400">Academic Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={sampleData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#444" : "#ccc"} />
            <XAxis dataKey="subject" stroke={isDarkMode ? "#aaa" : "#666"} />
            <YAxis domain={[0, 100]} stroke={isDarkMode ? "#aaa" : "#666"} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDarkMode ? "#333" : "#fff",
                border: `1px solid ${isDarkMode ? "#444" : "#ddd"}`,
                color: isDarkMode ? "#fff" : "#333",
              }}
            />
            <Bar dataKey="score" fill="#4361EE" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default AcademicChart;
