
import { useState, useEffect } from "react";
import { collection, query, where, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { MessageSquare, Edit, Trash2, Plus, Search, User } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FeedbackNote {
  id?: string;
  title: string;
  content: string;
  date: string;
  type: "teacher" | "parent" | "self";
  author: string;
  userId: string;
  createdAt: Date;
}

const FeedbackPage = () => {
  const [notes, setNotes] = useState<FeedbackNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<Partial<FeedbackNote>>({
    title: "",
    content: "",
    date: new Date().toISOString().split("T")[0],
    type: "teacher",
    author: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const notesRef = collection(db, "feedback");
      const q = query(
        notesRef,
        where("userId", "==", user.uid),
        orderBy("date", "desc")
      );

      const querySnapshot = await getDocs(q);
      const notesData: FeedbackNote[] = [];
      querySnapshot.forEach((doc) => {
        notesData.push({
          id: doc.id,
          ...doc.data() as FeedbackNote
        });
      });

      setNotes(notesData);
    } catch (error) {
      console.error("Error fetching feedback notes:", error);
      toast({
        title: "Error",
        description: "Failed to load feedback notes",
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
        await updateDoc(doc(db, "feedback", currentId), noteData);
        toast({
          title: "Note updated",
          description: "Your feedback note has been successfully updated",
        });
      } else {
        await addDoc(collection(db, "feedback"), noteData);
        toast({
          title: "Note added",
          description: "Your feedback note has been successfully added",
        });
      }
      
      resetForm();
      fetchNotes();
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
      type: note.type,
      author: note.author
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    
    try {
      await deleteDoc(doc(db, "feedback", id));
      toast({
        title: "Note deleted",
        description: "The feedback note has been successfully deleted",
      });
      fetchNotes();
    } catch (error) {
      console.error("Error deleting feedback note:", error);
      toast({
        title: "Error",
        description: "Failed to delete feedback note",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      date: new Date().toISOString().split("T")[0],
      type: "teacher",
      author: "",
    });
    setIsEditing(false);
    setCurrentId(null);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "teacher":
        return "bg-blue-500 text-white";
      case "parent":
        return "bg-green-500 text-white";
      case "self":
        return "bg-purple-500 text-white";
      default:
        return "bg-gray-500";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "teacher":
        return "Teacher";
      case "parent":
        return "Parent";
      case "self":
        return "Self-reflection";
      default:
        return type;
    }
  };

  const getAvatarFallback = (author: string) => {
    return author ? author.charAt(0).toUpperCase() : "?";
  };

  const filteredNotes = notes.filter((note) => {
    const typeMatch = selectedType === "all" || note.type === selectedType;
    const searchMatch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       note.author.toLowerCase().includes(searchTerm.toLowerCase());
    return typeMatch && searchMatch;
  });

  if (loading) {
    return (
      <AppLayout title="Feedback Notes">
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Feedback Notes">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <h1 className="text-2xl font-bold">Feedback Notes</h1>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                resetForm();
                setOpenDialog(true);
              }}>
                <Plus className="mr-2 h-4 w-4" /> Add Feedback
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{isEditing ? "Edit Feedback Note" : "Add New Feedback Note"}</DialogTitle>
                <DialogDescription>
                  Track teacher feedback, parent comments, or self-reflection notes.
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
                    placeholder="e.g., Math Term Review"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <label htmlFor="type" className="text-sm font-medium">Feedback Type</label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: "teacher" | "parent" | "self") => handleSelectChange("type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="teacher">Teacher</SelectItem>
                        <SelectItem value="parent">Parent</SelectItem>
                        <SelectItem value="self">Self-reflection</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="author" className="text-sm font-medium">Author Name</label>
                  <Input
                    id="author"
                    name="author"
                    value={formData.author || ""}
                    onChange={handleInputChange}
                    placeholder="Who provided this feedback?"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="content" className="text-sm font-medium">Feedback Content</label>
                  <textarea
                    id="content"
                    name="content"
                    value={formData.content || ""}
                    onChange={handleInputChange}
                    placeholder="Write the feedback here..."
                    className="w-full p-2 rounded border min-h-[150px]"
                    required
                  />
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

        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search feedback notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="self">Self-reflection</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {notes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-10 gap-4">
              <MessageSquare className="h-16 w-16 text-muted-foreground" />
              <div className="text-center">
                <h3 className="text-lg font-medium">No feedback notes yet</h3>
                <p className="text-muted-foreground">Add teacher feedback, parent comments, or self-reflection notes</p>
              </div>
              <Button onClick={() => setOpenDialog(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Your First Feedback
              </Button>
            </CardContent>
          </Card>
        ) : filteredNotes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-10 gap-4">
              <div className="text-center">
                <h3 className="text-lg font-medium">No matching feedback notes</h3>
                <p className="text-muted-foreground">Try changing your search or type filter</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredNotes.map((note) => (
              <Card key={note.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex space-x-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{getAvatarFallback(note.author)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-xl">{note.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getTypeColor(note.type)}>
                            {getTypeLabel(note.type)}
                          </Badge>
                          <CardDescription>
                            {note.date && format(new Date(note.date), "MMMM d, yyyy")}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEdit(note)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(note.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{note.content}</p>
                </CardContent>
                <CardFooter>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="h-4 w-4 mr-1" />
                    {note.author}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default FeedbackPage;
