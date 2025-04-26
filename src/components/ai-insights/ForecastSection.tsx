
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';
import { BarChart3 } from "lucide-react";

interface ForecastSectionProps {
  forecasts: any[];
  isLoading: boolean;
}

export function ForecastSection({ forecasts, isLoading }: ForecastSectionProps) {
  // Sample data for the forecast chart
  const academicData = [
    { name: 'Current', value: 78 },
    { name: '1 Month', value: 81 },
    { name: '3 Months', value: 83 },
    { name: '6 Months', value: 86 }
  ];
  
  const sportsData = [
    { name: 'Current', value: 65 },
    { name: '1 Month', value: 69 },
    { name: '3 Months', value: 74 },
    { name: '6 Months', value: 78 }
  ];
  
  const extraData = [
    { name: 'Current', value: 70 },
    { name: '1 Month', value: 72 },
    { name: '3 Months', value: 75 },
    { name: '6 Months', value: 80 }
  ];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-56" />
        <div className="grid gap-4">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Performance Forecast</CardTitle>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12 }}
                    tickMargin={10}
                    allowDuplicatedCategory={false}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    domain={[0, 100]}
                    tickMargin={10}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '8px', 
                      padding: '8px 12px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      border: '1px solid #f0f0f0'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    data={academicData}
                    dataKey="value" 
                    name="Academic" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: 'white' }}
                    activeDot={{ r: 6, fill: '#3b82f6' }}
                  />
                  <Line 
                    type="monotone" 
                    data={sportsData}
                    dataKey="value" 
                    name="Sports" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: 'white' }}
                    activeDot={{ r: 6, fill: '#10b981' }}
                  />
                  <Line 
                    type="monotone" 
                    data={extraData}
                    dataKey="value" 
                    name="Extracurricular" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: 'white' }}
                    activeDot={{ r: 6, fill: '#8b5cf6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Growth Forecast Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">
              {forecasts[0]?.text || "Based on current performance trends, steady improvement is expected across academic, sports, and extracurricular activities. Consistent engagement in current activities and the implementation of recommended action plans will support this positive trajectory. The academic growth curve shows particularly promising acceleration if current study habits are maintained."}
            </p>
            
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col gap-1 text-center">
                    <span className="text-xs text-muted-foreground">Academic</span>
                    <span className="text-2xl font-bold text-blue-500">+10%</span>
                    <span className="text-xs text-muted-foreground">Expected improvement</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col gap-1 text-center">
                    <span className="text-xs text-muted-foreground">Sports</span>
                    <span className="text-2xl font-bold text-green-500">+20%</span>
                    <span className="text-xs text-muted-foreground">Expected improvement</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col gap-1 text-center">
                    <span className="text-xs text-muted-foreground">Extracurricular</span>
                    <span className="text-2xl font-bold text-purple-500">+14%</span>
                    <span className="text-xs text-muted-foreground">Expected improvement</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
