
import AppLayout from "@/components/layout/AppLayout";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  GraduationCap, 
  Trophy, 
  Award, 
  Target, 
  BookOpen, 
  CalendarDays,
  Trash, 
  ImageIcon, 
  FileArchive, 
  Lightbulb, 
  HelpCircle,
  BrainCircuit, 
  MessageSquare,
  Mic,
  User
} from "lucide-react";

const Help = () => {
  return (
    <AppLayout title="Help Center">
      <div className="max-w-6xl mx-auto space-y-6">
        <DashboardCard 
          title="TreasureBook Help Guide" 
          className="border-blue-100 dark:border-blue-900"
        >
          <Tabs defaultValue="dashboard">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-6">
              <TabsTrigger value="dashboard">Getting Started</TabsTrigger>
              <TabsTrigger value="academic">Academic Tools</TabsTrigger>
              <TabsTrigger value="development">Development</TabsTrigger>
              <TabsTrigger value="other">Other Features</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard" className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Welcome to TreasureBook</h2>
                <p className="text-muted-foreground">
                  TreasureBook is your comprehensive digital portfolio for tracking your child's growth and achievements across academics, sports, extracurricular activities, and personal growth.
                </p>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-gray-500" />
                    <h3 className="font-medium">Getting Started</h3>
                  </div>
                  <ul className="mt-2 space-y-2 text-sm list-disc list-inside">
                    <li>Complete your profile in the Profile section</li>
                    <li>Set up your initial goals for your child</li>
                    <li>Add academic records in the Academic Records section</li>
                    <li>Explore the dashboard for a complete overview</li>
                  </ul>
                </div>
                
                <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-blue-500" />
                    <h3 className="font-medium">Dashboard & Calendar</h3>
                  </div>
                  <ul className="mt-2 space-y-2 text-sm list-disc list-inside">
                    <li>View all upcoming events in the Calendar</li>
                    <li>Track important dates and deadlines</li>
                    <li>Get a quick overview of all activities</li>
                    <li>Monitor progress across all areas</li>
                  </ul>
                </div>
                
                <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5 text-purple-500" />
                    <h3 className="font-medium">Quiz Master</h3>
                  </div>
                  <ul className="mt-2 space-y-2 text-sm list-disc list-inside">
                    <li>Practice knowledge with interactive quizzes</li>
                    <li>Track quiz performance over time</li>
                    <li>Learn new concepts with immediate feedback</li>
                    <li>Earn badges based on quiz completion</li>
                  </ul>
                </div>
                
                <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    <h3 className="font-medium">Rewards & Badges</h3>
                  </div>
                  <ul className="mt-2 space-y-2 text-sm list-disc list-inside">
                    <li>Earn badges across different categories</li>
                    <li>Bronze, Silver and Gold levels for each category</li>
                    <li>Track progress towards your next badge</li>
                    <li>Celebrate achievements with unlocking animations</li>
                  </ul>
                </div>
                
                <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <Mic className="h-5 w-5 text-red-500" />
                    <h3 className="font-medium">Voice Practice</h3>
                  </div>
                  <ul className="mt-2 space-y-2 text-sm list-disc list-inside">
                    <li>Practice speaking with guided prompts</li>
                    <li>Record and review speaking exercises</li>
                    <li>Improve communication skills</li>
                    <li>Save recordings for future reference</li>
                  </ul>
                </div>
                
                <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    <h3 className="font-medium">AI Insights</h3>
                  </div>
                  <ul className="mt-2 space-y-2 text-sm list-disc list-inside">
                    <li>Get personalized recommendations</li>
                    <li>View growth forecasts and predictions</li>
                    <li>Receive action plans for improvement</li>
                    <li>Track development metrics over time</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="academic" className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Academic Tools</h2>
                <p className="text-muted-foreground">
                  TreasureBook provides comprehensive tools to track academic progress, milestones, and areas for improvement.
                </p>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <Graduation className="h-5 w-5 text-blue-500" />
                    <h3 className="font-medium">Academic Records</h3>
                  </div>
                  <ul className="mt-2 space-y-2 text-sm list-disc list-inside">
                    <li>Add exam scores and grades</li>
                    <li>Track progress by subject</li>
                    <li>Monitor term-by-term improvement</li>
                    <li>Compare performance across subjects</li>
                  </ul>
                </div>
                
                <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5 text-purple-500" />
                    <h3 className="font-medium">Quiz Practice</h3>
                  </div>
                  <ul className="mt-2 space-y-2 text-sm list-disc list-inside">
                    <li>Take subject-specific quizzes</li>
                    <li>Review incorrect answers with explanations</li>
                    <li>Track mastery of different subjects</li>
                    <li>Practice regularly to improve knowledge</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="development" className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Development & Growth</h2>
                <p className="text-muted-foreground">
                  Track and encourage personal growth and development through achievements, goals, and milestones.
                </p>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-500" />
                    <h3 className="font-medium">Goals</h3>
                  </div>
                  <ul className="mt-2 space-y-2 text-sm list-disc list-inside">
                    <li>Set achievable goals with deadlines</li>
                    <li>Track progress toward completion</li>
                    <li>Break down goals into manageable steps</li>
                    <li>Celebrate completed goals</li>
                  </ul>
                </div>
                
                <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    <h3 className="font-medium">Achievements & Badges</h3>
                  </div>
                  <ul className="mt-2 space-y-2 text-sm list-disc list-inside">
                    <li>Earn badges across different categories</li>
                    <li>Track your progress to the next badge level</li>
                    <li>Bronze, Silver, and Gold levels for each category</li>
                    <li>Visual progress indicators for motivation</li>
                  </ul>
                </div>
                
                <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-red-500" />
                    <h3 className="font-medium">Journal</h3>
                  </div>
                  <ul className="mt-2 space-y-2 text-sm list-disc list-inside">
                    <li>Record daily or weekly reflections</li>
                    <li>Track mood and emotional growth</li>
                    <li>Build writing and reflection habits</li>
                    <li>Review past entries to see growth</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <Trash className="h-5 w-5 text-orange-500" />
                    <h3 className="font-medium">Milestones</h3>
                  </div>
                  <ul className="mt-2 space-y-2 text-sm list-disc list-inside">
                    <li>Record important life events</li>
                    <li>Create a timeline of achievements</li>
                    <li>Never forget significant moments</li>
                    <li>Categorize milestones for organization</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="other" className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Other Features</h2>
                <p className="text-muted-foreground">
                  TreasureBook offers additional tools to capture memories, store documents, and manage resources.
                </p>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-pink-500" />
                    <h3 className="font-medium">Gallery</h3>
                  </div>
                  <ul className="mt-2 space-y-2 text-sm list-disc list-inside">
                    <li>Upload and organize photos</li>
                    <li>Create albums by category or date</li>
                    <li>Preserve visual memories</li>
                    <li>Share moments with family members</li>
                  </ul>
                </div>
                
                <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <FileArchive className="h-5 w-5 text-blue-500" />
                    <h3 className="font-medium">Documents</h3>
                  </div>
                  <ul className="mt-2 space-y-2 text-sm list-disc list-inside">
                    <li>Store important documents securely</li>
                    <li>Organize certificates and awards</li>
                    <li>Keep track of official records</li>
                    <li>Access documents from anywhere</li>
                  </ul>
                </div>
                
                <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-green-500" />
                    <h3 className="font-medium">Feedback</h3>
                  </div>
                  <ul className="mt-2 space-y-2 text-sm list-disc list-inside">
                    <li>Record teacher and mentor feedback</li>
                    <li>Keep track of areas for improvement</li>
                    <li>Organize feedback by category or source</li>
                    <li>Review feedback over time to track growth</li>
                  </ul>
                </div>
                
                <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-purple-500" />
                    <h3 className="font-medium">Help & Support</h3>
                  </div>
                  <ul className="mt-2 space-y-2 text-sm list-disc list-inside">
                    <li>Access this help center anytime</li>
                    <li>Email support@treasurebook.com for assistance</li>
                    <li>Explore tutorials and guides</li>
                    <li>View frequently asked questions</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DashboardCard>
        
        <DashboardCard title="Frequently Asked Questions" className="border-amber-100 dark:border-amber-900">
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-medium text-lg">How do I add a new academic record?</h3>
              <p className="text-muted-foreground">
                Navigate to the Academic Records section through the sidebar. Click on the "Add Record" button, 
                fill in the details about the subject, score, grade, and other relevant information, then save.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium text-lg">How do I earn badges?</h3>
              <p className="text-muted-foreground">
                Badges are automatically awarded as you use TreasureBook. Complete quizzes, add journal entries, 
                participate in sports and extracurricular activities, and complete goals to earn Bronze, Silver, and Gold 
                badges in each category. Your progress is tracked automatically.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium text-lg">Can I export my child's data?</h3>
              <p className="text-muted-foreground">
                Yes, you can export data from TreasureBook. Visit the Backup & Export section from the sidebar, 
                choose what data you want to export, and click the Export button to download it in various formats including PDF and Excel.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium text-lg">How do I use the Quiz feature?</h3>
              <p className="text-muted-foreground">
                Navigate to the Quiz Master section from the sidebar. Browse available quiz categories, select a quiz to attempt, 
                answer the questions, and submit to see your results. Your quiz history and scores are tracked automatically,
                and you can earn badges based on the number of quizzes you complete.
              </p>
            </div>
          </div>
        </DashboardCard>
        
        <DashboardCard title="Contact Support">
          <div className="text-center py-4">
            <p>Need additional help? Contact our support team:</p>
            <a href="mailto:support@treasurebook.com" className="text-blue-500 hover:underline">
              support@treasurebook.com
            </a>
          </div>
        </DashboardCard>
      </div>
    </AppLayout>
  );
};

export default Help;
