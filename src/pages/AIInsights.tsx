
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { SummaryTabs } from "@/components/ai-insights/SummaryTabs";
import { ActionPlanTabs } from "@/components/ai-insights/ActionPlanTabs";
import { ForecastSection } from "@/components/ai-insights/ForecastSection";
import { SuggestionsSection } from "@/components/ai-insights/SuggestionsSection";
import { QuizInsights } from "@/components/ai-insights/QuizInsights";
import suggestionsData from "@/data/ai-insights/suggestions.json";
import forecasts from "@/data/ai-insights/forecasts.json";
import actionPlansData from "@/data/ai-insights/action-plans.json";
import { useSportsRecords, useAcademicRecords, useExtracurricularRecords, identifyWeakAreas } from "@/lib/dashboard-service";
import { Lightbulb } from "lucide-react";

// Transform action plans data to match expected ActionPlan type
const transformActionPlans = () => {
  return {
    shortterm: actionPlansData.flatMap(plan => plan.shortTerm || []),
    mediumterm: actionPlansData.flatMap(plan => plan.mediumTerm || []),
    longterm: actionPlansData.flatMap(plan => plan.longTerm || [])
  };
};

// Transform suggestions data to match expected format
const transformSuggestions = () => {
  return suggestionsData.map(suggestion => ({
    id: suggestion.id,
    category: suggestion.category,
    title: `Insight #${suggestion.priority}`,
    text: suggestion.content,
    type: suggestion.trigger.condition
  }));
};

export default function AIInsights() {
  const { currentUser } = useAuth();
  const userId = currentUser?.uid;
  
  const { data: academicRecords, loading: loadingAcademic } = useAcademicRecords(userId);
  const { data: sportsRecords, loading: loadingSports } = useSportsRecords(userId);
  const { data: extraRecords, loading: loadingExtra } = useExtracurricularRecords(userId);
  
  const [isLoading, setIsLoading] = useState(true);
  const [weakAreas, setWeakAreas] = useState<string[]>([]);
  const [actionPlans, setActionPlans] = useState(() => transformActionPlans());
  const [suggestions, setSuggestions] = useState(() => transformSuggestions());

  // Wait for all data to load
  useEffect(() => {
    if (!loadingAcademic && !loadingSports && !loadingExtra) {
      // Calculate weak areas
      const areas = identifyWeakAreas(academicRecords, sportsRecords, extraRecords);
      setWeakAreas(areas);
      setIsLoading(false);
    }
  }, [loadingAcademic, loadingSports, loadingExtra, academicRecords, sportsRecords, extraRecords]);

  return (
    <AppLayout title="AI Insights">
      <div className="container py-6">
        <div className="mx-auto max-w-6xl space-y-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
              <Lightbulb className="h-8 w-8 text-yellow-500" />
              AI Insights
            </h1>
            <p className="text-muted-foreground">
              Get AI-powered insights and recommendations based on performance data
            </p>
          </div>

          <Tabs defaultValue="summary" className="space-y-8">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="summary">Performance Summary</TabsTrigger>
              <TabsTrigger value="action-plans">Action Plans</TabsTrigger>
              <TabsTrigger value="forecasts">Performance Forecasts</TabsTrigger>
              <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
              <TabsTrigger value="quiz">Quiz Insights</TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary" className="mt-4">
              <SummaryTabs isLoading={isLoading} weakAreas={weakAreas} />
            </TabsContent>
            
            <TabsContent value="action-plans" className="mt-4">
              <ActionPlanTabs actionPlans={actionPlans} isLoading={isLoading} />
            </TabsContent>
            
            <TabsContent value="forecasts" className="mt-4">
              <ForecastSection forecasts={forecasts} isLoading={isLoading} />
            </TabsContent>
            
            <TabsContent value="suggestions" className="mt-4">
              <SuggestionsSection suggestions={suggestions} isLoading={isLoading} />
            </TabsContent>
            
            <TabsContent value="quiz" className="mt-4">
              <QuizInsights />
            </TabsContent>
          </Tabs>
          
          <Card className="p-4 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <span className="font-bold">Note:</span> AI insights are generated based on the data you've provided. The more information you enter into TreasureBook, the more accurate and helpful these insights will become.
            </p>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
