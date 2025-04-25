
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Book, CircleDot, Info, PenTool, Target } from "lucide-react";

interface ProgressData {
  academic: {
    progress: number;
    subjects: { name: string; score: number }[];
  };
  skills: {
    progress: number;
    items: { name: string; level: number }[];
  };
  focus: {
    progress: number;
    goals: string[];
  };
}

// Mock data - replace with real data later
const mockData: ProgressData = {
  academic: {
    progress: 80,
    subjects: [
      { name: "Mathematics", score: 85 },
      { name: "Science", score: 78 },
      { name: "English", score: 92 },
      { name: "History", score: 88 }
    ]
  },
  skills: {
    progress: 60,
    items: [
      { name: "Drawing", level: 70 },
      { name: "Piano", level: 45 },
      { name: "Chess", level: 85 }
    ]
  },
  focus: {
    progress: 40,
    goals: [
      "Complete Math assignment",
      "Practice piano for 30 minutes daily",
      "Prepare for Science quiz"
    ]
  }
};

const ProgressCard = ({ 
  title, 
  progress, 
  children, 
  icon: Icon 
}: { 
  title: string; 
  progress: number; 
  children: React.ReactNode; 
  icon: React.ElementType;
}) => (
  <Card className="h-full min-h-[250px] transition-all duration-200 hover:shadow-lg dark:hover:shadow-purple-900/20 border border-gray-200 dark:border-gray-800">
    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
      <CardTitle className="text-base font-semibold flex items-center gap-2">
        <Icon className="h-5 w-5 text-purple-500" />
        {title}
      </CardTitle>
      <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
        <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
          {progress}%
        </span>
      </div>
    </CardHeader>
    <CardContent>
      <div className="mt-2 mb-4">
        <Progress value={progress} className="h-2 bg-purple-100 dark:bg-purple-900/30">
          <div className="bg-purple-500" style={{ width: `${progress}%` }} />
        </Progress>
      </div>
      {children}
    </CardContent>
  </Card>
);

export const LearningProgressCards = () => {
  const data = mockData; // Replace with real data when available

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <ProgressCard title="Academic Progress" progress={data.academic.progress} icon={Book}>
        {data.academic.subjects.length > 0 ? (
          <div className="space-y-3">
            {data.academic.subjects.map((subject, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{subject.name}</span>
                <span className="text-sm font-medium">{subject.score}%</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Info className="h-4 w-4" />
            No subjects available
          </div>
        )}
      </ProgressCard>

      <ProgressCard title="Skill Progress" progress={data.skills.progress} icon={PenTool}>
        {data.skills.items.length > 0 ? (
          <div className="space-y-3">
            {data.skills.items.map((skill, index) => (
              <div key={index} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{skill.name}</span>
                  <span className="text-sm font-medium">{skill.level}%</span>
                </div>
                <Progress value={skill.level} className="h-1.5" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Info className="h-4 w-4" />
            No skills recorded yet
          </div>
        )}
      </ProgressCard>

      <ProgressCard title="Current Focus" progress={data.focus.progress} icon={Target}>
        {data.focus.goals.length > 0 ? (
          <div className="space-y-2">
            {data.focus.goals.map((goal, index) => (
              <div key={index} className="flex items-start gap-2">
                <CircleDot className="h-4 w-4 text-purple-500 mt-0.5" />
                <span className="text-sm text-gray-600 dark:text-gray-400">{goal}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Info className="h-4 w-4" />
            No current goals set
          </div>
        )}
      </ProgressCard>
    </div>
  );
};
