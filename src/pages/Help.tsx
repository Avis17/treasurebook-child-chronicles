
import React from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, HelpCircle, LifeBuoy, Mail, MessageSquare, User, BrainCircuit, Target } from "lucide-react";
import { QuizSection } from "@/components/help/QuizSection";

const Help = () => {
  return (
    <AppLayout title="Help Center">
      <div className="container py-6">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold tracking-tight">
              TreasureBook Help Center
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Find answers to common questions and learn how to make the most of your TreasureBook account
            </p>
          </div>

          <Tabs defaultValue="guides" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="guides">Guides</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
              <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
              <TabsTrigger value="goals">Goals</TabsTrigger>
              <TabsTrigger value="contact">Contact Support</TabsTrigger>
            </TabsList>
            
            <TabsContent value="guides">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader className="space-y-1">
                    <CardTitle>Getting Started</CardTitle>
                    <CardDescription>
                      Learn the basics of using TreasureBook
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">GUIDE</Badge>
                        <h3 className="font-medium">Setting up your profile</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Learn how to complete your child's profile with all necessary information.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">GUIDE</Badge>
                        <h3 className="font-medium">Navigating the dashboard</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Understand the main dashboard and how to access all features.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">GUIDE</Badge>
                        <h3 className="font-medium">Adding your first records</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        How to add academic records, sports achievements, and other milestones.
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">View All Guides</Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="space-y-1">
                    <CardTitle>Features Overview</CardTitle>
                    <CardDescription>
                      Explore the features available in TreasureBook
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">FEATURE</Badge>
                        <h3 className="font-medium">Academic Records</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Track academic progress, grades, and performance over time.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">FEATURE</Badge>
                        <h3 className="font-medium">Sports & Extracurricular</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Record sports achievements and extracurricular activities.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">FEATURE</Badge>
                        <h3 className="font-medium">AI Insights</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Get AI-powered recommendations and insights based on your child's data.
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">Explore Features</Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="faq">
              <Card>
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                  <CardDescription>
                    Common questions about using TreasureBook
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="font-medium flex items-center gap-2">
                      <HelpCircle className="h-4 w-4" />
                      How secure is my child's data?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      TreasureBook takes data security seriously. All data is encrypted and stored securely. We never share your child's information with third parties without your explicit consent.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium flex items-center gap-2">
                      <HelpCircle className="h-4 w-4" />
                      Can I export my child's data?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Yes, you can export all data in various formats including PDF and Excel. Go to Settings &gt; Backup &amp; Export to access this feature.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium flex items-center gap-2">
                      <HelpCircle className="h-4 w-4" />
                      How do I add multiple children to my account?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Currently, TreasureBook supports one child profile per account. We're working on adding support for multiple children in a future update.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium flex items-center gap-2">
                      <HelpCircle className="h-4 w-4" />
                      What devices can I use TreasureBook on?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      TreasureBook is a web application that works on all modern browsers including Chrome, Firefox, Safari, and Edge. You can access it from desktop computers, laptops, tablets, and smartphones.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium flex items-center gap-2">
                      <HelpCircle className="h-4 w-4" />
                      Is there a mobile app?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Currently, TreasureBook is available as a web application optimized for mobile browsers. A dedicated mobile app is planned for future release.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="quizzes">
              <QuizSection />
            </TabsContent>
            
            <TabsContent value="goals">
              <section className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold tracking-tight">Goal Setting</h2>
                  <p className="text-muted-foreground">
                    Learn how to set and track goals for your child's development
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-rose-100 p-2 dark:bg-rose-900">
                          <Target className="h-4 w-4 text-rose-700 dark:text-rose-400" />
                        </div>
                        <CardTitle className="text-lg">Creating Effective Goals</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Effective goals are specific, measurable, achievable, relevant, and time-bound (SMART).
                      </p>
                      <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-2">
                        <li><strong>Specific:</strong> Clearly define what you want to achieve</li>
                        <li><strong>Measurable:</strong> Include metrics to track progress</li>
                        <li><strong>Achievable:</strong> Set realistic and attainable goals</li>
                        <li><strong>Relevant:</strong> Ensure goals align with broader objectives</li>
                        <li><strong>Time-bound:</strong> Set deadlines for accountability</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                          <Target className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                        </div>
                        <CardTitle className="text-lg">Goal Categories</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        TreasureBook supports different types of goals to track various aspects of your child's development:
                      </p>
                      <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-2">
                        <li><strong>Academic Goals:</strong> Improve grades, complete projects, learn new skills</li>
                        <li><strong>Sports Goals:</strong> Master techniques, achieve personal bests, join teams</li>
                        <li><strong>Social Skills:</strong> Make new friends, participate in group activities</li>
                        <li><strong>Personal Development:</strong> Learn time management, develop confidence</li>
                        <li><strong>Extracurricular:</strong> Learn instruments, art skills, or other hobbies</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-green-100 p-2 dark:bg-green-900">
                          <Target className="h-4 w-4 text-green-700 dark:text-green-400" />
                        </div>
                        <CardTitle className="text-lg">Tracking Progress</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        TreasureBook provides tools to monitor your child's progress toward goals:
                      </p>
                      <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-2">
                        <li>Update goal statuses (Not Started, In Progress, Completed)</li>
                        <li>Add notes and milestones to track incremental progress</li>
                        <li>Set reminders for goal-related activities or deadlines</li>
                        <li>View progress charts to see improvement over time</li>
                        <li>Celebrate achievements with virtual badges and rewards</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-900">
                          <Target className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                        </div>
                        <CardTitle className="text-lg">Tips for Success</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Strategies to help your child achieve their goals:
                      </p>
                      <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-2">
                        <li>Break down large goals into smaller, manageable steps</li>
                        <li>Review goals regularly and adjust as needed</li>
                        <li>Celebrate progress, not just final achievements</li>
                        <li>Involve your child in the goal-setting process</li>
                        <li>Connect goals to your child's interests and strengths</li>
                        <li>Use visual trackers to maintain motivation</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </section>
            </TabsContent>
            
            <TabsContent value="contact">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Support</CardTitle>
                  <CardDescription>
                    Get in touch with our support team for assistance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    <div className="flex items-start gap-4">
                      <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                        <MessageSquare className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-medium">Live Chat</h3>
                        <p className="text-sm text-muted-foreground">
                          Chat with our support team directly from the app. Available Monday-Friday, 9am-5pm EST.
                        </p>
                        <Button variant="outline" size="sm" className="mt-2">
                          Start Chat
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                        <Mail className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-medium">Email Support</h3>
                        <p className="text-sm text-muted-foreground">
                          Email our support team for non-urgent issues. We typically respond within 1 business day.
                        </p>
                        <p className="text-sm font-medium mt-2">
                          support@treasurebook.example.com
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                        <LifeBuoy className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-medium">Knowledge Base</h3>
                        <p className="text-sm text-muted-foreground">
                          Browse our comprehensive knowledge base for tutorials, guides, and troubleshooting tips.
                        </p>
                        <Button variant="outline" size="sm" className="mt-2">
                          Visit Knowledge Base
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
};

export default Help;
