
import { useState, useEffect } from "react";
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { MessageSquare, Edit, Trash2, Plus, Search, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FeedbackTable } from "@/components/feedback/FeedbackTable";

interface FeedbackNote {
  id?: string;
  title: string;
  content: string;
  date: string;
  category: string;
  author: string;
  userId: string;
  createdAt: Date;
  [key: string]: any; // Add index signature for Firebase compatibility
}

const FeedbackTablePage = () => {
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<Partial<FeedbackNote>>({
    title: "",
    content: "",
    date: new Date().toISOString().split("T")[0],
    category: "Teacher",
    author: ""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const user = auth.currentUser;
      if (!user) return;

      const noteData = {
        ...formData,
        userId: user.uid,
        createdAt: new Date()
      } as FeedbackNote;
      
      if (isEditing && currentId) {
        // Create a copy without id before updating
        const { id, ...updateData } = noteData;
        await updateDoc(doc(db, "feedback", currentId), updateData);
        toast({
          title: "Feedback note updated",
          description: "Your feedback note has been successfully updated",
        });
      } else {
        await addDoc(collection(db, "feedback"), noteData);
        toast({
          title: "Feedback note added",
          description: "Your feedback note has been successfully added",
        });
      }
      
      resetForm();
      setOpenDialog(false);
    } catch (error) {
      console.error("Error saving feedback note:", error);
      toast({
        title: "Error",
        description: "Failed to save feedback note",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (note: FeedbackNote) => {
    setIsEditing(true);
    setCurrentId(note.id);
    setFormData({
      title: note.title,
      content: note.content,
      date: note.date,
      category: note.category,
      author: note.author
    });
    setOpenDialog(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      date: new Date().toISOString().split("T")[0],
      category: "Teacher",
      author: ""
    });
    setIsEditing(false);
    setCurrentId(null);
  };

  const refreshData = () => {
    // This will trigger the useEffect in FeedbackTable component
    setLoading(true);
    setTimeout(() => setLoading(false), 100);
  };

  if (loading) {
    return (
      <AppLayout title="Feedback Records" hideHeader={true}>
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Feedback Records" hideHeader={true}>
      <div className="space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <h1 className="text-2xl font-bold">Feedback Records</h1>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                resetForm();
                setOpenDialog(true);
              }}>
                <Plus className="mr-2 h-4 w-4" /> Add Feedback
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px]">
              <DialogHeader>
                <DialogTitle>{isEditing ? "Edit Feedback" : "Add New Feedback"}</DialogTitle>
                <DialogDescription>
                  Record feedback and notes from teachers, mentors, or personal reflections.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <label htmlFor="title" className="text-sm font-medium">Title</label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title || ""}
                      onChange={handleInputChange}
                      placeholder="e.g., Feedback on Presentation Skills"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <label htmlFor="content" className="text-sm font-medium">Content</label>
                    <textarea
                      id="content"
                      name="content"
                      value={formData.content || ""}
                      onChange={handleInputChange}
                      placeholder="Details about this feedback"
                      className="w-full p-2 rounded border min-h-[120px] dark:bg-gray-900 dark:border-gray-700"
                      required
                    />
                  </div>
  
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
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleSelectChange("category", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Teacher">Teacher</SelectItem>
                        <SelectItem value="Mentor">Mentor</SelectItem>
                        <SelectItem value="Self">Self</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
  
                  <div className="space-y-2 md:col-span-2">
                    <label htmlFor="author" className="text-sm font-medium">Author</label>
                    <Input
                      id="author"
                      name="author"
                      value={formData.author || ""}
                      onChange={handleInputChange}
                      placeholder="Name of the person providing feedback"
                      required
                    />
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Search</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search feedback..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Filter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Teacher">Teacher</SelectItem>
                    <SelectItem value="Mentor">Mentor</SelectItem>
                    <SelectItem value="Self">Self</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Feedback Records</CardTitle>
            <CardDescription>
              View, edit and manage your feedback records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FeedbackTable 
              onEdit={handleEdit} 
              onRefresh={refreshData} 
              filterCategory={filterCategory}
              searchTerm={searchTerm}
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default FeedbackTablePage;
