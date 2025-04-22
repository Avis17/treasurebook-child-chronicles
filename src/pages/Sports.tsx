
import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SportsChart from "@/components/dashboard/SportsChart";
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

interface SportsRecord {
  id: string;
  sport: string;
  event: string;
  score: number;
  rank: string;
  date: string;
  notes: string;
}

const sportsTypes = [
  "Basketball",
  "Soccer",
  "Swimming",
  "Tennis",
  "Track & Field",
  "Volleyball",
  "Baseball",
  "Badminton",
  "Cricket",
  "Hockey"
];

const rankOptions = [
  "1st Place",
  "2nd Place",
  "3rd Place",
  "Participation",
  "Team MVP",
  "Captain",
  "Honorable Mention",
  "Personal Best"
];

const mockRecords: SportsRecord[] = [
  {
    id: "sp1",
    sport: "Basketball",
    event: "School Tournament",
    score: 28,
    rank: "1st Place",
    date: "2025-03-15",
    notes: "Scored 28 points in the final game"
  },
  {
    id: "sp2",
    sport: "Swimming",
    event: "Regional Meet",
    score: 0,
    rank: "2nd Place",
    date: "2025-02-22",
    notes: "100m freestyle"
  },
  {
    id: "sp3",
    sport: "Track & Field",
    event: "District Championship",
    score: 0,
    rank: "3rd Place",
    date: "2025-01-10",
    notes: "Long jump competition"
  }
];

const Sports = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRecordId, setCurrentRecordId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newRecord, setNewRecord] = useState({
    sport: "",
    event: "",
    score: 0,
    rank: "",
    date: new Date().toISOString().split('T')[0],
    notes: ""
  });

  // In a real app, this would fetch from Firebase
  const { data: records = mockRecords, refetch } = useQuery({
    queryKey: ["sportsRecords"],
    queryFn: async () => {
      // This would be replaced with actual Firebase query
      return mockRecords;
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewRecord((prev) => ({ 
      ...prev, 
      [name]: name === "score" ? Number(value) : value 
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewRecord((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setNewRecord({
      sport: "",
      event: "",
      score: 0,
      rank: "",
      date: new Date().toISOString().split('T')[0],
      notes: ""
    });
    setIsEditing(false);
    setCurrentRecordId(null);
  };

  const handleEdit = (record: SportsRecord) => {
    setIsEditing(true);
    setCurrentRecordId(record.id);
    setNewRecord({
      sport: record.sport,
      event: record.event,
      score: record.score,
      rank: record.rank,
      date: record.date,
      notes: record.notes
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (record: SportsRecord) => {
    // This would delete from Firebase in a real app
    toast({
      title: "Record Deleted",
      description: "The sports record has been deleted successfully."
    });
    // await refetch();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // This would add/update record in Firebase in a real app
      toast({
        title: isEditing ? "Record Updated" : "Record Added",
        description: `The sports record has been ${isEditing ? "updated" : "added"} successfully.`
      });
      
      resetForm();
      setIsDialogOpen(false);
      // await refetch();
    } catch (error) {
      console.error("Error saving sports record:", error);
      toast({
        title: "Error",
        description: "Failed to save sports record",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      header: "Sport",
      accessor: "sport" as keyof SportsRecord,
      sortable: true,
    },
    {
      header: "Event",
      accessor: "event" as keyof SportsRecord,
      sortable: true,
    },
    {
      header: "Score/Points",
      accessor: "score" as keyof SportsRecord,
      render: (record: SportsRecord) => (
        record.score > 0 ? record.score : "N/A"
      ),
      sortable: true,
    },
    {
      header: "Rank/Position",
      accessor: "rank" as keyof SportsRecord,
      sortable: true,
      render: (record: SportsRecord) => (
        <div className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs inline-block">
          {record.rank}
        </div>
      ),
    },
    {
      header: "Date",
      accessor: "date" as keyof SportsRecord,
      sortable: true,
    },
    {
      header: "Notes",
      accessor: "notes" as keyof SportsRecord,
      render: (record: SportsRecord) => (
        <div className="truncate max-w-xs">{record.notes}</div>
      ),
    },
  ];

  return (
    <AppLayout title="Sports">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Sports Performance</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                Add Record
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {isEditing ? "Edit Sports Record" : "Add Sports Record"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sport">Sport</Label>
                  <Select
                    value={newRecord.sport}
                    onValueChange={(value) => handleSelectChange("sport", value)}
                  >
                    <SelectTrigger id="sport" className="w-full">
                      <SelectValue placeholder="Select a sport" />
                    </SelectTrigger>
                    <SelectContent>
                      {sportsTypes.map((sport) => (
                        <SelectItem key={sport} value={sport}>
                          {sport}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="event">Event</Label>
                  <Input
                    id="event"
                    name="event"
                    value={newRecord.event}
                    onChange={handleInputChange}
                    placeholder="Tournament, Meet, etc."
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="score">Score/Points (optional)</Label>
                    <Input
                      id="score"
                      name="score"
                      type="number"
                      value={newRecord.score}
                      onChange={handleInputChange}
                      placeholder="0"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="rank">Rank/Position</Label>
                    <Select
                      value={newRecord.rank}
                      onValueChange={(value) => handleSelectChange("rank", value)}
                    >
                      <SelectTrigger id="rank" className="w-full">
                        <SelectValue placeholder="Select rank" />
                      </SelectTrigger>
                      <SelectContent>
                        {rankOptions.map((rank) => (
                          <SelectItem key={rank} value={rank}>
                            {rank}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={newRecord.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    name="notes"
                    value={newRecord.notes}
                    onChange={handleInputChange}
                    placeholder="Additional details..."
                  />
                </div>
                
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting 
                      ? (isEditing ? "Updating..." : "Adding...") 
                      : (isEditing ? "Update Record" : "Add Record")}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="chart">
          <TabsList>
            <TabsTrigger value="chart">Performance Chart</TabsTrigger>
            <TabsTrigger value="records">Records</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chart" className="mt-6">
            <SportsChart />
          </TabsContent>
          
          <TabsContent value="records" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Sports Records</CardTitle>
                <CardDescription>
                  Track all your sports achievements and activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={records}
                  columns={columns}
                  searchable
                  searchFields={["sport", "event", "rank", "notes"]}
                  itemsPerPage={5}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  deleteDialogProps={{
                    title: "Delete Sports Record",
                    description: "Are you sure you want to delete this sports record? This action cannot be undone."
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

export default Sports;
