
import { useState, useEffect } from "react";
import { collection, query, where, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc, limit } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { BookText, Edit, Trash2, Plus, Calendar, Search, Tag, Filter } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface JournalEntry {
  id?: string;
  title: string;
  content: string;
  date: string;
  tags: string[];
  mood?: string;
  userId: string;
  createdAt: Date;
}

const moods = [
  { name: "Happy", emoji: "😀" },
  { name: "Excited", emoji: "🤩" },
  { name: "Calm", emoji: "😌" },
  { name: "Tired", emoji: "😴" },
  { name: "Sad", emoji: "😔" },
  { name: "Confused", emoji: "😕" },
  { name: "Determined", emoji: "😤" },
];

const JournalPage = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<Partial<JournalEntry>>({
    title: "",
    content: "",
    date: new Date().toISOString().split("T")[0],
    tags: [],
    mood: "Happy"
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const { toast } = useToast();

  useEffect(() => {
    fetchJournalEntries();
  }, [selectedPeriod]);

  const fetchJournalEntries = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const entriesRef = collection(db, "journal");
      
      let q;
      const now = new Date();
      let startDate;
      
      if (selectedPeriod === "week") {
        startDate = new Date();
        startDate.setDate(now.getDate() - 7);
      } else if (selectedPeriod === "month") {
        startDate = new Date();
        startDate.setMonth(now.getMonth() - 1);
      } else if (selectedPeriod === "year") {
        startDate = new Date();
        startDate.setFullYear(now.getFullYear() - 1);
      } else {
        // All time
        q = query(
          entriesRef,
          where("userId", "==", user.uid),
          orderBy("date", "desc")
        );
      }
      
      if (selectedPeriod !== "all") {
        q = query(
          entriesRef,
          where("userId", "==", user.uid),
          where("date", ">=", startDate.toISOString().split("T")[0]),
          orderBy("date", "desc")
        );
      }

      const querySnapshot = await getDocs(q);
      const entriesData: JournalEntry[] = [];
      querySnapshot.forEach((doc) => {
        entriesData.push({
          id: doc.id,
          ...doc.data() as JournalEntry
        });
      });

      setEntries(entriesData);
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      toast({
        title: "Error",
        description: "Failed to load journal entries",
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

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((t) => t !== tag) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const user = auth.currentUser;
      if (!user) return;

      const entryData = {
        ...formData,
        userId: user.uid,
        createdAt: new Date()
      } as JournalEntry;
      
      if (isEditing && currentId) {
        await updateDoc(doc(db, "journal", currentId), entryData);
        toast({
          title: "Journal entry updated",
          description: "Your journal entry has been successfully updated",
        });
      } else {
        await addDoc(collection(db, "journal"), entryData);
        toast({
          title: "Journal entry added",
          description: "Your journal entry has been successfully added",
        });
      }
      
      resetForm();
      fetchJournalEntries();
      setOpenDialog(false);
    } catch (error) {
      console.error("Error saving journal entry:", error);
      toast({
        title: "Error",
        description: "Failed to save journal entry",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (entry: JournalEntry) => {
    setIsEditing(true);
    setCurrentId(entry.id);
    setFormData({
      title: entry.title,
      content: entry.content,
      date: entry.date,
      tags: entry.tags,
      mood: entry.mood
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    
    try {
      await deleteDoc(doc(db, "journal", id));
      toast({
        title: "Journal entry deleted",
        description: "The journal entry has been successfully deleted",
      });
      fetchJournalEntries();
    } catch (error) {
      console.error("Error deleting journal entry:", error);
      toast({
        title: "Error",
        description: "Failed to delete journal entry",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      date: new Date().toISOString().split("T")[0],
      tags: [],
      mood: "Happy"
    });
    setIsEditing(false);
    setCurrentId(null);
  };

  const getMoodEmoji = (mood: string | undefined) => {
    const foundMood = moods.find(m => m.name === mood);
    return foundMood ? foundMood.emoji : "😐";
  };

  const filteredEntries = entries.filter(entry =>
    entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <AppLayout title="Daily Journal">
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Daily Journal">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <h1 className="text-2xl font-bold">Daily Journal</h1>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                resetForm();
                setOpenDialog(true);
              }}>
                <Plus className="mr-2 h-4 w-4" /> Add Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{isEditing ? "Edit Journal Entry" : "Add New Journal Entry"}</DialogTitle>
                <DialogDescription>
                  Record your thoughts, progress, and reflections.
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
                    placeholder="e.g., My Science Project Progress"
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
                    <label htmlFor="mood" className="text-sm font-medium">Mood</label>
                    <select
                      id="mood"
                      name="mood"
                      value={formData.mood || "Happy"}
                      onChange={handleInputChange}
                      className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white"
                    >
                      {moods.map((mood) => (
                        <option key={mood.name} value={mood.name}>
                          {mood.emoji} {mood.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="content" className="text-sm font-medium">Journal Entry</label>
                  <textarea
                    id="content"
                    name="content"
                    value={formData.content || ""}
                    onChange={handleInputChange}
                    placeholder="Write your journal entry here..."
                    className="w-full p-2 rounded border min-h-[150px]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags?.map((tag) => (
                      <Badge key={tag} variant="secondary" className="px-2 py-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-xs"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add a tag"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" onClick={addTag} variant="outline">
                      Add
                    </Button>
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

        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search journal entries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div>
                <Tabs defaultValue="week" value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <TabsList className="grid grid-cols-4 w-full">
                    <TabsTrigger value="week">Week</TabsTrigger>
                    <TabsTrigger value="month">Month</TabsTrigger>
                    <TabsTrigger value="year">Year</TabsTrigger>
                    <TabsTrigger value="all">All</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardContent>
        </Card>

        {entries.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-10 gap-4">
              <BookText className="h-16 w-16 text-muted-foreground" />
              <div className="text-center">
                <h3 className="text-lg font-medium">No journal entries yet</h3>
                <p className="text-muted-foreground">Start documenting your journey and daily progress</p>
              </div>
              <Button onClick={() => setOpenDialog(true)}>
                <Plus className="mr-2 h-4 w-4" /> Write Your First Entry
              </Button>
            </CardContent>
          </Card>
        ) : filteredEntries.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-10 gap-4">
              <div className="text-center">
                <h3 className="text-lg font-medium">No matching entries</h3>
                <p className="text-muted-foreground">Try changing your search term or time filter</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredEntries.map((entry) => (
              <Card key={entry.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-xl">{entry.title}</CardTitle>
                        <span className="text-xl" title={entry.mood}>{getMoodEmoji(entry.mood)}</span>
                      </div>
                      <CardDescription className="flex items-center">
                        <Calendar className="h-4 w-4 inline mr-1" />
                        {entry.date && format(new Date(entry.date), "EEEE, MMMM d, yyyy")}
                      </CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEdit(entry)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(entry.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{entry.content}</p>
                  
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      {entry.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="px-2 py-0.5">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default JournalPage;
