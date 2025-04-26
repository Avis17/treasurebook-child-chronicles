
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

interface SummaryTabsProps {
  isLoading: boolean;
  weakAreas: string[];
}

export function SummaryTabs({ isLoading, weakAreas }: SummaryTabsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-56" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="academic">
        <TabsList className="grid w-full grid-cols-4 md:w-fit">
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="sports">Sports</TabsTrigger>
          <TabsTrigger value="extra">Extracurricular</TabsTrigger>
          <TabsTrigger value="emotional">Emotional</TabsTrigger>
        </TabsList>
        
        <TabsContent value="academic">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-2">Performance Overview</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Math</span>
                      <span className="font-medium">85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Science</span>
                      <span className="font-medium">76%</span>
                    </div>
                    <Progress value={76} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>English</span>
                      <span className="font-medium">91%</span>
                    </div>
                    <Progress value={91} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-2">Areas for Improvement</h3>
                <div className="space-y-3">
                  {weakAreas.length > 0 ? (
                    weakAreas
                      .filter(area => ["Math", "Science", "English", "History", "Geography"].some(
                        subject => area.toLowerCase().includes(subject.toLowerCase())
                      ))
                      .slice(0, 3)
                      .map((area, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="h-2 w-2 rounded-full bg-amber-500 mt-2"></div>
                          <p className="text-sm">{area}</p>
                        </div>
                      ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No specific areas for improvement identified.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="sports">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-2">Performance Overview</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Swimming</span>
                      <span className="font-medium">Good</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Soccer</span>
                      <span className="font-medium">Excellent</span>
                    </div>
                    <Progress value={90} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-2">Areas for Improvement</h3>
                <div className="space-y-3">
                  {weakAreas.length > 0 ? (
                    weakAreas
                      .filter(area => ["Soccer", "Basketball", "Swimming", "Tennis", "Sports"].some(
                        sport => area.toLowerCase().includes(sport.toLowerCase())
                      ))
                      .slice(0, 3)
                      .map((area, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="h-2 w-2 rounded-full bg-amber-500 mt-2"></div>
                          <p className="text-sm">{area}</p>
                        </div>
                      ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No specific areas for improvement identified.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="extra">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-2">Activity Overview</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Music</span>
                      <span className="font-medium">Regular</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Art</span>
                      <span className="font-medium">Occasional</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-2">Areas for Exploration</h3>
                <div className="space-y-3">
                  {weakAreas.length > 0 ? (
                    weakAreas
                      .filter(area => ["Music", "Art", "Drama", "Dance", "Creative"].some(
                        activity => area.toLowerCase().includes(activity.toLowerCase())
                      ))
                      .slice(0, 3)
                      .map((area, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="h-2 w-2 rounded-full bg-amber-500 mt-2"></div>
                          <p className="text-sm">{area}</p>
                        </div>
                      ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No specific areas for improvement identified.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="emotional">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-2">Emotional Well-being</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Overall Mood</span>
                      <span className="font-medium">Positive</span>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Engagement</span>
                      <span className="font-medium">Strong</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-2">Recommendations</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 mt-2"></div>
                    <p className="text-sm">Continue journaling to track emotional patterns.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 mt-2"></div>
                    <p className="text-sm">Practice mindfulness for 5-10 minutes daily.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 mt-2"></div>
                    <p className="text-sm">Maintain balance between activities and downtime.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
