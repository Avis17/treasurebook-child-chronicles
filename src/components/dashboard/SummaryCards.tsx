
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import ActivitySummary from "./ActivitySummary";
import MarksSummaryCard from "./MarksSummaryCard";
import AcademicStatsCard from "./AcademicStatsCard";
import { LearningProgressCards } from "./LearningProgressCards";

const SummaryCards = () => {
  const navigate = useNavigate();

  const viewAllActivity = () => {
    navigate('/calendar');
  };

  const viewAllAcademics = () => {
    navigate('/academics');
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center">
              <CardTitle className="text-sm font-medium">Upcoming Activities</CardTitle>
            </div>
            <Button variant="ghost" size="sm" className="text-xs" onClick={viewAllActivity}>
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <ActivitySummary />
          </CardContent>
        </Card>

        <MarksSummaryCard />
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center">
              <CardTitle className="text-sm font-medium">Academic Records</CardTitle>
            </div>
            <Button variant="ghost" size="sm" className="text-xs" onClick={viewAllAcademics}>
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                View and manage all your academic records, add new tests and track your progress over time.
              </p>
              <Button className="w-full" onClick={viewAllAcademics}>
                Go to Academic Records
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6">
        <Card className="border-none shadow-none bg-transparent">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-xl font-bold dark:text-white">Learning Progress</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <LearningProgressCards />
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6">
        <AcademicStatsCard />
      </div>
    </div>
  );
};

export { SummaryCards };
