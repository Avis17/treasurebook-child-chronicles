
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-treasure-blue">Academic Performance</CardTitle>
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
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="subject" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Bar dataKey="score" fill="#4361EE" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default AcademicChart;
