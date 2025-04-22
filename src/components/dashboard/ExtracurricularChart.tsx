
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { useTheme } from "@/providers/ThemeProvider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DownloadCloud } from "lucide-react";
import { exportToExcel } from "@/lib/data-export";
import { toast } from "@/components/ui/use-toast";

interface ActivityData {
  name: string;
  hours: number;
  color: string;
  category?: string;
}

type ChartType = 'pie' | 'bar';
type Dataset = 'time' | 'achievement' | 'participation';

const activitiesData: ActivityData[] = [
  { name: 'Music', hours: 12, color: '#FF6B6B', category: 'Arts' },
  { name: 'Drama', hours: 8, color: '#4D96FF', category: 'Arts' },
  { name: 'Debate', hours: 6, color: '#6BCB77', category: 'Academic' },
  { name: 'Volunteering', hours: 10, color: '#FFD93D', category: 'Community' },
  { name: 'Robotics', hours: 14, color: '#4CC9F0', category: 'Academic' }
];

const achievementsData: ActivityData[] = [
  { name: 'Music', hours: 3, color: '#FF6B6B', category: 'Awards' },
  { name: 'Drama', hours: 2, color: '#4D96FF', category: 'Awards' },
  { name: 'Debate', hours: 4, color: '#6BCB77', category: 'Awards' },
  { name: 'Volunteering', hours: 1, color: '#FFD93D', category: 'Recognition' },
  { name: 'Robotics', hours: 5, color: '#4CC9F0', category: 'Awards' }
];

const participationData: ActivityData[] = [
  { name: 'School Events', hours: 10, color: '#FF6B6B' },
  { name: 'Community Events', hours: 15, color: '#4D96FF' },
  { name: 'Competitions', hours: 8, color: '#6BCB77' },
  { name: 'Workshops', hours: 12, color: '#FFD93D' },
  { name: 'Leadership Roles', hours: 5, color: '#4CC9F0' }
];

const ExtracurricularChart = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [chartType, setChartType] = useState<ChartType>('pie');
  const [dataset, setDataset] = useState<Dataset>('time');

  // Determine which data to show based on selections
  const getActiveData = () => {
    switch (dataset) {
      case 'achievement':
        return achievementsData;
      case 'participation':
        return participationData;
      default:
        return activitiesData;
    }
  };

  const activeData = getActiveData();

  const handleExport = () => {
    const dataForExport = activeData.map(item => ({
      Activity: item.name,
      Hours: item.hours,
      Category: item.category || 'N/A'
    }));
    
    const success = exportToExcel(dataForExport, `extracurricular-data-${dataset}`);
    
    if (success) {
      toast({
        title: "Export Successful",
        description: "Extracurricular data has been exported to Excel",
      });
    } else {
      toast({
        title: "Export Failed",
        description: "Failed to export extracurricular data to Excel",
        variant: "destructive",
      });
    }
  };

  const renderChart = () => {
    if (chartType === 'pie') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={activeData}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="hours"
            >
              {activeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: isDarkMode ? "#333" : "#fff",
                border: `1px solid ${isDarkMode ? "#444" : "#ddd"}`,
                color: isDarkMode ? "#fff" : "#333",
              }}
              formatter={(value: number) => [`${value} hours`, 'Time Spent']}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    } else {
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
            <XAxis dataKey="name" stroke={isDarkMode ? "#aaa" : "#666"} />
            <YAxis stroke={isDarkMode ? "#aaa" : "#666"} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDarkMode ? "#333" : "#fff",
                border: `1px solid ${isDarkMode ? "#444" : "#ddd"}`,
                color: isDarkMode ? "#fff" : "#333",
              }}
              formatter={(value: number) => [`${value} ${dataset === 'achievement' ? 'awards' : 'hours'}`, dataset === 'achievement' ? 'Achievements' : 'Time Spent']}
            />
            <Legend />
            <Bar dataKey="hours" name={dataset === 'achievement' ? 'Achievements' : 'Hours Spent'}>
              {activeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );
    }
  };

  const getTitle = () => {
    switch (dataset) {
      case 'achievement':
        return 'Achievements in Extracurricular Activities';
      case 'participation':
        return 'Participation in Events & Activities';
      default:
        return 'Time Spent on Extracurricular Activities';
    }
  };

  return (
    <Card className="dark:bg-gray-800">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg text-treasure-blue dark:text-blue-400">{getTitle()}</CardTitle>
        <div className="flex items-center space-x-2">
          <Select value={chartType} onValueChange={(val) => setChartType(val as ChartType)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Chart Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pie">Pie Chart</SelectItem>
              <SelectItem value="bar">Bar Chart</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={dataset} onValueChange={(val) => setDataset(val as Dataset)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Dataset" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="time">Time Spent</SelectItem>
              <SelectItem value="achievement">Achievements</SelectItem>
              <SelectItem value="participation">Participation</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
      <CardFooter className="flex justify-between items-center border-t pt-4">
        <div className="text-sm text-muted-foreground">
          {dataset === 'time' ? 'Hours spent on different activities' : 
           dataset === 'achievement' ? 'Number of achievements by activity' : 
           'Participation in different types of events'}
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

export default ExtracurricularChart;
