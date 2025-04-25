import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Radar } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar as RechartsRadar, ResponsiveContainer, Tooltip } from 'recharts';
import { useAcademicRecords, useSportsRecords, useExtracurricularRecords } from '@/lib/dashboard-service';
import { useAuth } from "@/contexts/AuthContext";

const StudentProgressRadar = () => {
  const { currentUser } = useAuth();
  const { data: academicRecords, loading: loadingAcademics } = useAcademicRecords(currentUser?.uid);
  const { data: sportsRecords, loading: loadingSports } = useSportsRecords(currentUser?.uid);
  const { data: extracurricularRecords, loading: loadingExtra } = useExtracurricularRecords(currentUser?.uid);

  const radarData = useMemo(() => {
    // Calculate academic performance (average percentage)
    const academicScore = academicRecords.reduce((acc, record) => {
      const score = record.isPercentage ? record.score : (record.score / record.maxScore) * 100;
      return acc + score;
    }, 0) / (academicRecords.length || 1);

    // Calculate sports performance (based on positions)
    const sportsScore = sportsRecords.reduce((acc, record) => {
      const positionScores: Record<string, number> = {
        'Gold': 100,
        'Silver': 80,
        'Bronze': 60,
        'Finalist': 40,
        'Participant': 20
      };
      return acc + (positionScores[record.position] || 20);
    }, 0) / (sportsRecords.length || 1);

    // Calculate extracurricular performance
    const extraScore = extracurricularRecords.length * 20; // 20 points per activity, max 100
    const normalizedExtraScore = Math.min(100, extraScore);

    return [
      { area: 'Academics', value: Math.round(academicScore) },
      { area: 'Sports', value: Math.round(sportsScore) },
      { area: 'Extracurricular', value: Math.round(normalizedExtraScore) },
    ];
  }, [academicRecords, sportsRecords, extracurricularRecords]);

  if (loadingAcademics || loadingSports || loadingExtra) {
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
        <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
        <Radar className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
              <PolarGrid stroke="#e2e8f0" />
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
        <div className="mt-4 space-y-2">
          {radarData.map((item) => (
            <div key={item.area} className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{item.area}</span>
              <span className="text-sm font-medium">{item.value}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentProgressRadar;
