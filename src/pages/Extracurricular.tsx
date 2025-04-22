
import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ExtracurricularChart from "@/components/dashboard/ExtracurricularChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/shared/DataTable";
import { collection, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Activity {
  id: string;
  name: string;
  category: string;
  hours: number;
  date: string;
  achievements: string;
  description: string;
}

const activityCategories = [
  "Arts & Music",
  "Academic Clubs",
  "Community Service",
  "Leadership",
  "Technology",
  "Language & Culture",
  "Environmental",
  "Debate & Public Speaking",
  "Media & Journalism",
  "Other"
];

const mockActivities: Activity[] = [
  {
    id: "ec1",
    name: "School Band",
    category: "Arts & Music",
    hours: 45,
    date: "2025-03-15",
    achievements: "First Chair, Performed at Regional Concert",
    description: "Weekly practice and performances in the school concert band."
  },
  {
    id: "ec2",
    name: "Debate Club",
    category: "Debate & Public Speaking",
    hours: 32,
    date: "2025-02-10",
    achievements: "Second Place in Regional Tournament",
    description: "Participating in debate competitions and weekly practice sessions."
  },
  {
    id: "ec3",
    name: "Community Clean-up",
    category: "Community Service",
    hours: 18,
    date: "2025-01-22",
    achievements: "Recognition from Mayor's Office",
    description: "Organizing and participating in monthly community clean-up events."
  }
];

const Extracurricular = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentActivityId, setCurrentActivityId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newActivity, setNewActivity] = useState({
    name: "",
    category: "",
    hours: 0,
    date: new Date().toISOString().split('T')[0],
    achievements: "",
    description: ""
  });

  // In a real app, this would fetch from Firebase
  const { data: activities = mockActivities, refetch } = useQuery({
    queryKey: ["extracurricularActivities"],
    queryFn: async () => {
      // This would be replaced with actual Firebase query
      return mockActivities;
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewActivity((prev) => ({ 
      ...prev, 
      [name]: name === "hours" ? Number(value) : value 
    }));
  };

  const handleSelectChange = (value: string) => {
    setNewActivity((prev) => ({ ...prev, category: value }));
  };

  const resetForm = () => {
    setNewActivity({
      name: "",
      category: "",
      hours: 0,
      date: new Date().toISOString().split('T')[0],
      achievements: "",
      description: ""
    });
    setIsEditing(false);
    setCurrentActivityId(null);
  };

  const handleEdit = (activity: Activity) => {
    setIsEditing(true);
    setCurrentActivityId(activity.id);
    setNewActivity({
      name: activity.name,
      category: activity.category,
      hours: activity.hours,
      date: activity.date,
      achievements: activity.achievements,
      description: activity.description
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (activity: Activity) => {
    // This would delete from Firebase in a real app
    toast({
      title: "Activity Deleted",
      description: "The extracurricular activity has been deleted successfully."
    });
    // await refetch();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // This would add/update activity in Firebase in a real app
      toast({
        title: isEditing ? "Activity Updated" : "Activity Added",
        description: `The extracurricular activity has been ${isEditing ? "updated" : "added"} successfully.`
      });
      
      resetForm();
      setIsDialogOpen(false);
      // await refetch();
    } catch (error) {
      console.error("Error saving extracurricular activity:", error);
      toast({
        title: "Error",
        description: "Failed to save extracurricular activity",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      header: "Activity",
      accessor: "name" as keyof Activity,
      sortable: true,
    },
    {
      header: "Category",
      accessor: "category" as keyof Activity,
      render: (activity: Activity) => (
        <div className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs inline-block">
          {activity.category}
        </div>
      ),
      sortable: true,
    },
    {
      header: "Hours",
      accessor: "hours" as keyof Activity,
      sortable: true,
    },
    {
      header: "Date",
      accessor: "date" as keyof Activity,
      sortable: true,
    },
    {
      header: "Achievements",
      accessor: "achievements" as keyof Activity,
      render: (activity: Activity) => (
        <div className="truncate max-w-xs">{activity.achievements}</div>
      ),
    },
    {
      header: "Description",
      accessor: "description" as keyof Activity,
      render: (activity: Activity) => (
        <div className="truncate max-w-xs">{activity.description}</div>
      ),
    },
  ];

  return (
    <AppLayout title="Extracurricular Activities">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Extracurricular Activities</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                Add Activity
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {isEditing ? "Edit Activity" : "Add Extracurricular Activity"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Activity Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={newActivity.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newActivity.category}
                    onValueChange={handleSelectChange}
                  >
                    <SelectTrigger id="category" className="w-full">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {activityCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hours">Hours</Label>
                    <Input
                      id="hours"
                      name="hours"
                      type="number"
                      value={newActivity.hours}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={newActivity.date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="achievements">Achievements</Label>
                  <Input
                    id="achievements"
                    name="achievements"
                    value={newActivity.achievements}
                    onChange={handleInputChange}
                    placeholder="Awards, recognitions, etc."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={newActivity.description}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Describe the activity and your role"
                    required
                  />
                </div>
                
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting 
                      ? (isEditing ? "Updating..." : "Adding...") 
                      : (isEditing ? "Update Activity" : "Add Activity")}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="chart">
          <TabsList>
            <TabsTrigger value="chart">Activity Analytics</TabsTrigger>
            <TabsTrigger value="activities">Activities List</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chart" className="mt-6">
            <ExtracurricularChart />
          </TabsContent>
          
          <TabsContent value="activities" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Activities</CardTitle>
                <CardDescription>
                  Track all your extracurricular activities and achievements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={activities}
                  columns={columns}
                  searchable
                  searchFields={["name", "category", "achievements", "description"]}
                  itemsPerPage={5}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  deleteDialogProps={{
                    title: "Delete Activity",
                    description: "Are you sure you want to delete this activity? This action cannot be undone."
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Extracurricular;
