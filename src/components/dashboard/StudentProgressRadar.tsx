
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Radar } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar as RechartsRadar, ResponsiveContainer, Tooltip, PolarRadiusAxis } from 'recharts';
import { useAcademicRecords, useSportsRecords, useExtracurricularRecords, useProfile, calculateGrowthScore } from '@/lib/dashboard-service';
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

const StudentProgressRadar = () => {
  const { currentUser } = useAuth();
  const { data: academicRecords, loading: loadingAcademics } = useAcademicRecords(currentUser?.uid);
  const { data: sportsRecords, loading: loadingSports } = useSportsRecords(currentUser?.uid);
  const { data: extracurricularRecords, loading: loadingExtra } = useExtracurricularRecords(currentUser?.uid);
  const { profile, loading: loadingProfile } = useProfile(currentUser?.uid);

  const radarData = useMemo(() => {
    // Calculate academic performance (average percentage)
    let academicScore = 0;
    if (academicRecords && academicRecords.length > 0) {
      academicScore = academicRecords.reduce((acc, record) => {
        // Check if the record has a valid score
        if (record.score === undefined || record.score === null) return acc;
        
        // Calculate percentage based on isPercentage flag
        const calculatedPercentage = record.isPercentage ? 
          Number(record.score) : 
          (Number(record.score) / (Number(record.maxScore) || 100)) * 100;
        
        // Only add valid percentages
        return isNaN(calculatedPercentage) ? acc : acc + calculatedPercentage;
      }, 0) / academicRecords.length;
    }

    // Calculate sports performance (based on positions)
    let sportsScore = 0;
    if (sportsRecords && sportsRecords.length > 0) {
      sportsScore = sportsRecords.reduce((acc, record) => {
        const position = (record.position || '').toLowerCase();
        
        // Map positions to scores
        let positionScore = 20; // Default score
        
        if (position.includes('gold') || position.includes('1st')) {
          positionScore = 100;
        } else if (position.includes('silver') || position.includes('2nd')) {
          positionScore = 80;
        } else if (position.includes('bronze') || position.includes('3rd')) {
          positionScore = 60;
        } else if (position.includes('finalist')) {
          positionScore = 40;
        } else if (position.includes('semifinalist') || position.includes('semi-finalist')) {
          positionScore = 30;
        }
        
        return acc + positionScore;
      }, 0) / sportsRecords.length;
    }

    // Calculate extracurricular performance
    const extraScore = extracurricularRecords && extracurricularRecords.length > 0 ? 
      Math.min(extracurricularRecords.length * 20, 100) :
      0;

    return [
      { area: 'Academics', value: Math.round(academicScore) || 0 },
      { area: 'Sports', value: Math.round(sportsScore) || 0 },
      { area: 'Extracurricular', value: Math.round(extraScore) || 0 },
    ];
  }, [academicRecords, sportsRecords, extracurricularRecords]);

  const studentName = profile?.childName || "Student";
  const growthScore = useMemo(() => {
    return calculateGrowthScore(
      academicRecords || [], 
      sportsRecords || [], 
      extracurricularRecords || [], 
      [], // goals
      [], // milestones
      []  // journal entries
    );
  }, [academicRecords, sportsRecords, extracurricularRecords]);

  if (loadingAcademics || loadingSports || loadingExtra || loadingProfile) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
          <Radar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-[300px]">
            <div className="animate-spin w-6 h-6 border-t-2 border-b-2 border-primary rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{studentName}'s Progress</CardTitle>
        <Radar className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <PolarAngleAxis
                dataKey="area"
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white dark:bg-gray-800 p-2 shadow rounded border">
                        <p className="text-sm">
                          {payload[0].payload.area}: {payload[0].value}%
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <RechartsRadar
                name="Progress"
                dataKey="value"
                stroke="#4f46e5"
                fill="#4f46e5"
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold">Overall Growth</span>
              <Badge variant={growthScore > 70 ? "success" : growthScore > 50 ? "warning" : "destructive"} 
                className={`px-2 py-1 ${
                  growthScore > 70 
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" 
                    : growthScore > 50 
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                }`}>
                {growthScore}%
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {growthScore > 70 
                ? "Excellent Progress" 
                : growthScore > 50 
                  ? "Good Progress" 
                  : "Needs Improvement"}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {radarData.map((item) => (
              <div key={item.area} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <div className="text-sm font-medium mb-1">{item.area}</div>
                <div className="flex justify-between items-center">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${item.value}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm font-medium">{item.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentProgressRadar;
