
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, Clock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { addGoalFromActionPlan } from "@/services/ai-insights-service";
import { useAuth } from "@/contexts/AuthContext";

interface ActionPlan {
  shortterm: string[];
  mediumterm: string[];
  longterm: string[];
}

interface ActionPlanTabsProps {
  actionPlans: ActionPlan;
  isLoading: boolean;
}

export function ActionPlanTabs({ actionPlans, isLoading }: ActionPlanTabsProps) {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  
  const handleAddGoal = async (text: string, timeframe: string) => {
    if (!currentUser?.uid) {
      toast({
        title: "Authentication required",
        description: "Please login to add goals",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await addGoalFromActionPlan(
        currentUser.uid,
        `${timeframe} Goal: ${text.substring(0, 30)}...`, 
        text,
        timeframe.toLowerCase()
      );
      
      toast({
        title: "Goal added",
        description: "The action plan has been added to your goals",
        variant: "default"
      });
    } catch (error) {
      console.error("Error adding goal:", error);
      toast({
        title: "Error adding goal",
        description: "There was a problem adding this goal. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-56" />
        <div className="grid gap-4">
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="short">
        <TabsList className="grid w-full grid-cols-3 md:w-fit">
          <TabsTrigger value="short">Short-term</TabsTrigger>
          <TabsTrigger value="medium">Medium-term</TabsTrigger>
          <TabsTrigger value="long">Long-term</TabsTrigger>
        </TabsList>
        
        <TabsContent value="short">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium mb-4">Short-term Action Plan (1-4 weeks)</h3>
              <div className="space-y-4">
                {actionPlans.shortterm.map((plan, index) => (
                  <div key={index} className="flex justify-between items-start border-b pb-3 last:border-0">
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                      <p className="text-sm">{plan}</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="shrink-0 ml-2"
                      onClick={() => handleAddGoal(plan, "Short-term")}
                    >
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Add Goal
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="medium">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium mb-4">Medium-term Action Plan (1-3 months)</h3>
              <div className="space-y-4">
                {actionPlans.mediumterm.map((plan, index) => (
                  <div key={index} className="flex justify-between items-start border-b pb-3 last:border-0">
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-indigo-500 mt-0.5" />
                      <p className="text-sm">{plan}</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="shrink-0 ml-2"
                      onClick={() => handleAddGoal(plan, "Medium-term")}
                    >
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Add Goal
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="long">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium mb-4">Long-term Action Plan (3+ months)</h3>
              <div className="space-y-4">
                {actionPlans.longterm.map((plan, index) => (
                  <div key={index} className="flex justify-between items-start border-b pb-3 last:border-0">
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-purple-500 mt-0.5" />
                      <p className="text-sm">{plan}</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="shrink-0 ml-2"
                      onClick={() => handleAddGoal(plan, "Long-term")}
                    >
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Add Goal
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
