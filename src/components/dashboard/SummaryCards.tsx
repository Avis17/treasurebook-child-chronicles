
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import ActivitySummary from "./ActivitySummary";
import MarksSummaryCard from "./MarksSummaryCard";

const SummaryCards = () => {
  const navigate = useNavigate();

  const viewAllActivity = () => {
    navigate('/calendar');
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
    </div>
  );
};

export { SummaryCards };
