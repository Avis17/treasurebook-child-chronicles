
import { useState, useEffect } from "react";
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import AppLayout from "@/components/layout/AppLayout";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { format, isSameDay, parseISO, startOfToday, isFuture } from "date-fns";
import { Calendar as CalendarIcon, Plus, Edit, Trash2, CalendarDays } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ActionColumn } from "@/components/shared/ActionColumn";

interface CalendarEvent {
  id?: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  category: string;
  time?: string;
  location?: string;
  userId: string;
  createdAt?: any;
  updatedAt?: any;
}

const eventCategories = [
  { value: "exam", label: "Exam", color: "bg-red-500" },
  { value: "sports", label: "Sports", color: "bg-orange-500" },
  { value: "academic", label: "Academic", color: "bg-blue-500" },
  { value: "personal", label: "Personal", color: "bg-purple-500" },
  { value: "extracurricular", label: "Extracurricular", color: "bg-green-500" },
  { value: "holiday", label: "Holiday", color: "bg-yellow-500" },
  { value: "other", label: "Other", color: "bg-gray-500" },
];

const CalendarPage = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [openDialog, setOpenDialog] = useState(false);
  const [eventsForDate, setEventsForDate] = useState<CalendarEvent[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [formData, setFormData] = useState<Partial<CalendarEvent>>({
    title: "",
    description: "",
    date: format(new Date(), "yyyy-MM-dd"),
    category: "exam",
    time: "",
    location: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedDate && events.length > 0) {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const filtered = events.filter(event => event.date === dateStr);
      setEventsForDate(filtered);
    } else {
      setEventsForDate([]);
    }
  }, [selectedDate, events]);

  useEffect(() => {
    if (events.length > 0) {
      const today = startOfToday();
      const upcoming = events
        .filter(event => {
          const eventDate = parseISO(event.date);
          return isFuture(eventDate) || isSameDay(eventDate, today);
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5); // Get only next 5 events
      
      setUpcomingEvents(upcoming);
    } else {
      setUpcomingEvents([]);
    }
  }, [events]);

  const fetchEvents = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const eventsRef = collection(db, "calendarEvents");
      const q = query(eventsRef, where("userId", "==", user.uid));
      
      const querySnapshot = await getDocs(q);
      const eventsData: CalendarEvent[] = [];
      
      querySnapshot.forEach((doc) => {
        eventsData.push({ id: doc.id, ...doc.data() } as CalendarEvent);
      });
      
      setEvents(eventsData);
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      toast({
        title: "Error",
        description: "Failed to load calendar events",
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

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setFormData((prev) => ({ ...prev, date: format(date, "yyyy-MM-dd") }));
    }
  };

  const handleAddEvent = () => {
    setIsEditing(false);
    setCurrentId(null);
    if (selectedDate) {
      setFormData({
        title: "",
        description: "",
        date: format(selectedDate, "yyyy-MM-dd"),
        category: "exam",
        time: "",
        location: "",
      });
    }
    setOpenDialog(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setIsEditing(true);
    setCurrentId(event.id);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      category: event.category,
      time: event.time || "",
      location: event.location || "",
    });
    setOpenDialog(true);
  };

  const handleDeleteEvent = async (event: CalendarEvent) => {
    try {
      if (!event.id) return;
      
      await deleteDoc(doc(db, "calendarEvents", event.id));
      
      setEvents(events.filter(e => e.id !== event.id));
      
      toast({
        title: "Event deleted",
        description: "The event has been successfully deleted",
      });
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const user = auth.currentUser;
      if (!user) return;

      const eventData = {
        ...formData,
        userId: user.uid,
        updatedAt: serverTimestamp(),
      } as CalendarEvent;
      
      if (isEditing && currentId) {
        const { id, createdAt, ...updateData } = eventData;
        await updateDoc(doc(db, "calendarEvents", currentId), updateData);
        
        setEvents(events.map(event => 
          event.id === currentId ? { ...event, ...eventData, id: currentId } : event
        ));
        
        toast({
          title: "Event updated",
          description: "The event has been successfully updated",
        });
      } else {
        eventData.createdAt = serverTimestamp();
        const docRef = await addDoc(collection(db, "calendarEvents"), eventData);
        
        setEvents([...events, { ...eventData, id: docRef.id }]);
        
        toast({
          title: "Event added",
          description: "The event has been successfully added",
        });
      }
      
      setOpenDialog(false);
      setFormData({
        title: "",
        description: "",
        date: format(selectedDate || new Date(), "yyyy-MM-dd"),
        category: "exam",
        time: "",
        location: "",
      });
    } catch (error) {
      console.error("Error saving event:", error);
      toast({
        title: "Error",
        description: "Failed to save event",
        variant: "destructive",
      });
    }
  };

  const getCategoryColor = (category: string) => {
    const foundCategory = eventCategories.find(cat => cat.value === category);
    return foundCategory ? foundCategory.color : "bg-gray-500";
  };

  const getCategoryLabel = (category: string) => {
    const foundCategory = eventCategories.find(cat => cat.value === category);
    return foundCategory ? foundCategory.label : category;
  };

  // Function to find events for a specific date
  const getDayEvents = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return events.filter(event => event.date === dateStr);
  };

  if (loading) {
    return (
      <AppLayout title="Calendar" hideHeader={true}>
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Calendar" hideHeader={true}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-2xl font-bold">Calendar</h1>
          <Button onClick={handleAddEvent}>
            <Plus className="mr-2 h-4 w-4" /> Add Event
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={handleDateChange}
                className="rounded-md border shadow-sm w-full pointer-events-auto"
                modifiers={{
                  hasEvent: (date) => getDayEvents(date).length > 0,
                }}
                modifiersClassNames={{
                  hasEvent: "bg-blue-100 dark:bg-blue-900/30 font-bold",
                }}
              />
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6">
                  <CalendarDays className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No upcoming events</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <Card key={event.id} className="bg-muted/40">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{event.title}</h3>
                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                              <CalendarIcon className="h-3 w-3 mr-1" />
                              <span>
                                {format(new Date(event.date), "MMM d, yyyy")}
                                {event.time && ` • ${event.time}`}
                              </span>
                            </div>
                            {event.location && (
                              <p className="text-sm text-muted-foreground mt-1">
                                📍 {event.location}
                              </p>
                            )}
                          </div>
                          <Badge className={cn(getCategoryColor(event.category), "text-white")}>
                            {getCategoryLabel(event.category)}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Events for Selected Date */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate
                ? `Events for ${format(selectedDate, "MMMM d, yyyy")}`
                : "Events"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {eventsForDate.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                <CalendarDays className="h-16 w-16 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No events for this day</p>
                <Button className="mt-4" onClick={handleAddEvent}>
                  <Plus className="mr-2 h-4 w-4" /> Add Event
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {eventsForDate.map((event) => (
                  <Card key={event.id} className="bg-muted/40">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <h3 className="font-semibold text-lg">{event.title}</h3>
                            <Badge className={cn(getCategoryColor(event.category), "ml-2 text-white")}>
                              {getCategoryLabel(event.category)}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground">
                            {event.time && `⏰ ${event.time}`}
                            {event.location && ` • 📍 ${event.location}`}
                          </p>
                          
                          <p className="text-sm mt-2">{event.description}</p>
                        </div>
                        
                        <div className="flex justify-end mt-4 md:mt-0">
                          <ActionColumn 
                            onEdit={() => handleEditEvent(event)}
                            onDelete={() => handleDeleteEvent(event)}
                            deleteDialogProps={{
                              title: "Delete Event",
                              description: "Are you sure you want to delete this event? This action cannot be undone."
                            }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Event Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[500px] dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="dark:text-white">{isEditing ? "Edit Event" : "Add New Event"}</DialogTitle>
            <DialogDescription className="dark:text-gray-300">
              {isEditing ? "Update your event details below" : "Add your event details below"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium dark:text-white">Title*</label>
              <Input
                id="title"
                name="title"
                value={formData.title || ""}
                onChange={handleInputChange}
                placeholder="Event title"
                required
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="date" className="text-sm font-medium dark:text-white">Date*</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date && format(new Date(formData.date), "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={formData.date ? new Date(formData.date) : undefined}
                      onSelect={(date) => date && setFormData((prev) => ({ ...prev, date: format(date, "yyyy-MM-dd") }))}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="time" className="text-sm font-medium dark:text-white">Time (optional)</label>
                <Input
                  id="time"
                  name="time"
                  value={formData.time || ""}
                  onChange={handleInputChange}
                  placeholder="e.g., 10:00 AM"
                  className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium dark:text-white">Category*</label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleSelectChange("category", value)}
              >
                <SelectTrigger className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800">
                  {eventCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center">
                        <div className={cn("w-3 h-3 rounded-full mr-2", category.color)}></div>
                        {category.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium dark:text-white">Location (optional)</label>
              <Input
                id="location"
                name="location"
                value={formData.location || ""}
                onChange={handleInputChange}
                placeholder="e.g., School Gymnasium"
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium dark:text-white">Description (optional)</label>
              <Textarea
                id="description"
                name="description"
                value={formData.description || ""}
                onChange={handleInputChange}
                placeholder="Event details"
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => setOpenDialog(false)}
                className="dark:border-gray-600 dark:text-white"
              >
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? "Update" : "Add"} Event
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default CalendarPage;
