
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";
import { useTheme } from "@/providers/ThemeProvider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DownloadCloud } from "lucide-react";
import { exportToExcel } from "@/lib/data-export";
import { toast } from "@/components/ui/use-toast";

interface AcademicData {
  subject: string;
  score: number;
  color: string;
  year?: string | number;
  term?: string;
}

type ChartType = 'bar' | 'line' | 'pie';
type TimePeriod = 'term1' | 'term2' | 'term3' | 'year';
type Dataset = 'current' | 'progress' | 'comparison';

// Sample data for different views
const subjectData: AcademicData[] = [
  { subject: "Mathematics", score: 90, color: "#4361EE" },
  { subject: "Science", score: 85, color: "#3A0CA3" },
  { subject: "English", score: 95, color: "#4CC9F0" },
  { subject: "Social Studies", score: 80, color: "#7209B7" },
  { subject: "Arts", score: 92, color: "#F72585" },
];

const progressData: AcademicData[] = [
  { subject: "Term 1", score: 82, color: "#4361EE", year: "2024" },
  { subject: "Term 2", score: 86, color: "#4361EE", year: "2024" },
  { subject: "Term 3", score: 88, color: "#4361EE", year: "2024" },
  { subject: "Term 1", score: 85, color: "#3A0CA3", year: "2025" },
  { subject: "Term 2", score: 90, color: "#3A0CA3", year: "2025" },
];

const comparisonData: AcademicData[] = [
  { subject: "Mathematics", score: 85, color: "#4361EE", term: "Previous" },
  { subject: "Mathematics", score: 90, color: "#7209B7", term: "Current" },
  { subject: "Science", score: 80, color: "#4361EE", term: "Previous" },
  { subject: "Science", score: 85, color: "#7209B7", term: "Current" },
  { subject: "English", score: 90, color: "#4361EE", term: "Previous" },
  { subject: "English", score: 95, color: "#7209B7", term: "Current" },
  { subject: "Social Studies", score: 75, color: "#4361EE", term: "Previous" },
  { subject: "Social Studies", score: 80, color: "#7209B7", term: "Current" },
  { subject: "Arts", score: 88, color: "#4361EE", term: "Previous" },
  { subject: "Arts", score: 92, color: "#7209B7", term: "Current" },
];

const pieData = [
  { name: "Mathematics", value: 90, color: "#4361EE" },
  { name: "Science", value: 85, color: "#3A0CA3" },
  { name: "English", value: 95, color: "#4CC9F0" },
  { name: "Social Studies", value: 80, color: "#7209B7" },
  { name: "Arts", value: 92, color: "#F72585" },
];

const COLORS = ["#4361EE", "#3A0CA3", "#4CC9F0", "#7209B7", "#F72585", "#F94144", "#F3722C"];

const AcademicChart = () => {
  const [chartWidth, setChartWidth] = useState(0);
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('term1');
  const [dataset, setDataset] = useState<Dataset>('current');
  
  // Determine which data to show based on selections
  const getActiveData = () => {
    switch (dataset) {
      case 'progress':
        return progressData;
      case 'comparison':
        return comparisonData;
      default:
        return subjectData;
    }
  };

  const activeData = getActiveData();
  
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

  const handleExport = () => {
    const dataForExport = activeData.map(item => {
      const exportItem: {[key: string]: any} = {
        Subject: item.subject,
        Score: item.score
      };
      
      if (item.year) exportItem.Year = item.year;
      if (item.term) exportItem.Term = item.term;
      
      return exportItem;
    });
    
    const success = exportToExcel(dataForExport, `academic-data-${dataset}`);
    
    if (success) {
      toast({
        title: "Export Successful",
        description: "Data has been exported to Excel",
      });
    } else {
      toast({
        title: "Export Failed",
        description: "Failed to export data to Excel",
        variant: "destructive",
      });
    }
  };

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart 
              data={activeData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
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
              <Legend />
              {dataset === 'comparison' ? (
                <>
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#4361EE"
                    name="Previous Term"
                    strokeWidth={2}
                    connectNulls
                    dot={{ r: 3 }}
                    activeDot={{ r: 8 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#7209B7"
                    name="Current Term"
                    strokeWidth={2}
                    connectNulls
                    dot={{ r: 3 }}
                    activeDot={{ r: 8 }}
                  />
                </>
              ) : (
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#4361EE"
                  strokeWidth={2}
                  connectNulls
                  dot={{ r: 3 }}
                  activeDot={{ r: 8 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? "#333" : "#fff",
                  border: `1px solid ${isDarkMode ? "#444" : "#ddd"}`,
                  color: isDarkMode ? "#fff" : "#333",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      
      default: // Bar chart
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={activeData}
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
              <Legend />
              {dataset === 'comparison' ? (
                <>
                  <Bar dataKey="score" fill="#4361EE" name="Previous Term" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="score" fill="#7209B7" name="Current Term" radius={[4, 4, 0, 0]} />
                </>
              ) : (
                <Bar dataKey="score" fill="#4361EE" radius={[4, 4, 0, 0]} />
              )}
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <Card className="dark:bg-gray-800">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg text-treasure-blue dark:text-blue-400">Academic Performance</CardTitle>
        <div className="flex items-center space-x-2">
          <Select value={chartType} onValueChange={(val) => setChartType(val as ChartType)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Chart Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bar">Bar Chart</SelectItem>
              <SelectItem value="line">Line Chart</SelectItem>
              <SelectItem value="pie">Pie Chart</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={dataset} onValueChange={(val) => setDataset(val as Dataset)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Dataset" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current Scores</SelectItem>
              <SelectItem value="progress">Progress Over Time</SelectItem>
              <SelectItem value="comparison">Term Comparison</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
      <CardFooter className="flex justify-between items-center border-t pt-4">
        <div className="text-sm text-muted-foreground">
          {chartType === 'bar' ? 'Bar chart showing subject scores' : 
           chartType === 'line' ? 'Line chart showing performance trend' : 
           'Pie chart showing distribution of grades'}
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleExport}
          className="flex items-center gap-1"
        >
          <DownloadCloud className="h-4 w-4" /> 
          Export
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AcademicChart;
