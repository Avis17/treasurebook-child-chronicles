import { useState, useEffect } from "react";
import { collection, query, where, getDocs, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Milestone, CalendarCheck, Trash2, Edit, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface MilestoneItem {
  id?: string;
  title: string;
  description: string;
  date: string;
  category: string;
  userId: string;
  [key: string]: any; // Add index signature for Firebase compatibility
}

const categories = [
  { name: "Academic", color: "bg-blue-500" },
  { name: "Sports", color: "bg-green-500" },
  { name: "Extracurricular", color: "bg-purple-500" },
  { name: "Award", color: "bg-yellow-500" },
  { name: "Personal", color: "bg-pink-500" },
];

const Milestones = () => {
  const [milestones, setMilestones] = useState<MilestoneItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<Partial<MilestoneItem>>({
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    category: "Academic"
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMilestones();
  }, []);

  const fetchMilestones = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const milestonesRef = collection(db, "milestones");
      const q = query(
        milestonesRef,
        where("userId", "==", user.uid)
      );

      const querySnapshot = await getDocs(q);
      const milestonesData: MilestoneItem[] = [];
      querySnapshot.forEach((doc) => {
        milestonesData.push({
          id: doc.id,
          ...doc.data() as MilestoneItem
        });
      });
      
      milestonesData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setMilestones(milestonesData);
    } catch (error) {
      console.error("Error fetching milestones:", error);
      toast({
        title: "Error",
        description: "Failed to load milestones data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const user = auth.currentUser;
      if (!user) return;

      const milestoneData = {
        ...formData,
        userId: user.uid
      } as MilestoneItem;
      
      if (isEditing && currentId) {
        const { id, ...updateData } = milestoneData;
        await updateDoc(doc(db, "milestones", currentId), updateData);
        toast({
          title: "Milestone updated",
          description: "Your milestone has been successfully updated",
        });
      } else {
        await addDoc(collection(db, "milestones"), milestoneData);
        toast({
          title: "Milestone added",
          description: "Your milestone has been successfully added",
        });
      }
      
      resetForm();
      fetchMilestones();
      setOpenDialog(false);
    } catch (error) {
      console.error("Error saving milestone:", error);
      toast({
        title: "Error",
        description: "Failed to save milestone",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (milestone: MilestoneItem) => {
    setIsEditing(true);
    setCurrentId(milestone.id);
    setFormData({
      title: milestone.title,
      description: milestone.description,
      date: milestone.date,
      category: milestone.category
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    
    try {
      await deleteDoc(doc(db, "milestones", id));
      toast({
        title: "Milestone deleted",
        description: "The milestone has been successfully deleted",
      });
      fetchMilestones();
    } catch (error) {
      console.error("Error deleting milestone:", error);
      toast({
        title: "Error",
        description: "Failed to delete milestone",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      category: "Academic"
    });
    setIsEditing(false);
    setCurrentId(null);
  };

  const getCategoryColor = (category: string) => {
    const found = categories.find(cat => cat.name === category);
    return found ? found.color : "bg-gray-500";
  };

  if (loading) {
    return (
      <AppLayout title="Milestones">
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Milestones" hideHeader={true}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Timeline of Important Events</h1>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                resetForm();
                setOpenDialog(true);
              }}>
                <Plus className="mr-2 h-4 w-4" /> Add Milestone
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] dark:bg-gray-900">
              <DialogHeader>
                <DialogTitle>{isEditing ? "Edit Milestone" : "Add New Milestone"}</DialogTitle>
                <DialogDescription>
                  Record important events and achievements in your journey.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">Title</label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title || ""}
                    onChange={handleInputChange}
                    placeholder="e.g., Won Science Competition"
                    required
                    className="dark:bg-gray-800 dark:text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description || ""}
                    onChange={handleInputChange}
                    placeholder="Details about this milestone"
                    className="w-full p-2 rounded border dark:bg-gray-800 dark:text-white dark:border-gray-700"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="date" className="text-sm font-medium">Date</label>
                    <Input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date || ""}
                      onChange={handleInputChange}
                      max={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-medium">Category</label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category || "Academic"}
                      onChange={handleInputChange}
                      className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white"
                      required
                    >
                      {categories.map((category) => (
                        <option key={category.name} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

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

        {milestones.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-10 gap-4">
              <Milestone className="h-16 w-16 text-muted-foreground" />
              <div className="text-center">
                <h3 className="text-lg font-medium">No milestones yet</h3>
                <p className="text-muted-foreground">Start recording your important moments and achievements</p>
              </div>
              <Button onClick={() => setOpenDialog(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Your First Milestone
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="relative border-l-2 border-muted-foreground/20 pl-6 space-y-10 ml-4">
            {milestones.map((milestone) => (
              <div key={milestone.id} className="relative">
                <div className="absolute -left-10 w-4 h-4 rounded-full bg-primary"></div>
                <div className="absolute -left-[39px] w-6 h-6 rounded-full border-2 border-background bg-background flex items-center justify-center">
                  <span className="relative w-4 h-4 rounded-full bg-primary"></span>
                </div>
                
                <Card className="relative">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex gap-2 items-center">
                          <CardTitle className="text-xl">{milestone.title}</CardTitle>
                          <Badge className={`${getCategoryColor(milestone.category)} text-white`}>
                            {milestone.category}
                          </Badge>
                        </div>
                        <CardDescription>
                          <CalendarCheck className="h-4 w-4 inline mr-1" />
                          {milestone.date && format(new Date(milestone.date), "MMMM d, yyyy")}
                        </CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEdit(milestone)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(milestone.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{milestone.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Milestones;
