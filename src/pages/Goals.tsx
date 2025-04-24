
import { useState, useEffect } from "react";
import { collection, query, where, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Award, Edit, Trash2, Plus, Calendar, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Goal {
  id?: string;
  title: string;
  description: string;
  category: string;
  targetDate: string;
  completed: boolean;
  userId: string;
  achievementNotes?: string;
  createdAt: Date;
}

const categories = [
  { name: "Academic", color: "bg-blue-500" },
  { name: "Sports", color: "bg-green-500" },
  { name: "Skill Development", color: "bg-purple-500" },
  { name: "Personal Growth", color: "bg-amber-500" },
  { name: "Arts & Creativity", color: "bg-pink-500" },
];

const GoalsPage = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<Partial<Goal>>({
    title: "",
    description: "",
    category: "Academic",
    targetDate: new Date().toISOString().split("T")[0],
    completed: false,
    achievementNotes: ""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const goalsRef = collection(db, "goals");
      const q = query(
        goalsRef,
        where("userId", "==", user.uid),
        orderBy("targetDate", "asc")
      );

      const querySnapshot = await getDocs(q);
      const goalsData: Goal[] = [];
      querySnapshot.forEach((doc) => {
        goalsData.push({
          id: doc.id,
          ...doc.data() as Goal
        });
      });

      setGoals(goalsData);
    } catch (error) {
      console.error("Error fetching goals:", error);
      toast({
        title: "Error",
        description: "Failed to load goals data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, completed: checked }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const user = auth.currentUser;
      if (!user) return;

      const goalData = {
        ...formData,
        userId: user.uid,
        createdAt: new Date()
      } as Goal;
      
      if (isEditing && currentId) {
        await updateDoc(doc(db, "goals", currentId), goalData);
        toast({
          title: "Goal updated",
          description: "Your goal has been successfully updated",
        });
      } else {
        await addDoc(collection(db, "goals"), goalData);
        toast({
          title: "Goal added",
          description: "Your goal has been successfully added",
        });
      }
      
      resetForm();
      fetchGoals();
      setOpenDialog(false);
    } catch (error) {
      console.error("Error saving goal:", error);
      toast({
        title: "Error",
        description: "Failed to save goal",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (goal: Goal) => {
    setIsEditing(true);
    setCurrentId(goal.id);
    setFormData({
      title: goal.title,
      description: goal.description,
      category: goal.category,
      targetDate: goal.targetDate,
      completed: goal.completed,
      achievementNotes: goal.achievementNotes || ""
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    
    try {
      await deleteDoc(doc(db, "goals", id));
      toast({
        title: "Goal deleted",
        description: "The goal has been successfully deleted",
      });
      fetchGoals();
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast({
        title: "Error",
        description: "Failed to delete goal",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "Academic",
      targetDate: new Date().toISOString().split("T")[0],
      completed: false,
      achievementNotes: ""
    });
    setIsEditing(false);
    setCurrentId(null);
  };

  const getCategoryColor = (category: string) => {
    const found = categories.find(cat => cat.name === category);
    return found ? found.color : "bg-gray-500";
  };

  const filteredGoals = goals.filter((goal) => {
    const categoryMatch = filterCategory === "all" || goal.category === filterCategory;
    const statusMatch = filterStatus === "all" || 
      (filterStatus === "completed" && goal.completed) || 
      (filterStatus === "pending" && !goal.completed);
    return categoryMatch && statusMatch;
  });

  const getStatusIcon = (completed: boolean) => {
    return completed ? (
      <CheckCircle2 className="h-5 w-5 text-green-500" />
    ) : (
      <AlertCircle className="h-5 w-5 text-amber-500" />
    );
  };

  if (loading) {
    return (
      <AppLayout title="Goals & Vision">
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Goals & Vision">
      <div className="space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <h1 className="text-2xl font-bold">Goals & Vision</h1>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                resetForm();
                setOpenDialog(true);
              }}>
                <Plus className="mr-2 h-4 w-4" /> Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{isEditing ? "Edit Goal" : "Add New Goal"}</DialogTitle>
                <DialogDescription>
                  Set and track personal and academic goals.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">Goal Title</label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title || ""}
                    onChange={handleInputChange}
                    placeholder="e.g., Learn to swim"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description || ""}
                    onChange={handleInputChange}
                    placeholder="Details about this goal"
                    className="w-full p-2 rounded border min-h-[80px]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="targetDate" className="text-sm font-medium">Target Date</label>
                    <Input
                      type="date"
                      id="targetDate"
                      name="targetDate"
                      value={formData.targetDate || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-medium">Category</label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleSelectChange("category", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.name} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="completed"
                    checked={formData.completed}
                    onCheckedChange={handleSwitchChange}
                  />
                  <Label htmlFor="completed">Completed</Label>
                </div>

                {formData.completed && (
                  <div className="space-y-2">
                    <label htmlFor="achievementNotes" className="text-sm font-medium">Achievement Notes</label>
                    <textarea
                      id="achievementNotes"
                      name="achievementNotes"
                      value={formData.achievementNotes || ""}
                      onChange={handleInputChange}
                      placeholder="Describe how you achieved this goal"
                      className="w-full p-2 rounded border min-h-[80px]"
                    />
                  </div>
                )}

                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => {
                    resetForm();
                    setOpenDialog(false);
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {isEditing ? "Update" : "Save"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filter Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.name} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {goals.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-10 gap-4">
              <Award className="h-16 w-16 text-muted-foreground" />
              <div className="text-center">
                <h3 className="text-lg font-medium">No goals set yet</h3>
                <p className="text-muted-foreground">Start setting goals to track your growth and achievements</p>
              </div>
              <Button onClick={() => setOpenDialog(true)}>
                <Plus className="mr-2 h-4 w-4" /> Set Your First Goal
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGoals.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-10 gap-4">
                  <div className="text-center">
                    <h3 className="text-lg font-medium">No matching goals</h3>
                    <p className="text-muted-foreground">Try changing your filters</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredGoals.map((goal) => (
                <Card key={goal.id} className={`${goal.completed ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-amber-500'}`}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex gap-2 items-center">
                          <Badge className={`${getCategoryColor(goal.category)} text-white`}>
                            {goal.category}
                          </Badge>
                          {getStatusIcon(goal.completed)}
                        </div>
                        <CardTitle className="text-xl mt-1">{goal.title}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          Target: {new Date(goal.targetDate).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEdit(goal)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(goal.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{goal.description}</p>
                    
                    {goal.completed && goal.achievementNotes && (
                      <>
                        <Separator className="my-2" />
                        <div>
                          <span className="font-medium text-sm">Achievement Notes:</span>
                          <p className="text-sm text-muted-foreground">{goal.achievementNotes}</p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default GoalsPage;
