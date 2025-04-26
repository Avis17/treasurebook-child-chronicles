
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail, deleteUser } from "firebase/auth";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/providers/ThemeProvider";

interface GradingSystem {
  name: string;
  type: 'percentage' | 'points';
  grades: {
    name: string;
    minValue: number;
    color: string;
  }[];
}

const defaultGradingSystems: GradingSystem[] = [
  {
    name: 'Percentage',
    type: 'percentage',
    grades: [
      { name: 'A+', minValue: 90, color: 'green' },
      { name: 'A', minValue: 80, color: 'green' },
      { name: 'B+', minValue: 70, color: 'blue' },
      { name: 'B', minValue: 60, color: 'blue' },
      { name: 'C+', minValue: 50, color: 'amber' },
      { name: 'C', minValue: 40, color: 'amber' },
      { name: 'D', minValue: 33, color: 'red' },
      { name: 'F', minValue: 0, color: 'red' },
    ]
  },
  {
    name: 'GPA (4.0)',
    type: 'points',
    grades: [
      { name: 'A', minValue: 3.7, color: 'green' },
      { name: 'B+', minValue: 3.3, color: 'green' },
      { name: 'B', minValue: 3.0, color: 'blue' },
      { name: 'C+', minValue: 2.3, color: 'blue' },
      { name: 'C', minValue: 2.0, color: 'amber' },
      { name: 'D', minValue: 1.0, color: 'amber' },
      { name: 'F', minValue: 0.0, color: 'red' },
    ]
  },
  {
    name: 'CBSE',
    type: 'points',
    grades: [
      { name: 'A1', minValue: 91, color: 'green' },
      { name: 'A2', minValue: 81, color: 'green' },
      { name: 'B1', minValue: 71, color: 'blue' },
      { name: 'B2', minValue: 61, color: 'blue' },
      { name: 'C1', minValue: 51, color: 'amber' },
      { name: 'C2', minValue: 41, color: 'amber' },
      { name: 'D', minValue: 33, color: 'red' },
      { name: 'E', minValue: 0, color: 'red' },
    ]
  }
];

const Settings = () => {
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [progressReports, setProgressReports] = useState(true);
  const [activityUpdates, setActivityUpdates] = useState(true);
  const [resetLoading, setResetLoading] = useState(false);
  const [gradingSystems, setGradingSystems] = useState<GradingSystem[]>([]);
  const [selectedGradingSystem, setSelectedGradingSystem] = useState<string>('Percentage');
  const [settingsChanged, setSettingsChanged] = useState(false);

  // Load grading systems from localStorage on component mount
  useEffect(() => {
    const savedGradingSystems = localStorage.getItem('gradingSystems');
    if (savedGradingSystems) {
      setGradingSystems(JSON.parse(savedGradingSystems));
    } else {
      setGradingSystems(defaultGradingSystems);
      localStorage.setItem('gradingSystems', JSON.stringify(defaultGradingSystems));
    }
    
    const savedSelectedSystem = localStorage.getItem('selectedGradingSystem');
    if (savedSelectedSystem) {
      setSelectedGradingSystem(savedSelectedSystem);
    }
  }, []);

  const handlePasswordReset = async () => {
    if (!auth.currentUser?.email) return;
    
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, auth.currentUser.email);
      toast({
        title: "Password reset email sent",
        description: "Check your email to reset your password",
      });
    } catch (error) {
      console.error("Error sending password reset:", error);
      toast({
        title: "Error",
        description: "Failed to send password reset email",
        variant: "destructive",
      });
    } finally {
      setResetLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      if (auth.currentUser) {
        await deleteUser(auth.currentUser);
        toast({
          title: "Account deleted",
          description: "Your account has been successfully deleted",
        });
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: "Error",
        description: "Failed to delete account. You may need to log in again.",
        variant: "destructive",
      });
    }
  };

  const handleGradingSystemChange = (value: string) => {
    setSelectedGradingSystem(value);
    setSettingsChanged(true);
  };

  const saveSettings = () => {
    // Save selected grading system
    localStorage.setItem('selectedGradingSystem', selectedGradingSystem);
    
    // Save notification preferences in a real app
    // For now just show a toast
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated",
    });
    
    setSettingsChanged(false);
  };

  return (
    <AppLayout title="Settings">
      <div className="space-y-6">
        <Tabs defaultValue="general">
          <TabsList className="grid w-full grid-cols-3 dark:bg-gray-800">
            <TabsTrigger value="general" className="dark:data-[state=active]:bg-gray-700">General</TabsTrigger>
            <TabsTrigger value="academic" className="dark:data-[state=active]:bg-gray-700">Academic</TabsTrigger>
            <TabsTrigger value="security" className="dark:data-[state=active]:bg-gray-700">Security</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="mt-6 space-y-6">
            <Card className="dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="dark:text-white">Appearance</CardTitle>
                <CardDescription className="dark:text-gray-300">Customize how TreasureBook looks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="theme-mode" className="dark:text-white">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">
                      Switch between light and dark themes
                    </p>
                  </div>
                  <Switch
                    id="theme-mode"
                    checked={theme === "dark"}
                    onCheckedChange={toggleTheme}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="dark:text-white">Notifications</CardTitle>
                <CardDescription className="dark:text-gray-300">Manage how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications" className="dark:text-white">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={(checked) => {
                      setEmailNotifications(checked);
                      setSettingsChanged(true);
                    }}
                  />
                </div>
                
                <Separator className="dark:bg-gray-700" />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="progress-reports" className="dark:text-white">Progress Reports</Label>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">
                      Receive weekly progress reports
                    </p>
                  </div>
                  <Switch
                    id="progress-reports"
                    checked={progressReports}
                    onCheckedChange={(checked) => {
                      setProgressReports(checked);
                      setSettingsChanged(true);
                    }}
                  />
                </div>
                
                <Separator className="dark:bg-gray-700" />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="activity-updates" className="dark:text-white">Activity Updates</Label>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">
                      Receive updates about new activities
                    </p>
                  </div>
                  <Switch
                    id="activity-updates"
                    checked={activityUpdates}
                    onCheckedChange={(checked) => {
                      setActivityUpdates(checked);
                      setSettingsChanged(true);
                    }}
                  />
                </div>
              </CardContent>
              {settingsChanged && (
                <CardFooter>
                  <Button onClick={saveSettings}>
                    Save Preferences
                  </Button>
                </CardFooter>
              )}
            </Card>
          </TabsContent>
          
          <TabsContent value="academic" className="mt-6 space-y-6">
            <Card className="dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="dark:text-white">Grading System</CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Configure how academic performance is measured
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="grading-system" className="dark:text-white">
                    Select Grading System
                  </Label>
                  <Select value={selectedGradingSystem} onValueChange={handleGradingSystemChange}>
                    <SelectTrigger className="dark:bg-gray-700 dark:text-white">
                      <SelectValue placeholder="Select grading system" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-700">
                      {gradingSystems.map(system => (
                        <SelectItem key={system.name} value={system.name}>
                          {system.name} ({system.type === 'percentage' ? 'Percentage' : 'Points'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Separator className="dark:bg-gray-700" />
                
                <div className="space-y-2">
                  <h3 className="font-medium text-base dark:text-white">Grades</h3>
                  <div className="rounded-md border dark:border-gray-700">
                    <Table>
                      <TableHeader>
                        <TableRow className="dark:bg-gray-900 dark:hover:bg-gray-800">
                          <TableHead className="dark:text-gray-300 w-1/4">Grade</TableHead>
                          <TableHead className="dark:text-gray-300">{
                            gradingSystems.find(s => s.name === selectedGradingSystem)?.type === 'percentage' 
                              ? 'Min. Percentage' 
                              : 'Min. Points'
                          }</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {gradingSystems.find(s => s.name === selectedGradingSystem)?.grades.map(grade => (
                          <TableRow key={grade.name} className="dark:hover:bg-gray-800/50">
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium
                                ${grade.color === 'green' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300' 
                                  : grade.color === 'blue'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                  : grade.color === 'amber'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                                }`}
                              >
                                {grade.name}
                              </span>
                            </TableCell>
                            <TableCell className="dark:text-white">{grade.minValue}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
              {settingsChanged && (
                <CardFooter>
                  <Button onClick={saveSettings}>
                    Save Grading System
                  </Button>
                </CardFooter>
              )}
            </Card>
          </TabsContent>
          
          <TabsContent value="security" className="mt-6 space-y-6">
            <Card className="dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="dark:text-white">Security</CardTitle>
                <CardDescription className="dark:text-gray-300">Manage your account security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="dark:text-white">Password</Label><br />
                  <Button 
                    variant="outline" 
                    onClick={handlePasswordReset}
                    disabled={resetLoading}
                    className="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                  >
                    {resetLoading ? "Sending..." : "Reset Password"}
                  </Button>
                </div>
                
                <Separator className="dark:bg-gray-700" />
                
                <div className="space-y-2">
                  <Label className="dark:text-white">Account</Label><br />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Delete Account</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="dark:bg-gray-800">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="dark:text-white">Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription className="dark:text-gray-300">
                          This action cannot be undone. This will permanently delete your
                          account and all associated data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="dark:bg-gray-700 dark:text-white">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAccount}>
                          Delete Account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

// Import the Table components for showing grading systems
const Table = ({ children }: { children: React.ReactNode }) => (
  <table className="w-full caption-bottom text-sm">
    {children}
  </table>
);

const TableHeader = ({ children }: { children: React.ReactNode }) => (
  <thead>{children}</thead>
);

const TableBody = ({ children }: { children: React.ReactNode }) => (
  <tbody>{children}</tbody>
);

const TableRow = ({ className, children }: { className?: string, children: React.ReactNode }) => (
  <tr className={className}>{children}</tr>
);

const TableHead = ({ className, children }: { className?: string, children: React.ReactNode }) => (
  <th className={`h-10 px-4 text-left align-middle font-medium ${className}`}>{children}</th>
);

const TableCell = ({ className, children }: { className?: string, children: React.ReactNode }) => (
  <td className={`p-4 align-middle ${className}`}>{children}</td>
);

export default Settings;
