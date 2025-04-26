
import { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Lightbulb, Star, LineChart } from "lucide-react";
import actionPlansData from "../data/ai-insights/action-plans.json";
import suggestionsData from "../data/ai-insights/suggestions.json";
import forecastsData from "../data/ai-insights/forecasts.json";
import { AIInsightsQuizCard } from "@/components/dashboard/AIInsightsQuizCard";
import { 
  useAcademicRecords, 
  useSportsRecords, 
  useExtracurricularRecords,
  useGoals,
  useMilestones,
  useJournalEntries,
  calculateGrowthScore,
  identifyWeakAreas
} from "@/lib/dashboard-service";

interface ActionPlan {
  id: string;
  shortterm: string[];
  mediumterm: string[];
  longterm: string[];
}

interface SuggestionItem {
  id: string;
  category: string;
  title: string;
  text: string;
  type: string;
}

interface ForecastItem {
  id: string;
  target: string;
  current: number;
  projected: number;
  timeframe: string;
  category: string;
}

const AIInsights = () => {
  const { currentUser } = useAuth();
  const [growthScore, setGrowthScore] = useState(0);
  const [weakAreas, setWeakAreas] = useState<string[]>([]);
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [forecasts, setForecasts] = useState<ForecastItem[]>([]);

  // Get data from Firestore
  const { data: academicRecords, loading: loadingAcademic } = useAcademicRecords(currentUser?.uid);
  const { data: sportsRecords, loading: loadingSports } = useSportsRecords(currentUser?.uid);
  const { data: extraRecords, loading: loadingExtra } = useExtracurricularRecords(currentUser?.uid);
  const { data: goals, loading: loadingGoals } = useGoals(currentUser?.uid);
  const { data: milestones, loading: loadingMilestones } = useMilestones(currentUser?.uid);
  const { data: journalEntries, loading: loadingJournal } = useJournalEntries(currentUser?.uid);

  // Load and transform data
  useEffect(() => {
    // Transform action plans data to match component requirements
    const transformedActionPlans = actionPlansData.map((plan: any) => ({
      id: plan.id,
      shortterm: plan.shortTerm,
      mediumterm: plan.mediumTerm,
      longterm: plan.longTerm
    }));
    setActionPlans(transformedActionPlans);

    // Set suggestions and forecasts
    setSuggestions(suggestionsData);
    setForecasts(forecastsData);

    // Calculate growth score and weak areas when data is available
    const isAllDataLoaded = !loadingAcademic && !loadingSports && !loadingExtra && 
                          !loadingGoals && !loadingMilestones && !loadingJournal;
    
    if (isAllDataLoaded) {
      const score = calculateGrowthScore(
        academicRecords,
        sportsRecords,
        extraRecords,
        goals,
        milestones,
        journalEntries
      );
      setGrowthScore(score);

      const weakPoints = identifyWeakAreas(
        academicRecords,
        sportsRecords,
        extraRecords
      );
      setWeakAreas(weakPoints);
    }
  }, [
    academicRecords, sportsRecords, extraRecords, goals, milestones, journalEntries,
    loadingAcademic, loadingSports, loadingExtra, loadingGoals, loadingMilestones, loadingJournal
  ]);

  return (
    <AppLayout title="AI Insights">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* New Quiz Insights Card */}
        <AIInsightsQuizCard />

        <DashboardCard 
          title={
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <span>Growth Insights</span>
            </div>
          }
          gradient
        >
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border">
              <h3 className="font-medium text-sm text-muted-foreground mb-1">Growth Score</h3>
              <div className="flex items-center gap-2">
                <div className="text-3xl font-bold">{growthScore}</div>
                <div className="text-sm text-muted-foreground">/ 100</div>
              </div>
              <div className="mt-2 h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    growthScore > 80 
                      ? 'bg-green-500' 
                      : growthScore > 60 
                        ? 'bg-blue-500' 
                        : growthScore > 40 
                          ? 'bg-yellow-500' 
                          : 'bg-red-500'
                  }`} 
                  style={{ width: `${growthScore}%` }}
                ></div>
              </div>
              <p className="text-xs mt-2 text-muted-foreground">
                Based on academics, sports, extracurricular activities and personal development
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border">
              <h3 className="font-medium text-sm text-muted-foreground mb-1">Areas of Excellence</h3>
              <ul className="space-y-1">
                {growthScore >= 70 && (
                  <li className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>Overall consistent performance</span>
                  </li>
                )}
                {academicRecords.length >= 5 && (
                  <li className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>Regular academic tracking</span>
                  </li>
                )}
                {sportsRecords.length >= 3 && (
                  <li className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>Active sports participation</span>
                  </li>
                )}
                {extraRecords.length >= 3 && (
                  <li className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>Diverse extracurricular activities</span>
                  </li>
                )}
                {journalEntries.length >= 5 && (
                  <li className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>Consistent journaling habit</span>
                  </li>
                )}
              </ul>
            </div>
            
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border">
              <h3 className="font-medium text-sm text-muted-foreground mb-1">Areas for Improvement</h3>
              {weakAreas.length > 0 ? (
                <ul className="space-y-1">
                  {weakAreas.slice(0, 3).map((area, index) => (
                    <li key={index} className="text-sm flex gap-1 items-center">
                      <LineChart className="h-4 w-4 text-blue-500" />
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm">No specific areas of concern identified.</p>
              )}
            </div>
          </div>
          
          <Tabs defaultValue="action-plans">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="action-plans">Action Plans</TabsTrigger>
              <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
              <TabsTrigger value="growth-forecasts">Growth Forecasts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="action-plans" className="space-y-4">
              {actionPlans.map((plan) => (
                <ActionPlanTabs key={plan.id} {...plan} />
              ))}
            </TabsContent>
            
            <TabsContent value="suggestions">
              <SuggestionsSection suggestions={suggestions} />
            </TabsContent>
            
            <TabsContent value="growth-forecasts">
              <GrowthForecastSection forecasts={forecasts} />
            </TabsContent>
          </Tabs>
        </DashboardCard>
      </div>
    </AppLayout>
  );
};

// Action Plan Tabs Component
const ActionPlanTabs = (props: ActionPlan) => {
  return (
    <Tabs defaultValue="shortterm" className="bg-white dark:bg-gray-900 border rounded-lg p-4">
      <div className="mb-4">
        <h3 className="font-medium">Personalized Action Plan</h3>
        <p className="text-sm text-muted-foreground">Follow these steps to improve performance</p>
      </div>
      <TabsList className="grid grid-cols-3 mb-4">
        <TabsTrigger value="shortterm">Short Term</TabsTrigger>
        <TabsTrigger value="mediumterm">Medium Term</TabsTrigger>
        <TabsTrigger value="longterm">Long Term</TabsTrigger>
      </TabsList>
      
      <TabsContent value="shortterm">
        <ul className="space-y-2">
          {props.shortterm.map((item, index) => (
            <li key={index} className="flex gap-2 text-sm">
              <span className="text-green-500">•</span>
              {item}
            </li>
          ))}
        </ul>
      </TabsContent>
      
      <TabsContent value="mediumterm">
        <ul className="space-y-2">
          {props.mediumterm.map((item, index) => (
            <li key={index} className="flex gap-2 text-sm">
              <span className="text-blue-500">•</span>
              {item}
            </li>
          ))}
        </ul>
      </TabsContent>
      
      <TabsContent value="longterm">
        <ul className="space-y-2">
          {props.longterm.map((item, index) => (
            <li key={index} className="flex gap-2 text-sm">
              <span className="text-purple-500">•</span>
              {item}
            </li>
          ))}
        </ul>
      </TabsContent>
    </Tabs>
  );
};

// Suggestions Section Component
const SuggestionsSection = ({ suggestions }: { suggestions: SuggestionItem[] }) => {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {suggestions.map((suggestion) => (
        <div key={suggestion.id} className="bg-white dark:bg-gray-900 border rounded-lg p-4">
          <div className="mb-2">
            <div className="text-xs font-medium text-muted-foreground">{suggestion.category}</div>
            <h4 className="font-medium">{suggestion.title}</h4>
          </div>
          <p className="text-sm">{suggestion.text}</p>
        </div>
      ))}
    </div>
  );
};

// Growth Forecast Section Component
const GrowthForecastSection = ({ forecasts }: { forecasts: ForecastItem[] }) => {
  return (
    <div className="space-y-4">
      {forecasts.map((forecast) => (
        <div key={forecast.id} className="bg-white dark:bg-gray-900 border rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <div className="text-xs font-medium text-muted-foreground">{forecast.category}</div>
              <h4 className="font-medium">{forecast.target}</h4>
            </div>
            <div className="text-xs text-muted-foreground">{forecast.timeframe}</div>
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            <div className="text-sm">Current:</div>
            <div className="font-medium">{forecast.current}%</div>
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <div className="text-sm">Projected:</div>
            <div className="font-medium">{forecast.projected}%</div>
          </div>
          
          <div className="relative pt-1">
            <div className="flex items-center justify-between">
              <div className="text-xs text-left">0%</div>
              <div className="text-xs text-right">100%</div>
            </div>
            <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full">
              <div className="h-full bg-gray-400 dark:bg-gray-600 rounded-full" style={{ width: `${forecast.current}%` }}></div>
            </div>
            <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full mt-1">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${forecast.projected}%` }}></div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">Current</div>
              <div className="text-xs text-blue-500">Projected</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AIInsights;
