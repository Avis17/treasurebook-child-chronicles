
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from "recharts";
import { useTheme } from "@/providers/ThemeProvider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DownloadCloud } from "lucide-react";
import { exportToExcel } from "@/lib/data-export";
import { toast } from "@/components/ui/use-toast";

interface SportsData {
  name: string;
  value: number;
  category?: string;
  fill?: string;
  year?: string | number;
}

type ChartType = 'bar' | 'radar';
type Dataset = 'performance' | 'progress' | 'comparison';

const sportsPerformanceData: SportsData[] = [
  { name: 'Running', value: 85, category: 'Athletics', fill: '#FF6B6B' },
  { name: 'Swimming', value: 70, category: 'Water Sports', fill: '#4D96FF' },
  { name: 'Basketball', value: 90, category: 'Team Sports', fill: '#6BCB77' },
  { name: 'Soccer', value: 75, category: 'Team Sports', fill: '#FFD93D' },
  { name: 'Tennis', value: 60, category: 'Racket Sports', fill: '#4CC9F0' }
];

const sportsProgressData: SportsData[] = [
  { name: 'Q1', value: 65, year: "2024", fill: '#FF6B6B' },
  { name: 'Q2', value: 72, year: "2024", fill: '#FF6B6B' },
  { name: 'Q3', value: 78, year: "2024", fill: '#FF6B6B' },
  { name: 'Q4', value: 85, year: "2024", fill: '#FF6B6B' }
];

const radarData = [
  { subject: 'Strength', A: 80, B: 65, fullMark: 100 },
  { subject: 'Speed', A: 70, B: 85, fullMark: 100 },
  { subject: 'Endurance', A: 65, B: 70, fullMark: 100 },
  { subject: 'Agility', A: 90, B: 75, fullMark: 100 },
  { subject: 'Coordination', A: 75, B: 80, fullMark: 100 },
  { subject: 'Teamwork', A: 85, B: 70, fullMark: 100 },
];

const SportsChart = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [dataset, setDataset] = useState<Dataset>('performance');

  // Determine which data to show based on selections
  const getActiveData = () => {
    switch (dataset) {
      case 'progress':
        return sportsProgressData;
      case 'comparison':
        return radarData;
      default:
        return sportsPerformanceData;
    }
  };

  const activeData = getActiveData();

  const handleExport = () => {
    let dataForExport;
    
    if (dataset === 'comparison') {
      dataForExport = radarData.map(item => ({
        Attribute: item.subject,
        'Current Performance': item.A,
        'Previous Performance': item.B,
        'Full Mark': item.fullMark
      }));
    } else {
      dataForExport = activeData.map(item => {
        const exportItem: {[key: string]: any} = {
          Name: item.name,
          Value: item.value
        };
        
        if (item.category) exportItem.Category = item.category;
        if (item.year) exportItem.Year = item.year;
        
        return exportItem;
      });
    }
    
    const success = exportToExcel(dataForExport, `sports-data-${dataset}`);
    
    if (success) {
      toast({
        title: "Export Successful",
        description: "Sports data has been exported to Excel",
      });
    } else {
      toast({
        title: "Export Failed",
        description: "Failed to export sports data to Excel",
        variant: "destructive",
      });
    }
  };

  const renderChart = () => {
    if (chartType === 'radar' || dataset === 'comparison') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart outerRadius={90} data={radarData}>
            <PolarGrid stroke={isDarkMode ? "#444" : "#ccc"} />
            <PolarAngleAxis dataKey="subject" stroke={isDarkMode ? "#aaa" : "#666"} />
            <PolarRadiusAxis stroke={isDarkMode ? "#aaa" : "#666"} />
            <Radar name="Current Performance" dataKey="A" stroke="#4361EE" fill="#4361EE" fillOpacity={0.6} />
            <Radar name="Previous Performance" dataKey="B" stroke="#FF6B6B" fill="#FF6B6B" fillOpacity={0.6} />
            <Legend />
            <Tooltip
              contentStyle={{
                backgroundColor: isDarkMode ? "#333" : "#fff",
                border: `1px solid ${isDarkMode ? "#444" : "#ddd"}`,
                color: isDarkMode ? "#fff" : "#333",
              }}
            />
          </RadarChart>
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
            <YAxis domain={[0, 100]} stroke={isDarkMode ? "#aaa" : "#666"} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDarkMode ? "#333" : "#fff",
                border: `1px solid ${isDarkMode ? "#444" : "#ddd"}`,
                color: isDarkMode ? "#fff" : "#333",
              }}
            />
            <Legend />
            <Bar dataKey="value" name="Performance" radius={[4, 4, 0, 0]} fill={dataset === 'progress' ? '#FF6B6B' : undefined}>
              {dataset === 'performance' && activeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );
    }
  };

  return (
    <Card className="dark:bg-gray-800">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg text-treasure-blue dark:text-blue-400">Sports Performance</CardTitle>
        <div className="flex items-center space-x-2">
          <Select value={chartType} onValueChange={(val) => setChartType(val as ChartType)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Chart Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bar">Bar Chart</SelectItem>
              <SelectItem value="radar">Radar Chart</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={dataset} onValueChange={(val) => setDataset(val as Dataset)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Dataset" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="performance">Performance</SelectItem>
              <SelectItem value="progress">Progress</SelectItem>
              <SelectItem value="comparison">Skill Comparison</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
      <CardFooter className="flex justify-between items-center border-t pt-4">
        <div className="text-sm text-muted-foreground">
          {chartType === 'bar' && dataset === 'performance' ? 'Bar chart showing performance across sports' : 
           chartType === 'bar' && dataset === 'progress' ? 'Bar chart showing progress over time' : 
           'Radar chart showing skill comparison'}
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

export default SportsChart;
