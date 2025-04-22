
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import Sidebar from "@/components/navigation/Sidebar";
import { List, Plus, Filter } from "lucide-react";
import { 
  AcademicRecord, 
  createAcademicRecord,
  saveAcademicRecords, 
  loadAcademicRecords,
  filterAcademicRecords
} from "@/lib/academic-service";

const AcademicRecords = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [records, setRecords] = useState<AcademicRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AcademicRecord[]>([]);
  const [activeFilters, setActiveFilters] = useState<{
    year?: string;
    term?: string;
    class?: string;
    examType?: string;
  }>({});
  
  // Form state
  const [formData, setFormData] = useState({
    year: new Date().getFullYear().toString(),
    term: "1st Term",
    examType: "Unit Test",
    class: "Pre-KG",
    subject: "",
    score: 0,
    maxScore: 100,
    remarks: "",
    isPercentage: false,
  });
  
  // Filter form state
  const [filterForm, setFilterForm] = useState({
    year: "",
    term: "",
    class: "",
    examType: "",
  });
  
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      } else {
        // Load records from localStorage
        const loadedRecords = loadAcademicRecords().filter(
          record => record.userId === user.uid
        );
        setRecords(loadedRecords);
        setFilteredRecords(loadedRecords);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Apply filters when activeFilters changes
  useEffect(() => {
    if (records.length > 0) {
      const filtered = filterAcademicRecords(records, activeFilters);
      setFilteredRecords(filtered);
    }
  }, [activeFilters, records]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleFilterChange = (name: string, value: string) => {
    setFilterForm({ ...filterForm, [name]: value });
  };

  const applyFilters = () => {
    // Only include filters with values
    const newFilters = Object.entries(filterForm).reduce((acc, [key, value]) => {
      if (value) {
        acc[key as keyof typeof activeFilters] = value;
      }
      return acc;
    }, {} as typeof activeFilters);
    
    setActiveFilters(newFilters);
    setIsFilterDialogOpen(false);
  };

  const clearFilters = () => {
    setFilterForm({
      year: "",
      term: "",
      class: "",
      examType: "",
    });
    setActiveFilters({});
    setIsFilterDialogOpen(false);
  };

  const handleAddRecord = async () => {
    if (!auth.currentUser || !formData.subject) return;
    
    try {
      const newRecord = createAcademicRecord({
        ...formData,
        userId: auth.currentUser.uid,
      });
      
      const updatedRecords = [...records, newRecord];
      setRecords(updatedRecords);
      saveAcademicRecords(updatedRecords);
      
      toast({
        title: "Success",
        description: "Academic record added",
      });
      
      // Reset form to defaults
      setFormData({
        year: new Date().getFullYear().toString(),
        term: "1st Term",
        examType: "Unit Test",
        class: "Pre-KG",
        subject: "",
        score: 0,
        maxScore: 100,
        remarks: "",
        isPercentage: false,
      });
      
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Error adding record:", error);
      toast({
        title: "Error",
        description: "Failed to add academic record",
        variant: "destructive",
      });
    }
  };

  const hasActiveFilters = Object.values(activeFilters).some(value => !!value);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar isMobile={isMobile} isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className="flex-1 overflow-auto">
        {isMobile && (
          <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b shadow-sm z-10">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(true)}
              >
                <List className="h-6 w-6" />
              </Button>
              <h1 className="text-xl font-bold text-treasure-blue dark:text-blue-400">
                TreasureBook
              </h1>
              <div className="w-6"></div> {/* Placeholder for balance */}
            </div>
          </div>
        )}

        <main className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold dark:text-white">Academic Records</h1>
            <div className="flex space-x-2">
              <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant={hasActiveFilters ? "default" : "outline"}>
                    <Filter className="mr-2 h-4 w-4" /> 
                    {hasActiveFilters ? "Filtered" : "Filter"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="dark:bg-gray-800">
                  <DialogHeader>
                    <DialogTitle className="dark:text-white">Filter Records</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="filter-year" className="dark:text-gray-300">Year</Label>
                      <Select value={filterForm.year} onValueChange={(value) => handleFilterChange("year", value)}>
                        <SelectTrigger className="dark:bg-gray-700 dark:text-white">
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-700">
                          <SelectItem value="">All Years</SelectItem>
                          <SelectItem value="2023">2023</SelectItem>
                          <SelectItem value="2024">2024</SelectItem>
                          <SelectItem value="2025">2025</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="filter-term" className="dark:text-gray-300">Term</Label>
                      <Select value={filterForm.term} onValueChange={(value) => handleFilterChange("term", value)}>
                        <SelectTrigger className="dark:bg-gray-700 dark:text-white">
                          <SelectValue placeholder="Select term" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-700">
                          <SelectItem value="">All Terms</SelectItem>
                          <SelectItem value="1st Term">1st Term</SelectItem>
                          <SelectItem value="2nd Term">2nd Term</SelectItem>
                          <SelectItem value="3rd Term">3rd Term</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="filter-class" className="dark:text-gray-300">Class</Label>
                      <Select value={filterForm.class} onValueChange={(value) => handleFilterChange("class", value)}>
                        <SelectTrigger className="dark:bg-gray-700 dark:text-white">
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-700">
                          <SelectItem value="">All Classes</SelectItem>
                          <SelectItem value="Pre-KG">Pre-KG</SelectItem>
                          <SelectItem value="KG">KG</SelectItem>
                          <SelectItem value="Grade 1">Grade 1</SelectItem>
                          <SelectItem value="Grade 2">Grade 2</SelectItem>
                          <SelectItem value="Grade 3">Grade 3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="filter-examType" className="dark:text-gray-300">Exam Type</Label>
                      <Select value={filterForm.examType} onValueChange={(value) => handleFilterChange("examType", value)}>
                        <SelectTrigger className="dark:bg-gray-700 dark:text-white">
                          <SelectValue placeholder="Select exam type" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-700">
                          <SelectItem value="">All Exam Types</SelectItem>
                          <SelectItem value="Unit Test">Unit Test</SelectItem>
                          <SelectItem value="Mid-Term">Mid-Term</SelectItem>
                          <SelectItem value="Final">Final</SelectItem>
                          <SelectItem value="Project">Project</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={clearFilters}
                      className="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                    >
                      Clear Filters
                    </Button>
                    <Button onClick={applyFilters}>
                      Apply Filters
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Record
                  </Button>
                </DialogTrigger>
                <DialogContent className="dark:bg-gray-800">
                  <DialogHeader>
                    <DialogTitle className="dark:text-white">Add Academic Record</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="year" className="dark:text-gray-300">Academic Year</Label>
                      <Select value={formData.year} onValueChange={(value) => handleSelectChange("year", value)}>
                        <SelectTrigger className="dark:bg-gray-700 dark:text-white">
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-700">
                          <SelectItem value="2023">2023</SelectItem>
                          <SelectItem value="2024">2024</SelectItem>
                          <SelectItem value="2025">2025</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="term" className="dark:text-gray-300">Term</Label>
                      <Select value={formData.term} onValueChange={(value) => handleSelectChange("term", value)}>
                        <SelectTrigger className="dark:bg-gray-700 dark:text-white">
                          <SelectValue placeholder="Select term" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-700">
                          <SelectItem value="1st Term">1st Term</SelectItem>
                          <SelectItem value="2nd Term">2nd Term</SelectItem>
                          <SelectItem value="3rd Term">3rd Term</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="class" className="dark:text-gray-300">Class</Label>
                      <Select value={formData.class} onValueChange={(value) => handleSelectChange("class", value)}>
                        <SelectTrigger className="dark:bg-gray-700 dark:text-white">
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-700">
                          <SelectItem value="Pre-KG">Pre-KG</SelectItem>
                          <SelectItem value="KG">KG</SelectItem>
                          <SelectItem value="Grade 1">Grade 1</SelectItem>
                          <SelectItem value="Grade 2">Grade 2</SelectItem>
                          <SelectItem value="Grade 3">Grade 3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="examType" className="dark:text-gray-300">Exam Type</Label>
                      <Select value={formData.examType} onValueChange={(value) => handleSelectChange("examType", value)}>
                        <SelectTrigger className="dark:bg-gray-700 dark:text-white">
                          <SelectValue placeholder="Select exam type" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-700">
                          <SelectItem value="Unit Test">Unit Test</SelectItem>
                          <SelectItem value="Mid-Term">Mid-Term</SelectItem>
                          <SelectItem value="Final">Final</SelectItem>
                          <SelectItem value="Project">Project</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="dark:text-gray-300">Subject</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="Enter subject name"
                        className="dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>
                    
                    <div className="flex gap-2 items-center">
                      <div className="space-y-2 flex-1">
                        <Label htmlFor="score" className="dark:text-gray-300">Score</Label>
                        <Input
                          id="score"
                          name="score"
                          type="number"
                          value={formData.score}
                          onChange={handleInputChange}
                          className="dark:bg-gray-700 dark:text-white"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2 flex-1">
                        <Label htmlFor="maxScore" className="dark:text-gray-300">Max Score</Label>
                        <Input
                          id="maxScore"
                          name="maxScore"
                          type="number"
                          value={formData.maxScore}
                          onChange={handleInputChange}
                          className="dark:bg-gray-700 dark:text-white"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2 col-span-full">
                      <div className="flex items-center space-x-2">
                        <input
                          id="isPercentage"
                          name="isPercentage"
                          type="checkbox"
                          checked={formData.isPercentage}
                          onChange={handleInputChange}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor="isPercentage" className="dark:text-gray-300">Score is percentage</Label>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Check this if the score is already in percentage format
                      </p>
                    </div>
                    
                    <div className="space-y-2 col-span-full">
                      <Label htmlFor="remarks" className="dark:text-gray-300">Remarks</Label>
                      <Input
                        id="remarks"
                        name="remarks"
                        value={formData.remarks}
                        onChange={handleInputChange}
                        placeholder="Optional comments"
                        className="dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsAddDialogOpen(false)}
                      className="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleAddRecord} 
                      disabled={!formData.subject}
                    >
                      Add Record
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card className="dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="dark:text-white">Subject Performance</CardTitle>
              <CardDescription className="dark:text-gray-300">
                Track academic progress across different subjects
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredRecords.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500 dark:text-gray-400">No academic records found</p>
                  {hasActiveFilters && (
                    <Button 
                      variant="link" 
                      onClick={clearFilters} 
                      className="mt-2"
                    >
                      Clear filters
                    </Button>
                  )}
                </div>
              ) : (
                <div className="rounded-md border dark:border-gray-700">
                  <Table>
                    <TableHeader>
                      <TableRow className="dark:bg-gray-900 dark:hover:bg-gray-800">
                        <TableHead className="dark:text-gray-300">Class/Year</TableHead>
                        <TableHead className="dark:text-gray-300">Term</TableHead>
                        <TableHead className="dark:text-gray-300">Subject</TableHead>
                        <TableHead className="dark:text-gray-300">Exam</TableHead>
                        <TableHead className="dark:text-gray-300">Score</TableHead>
                        <TableHead className="dark:text-gray-300">Grade</TableHead>
                        <TableHead className="hidden md:table-cell dark:text-gray-300">
                          Remarks
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords.map((record) => (
                        <TableRow key={record.id} className="dark:hover:bg-gray-800/50">
                          <TableCell className="dark:text-gray-300">{record.class} ({record.year})</TableCell>
                          <TableCell className="dark:text-gray-300">{record.term}</TableCell>
                          <TableCell className="dark:text-gray-300">{record.subject}</TableCell>
                          <TableCell className="dark:text-gray-300">{record.examType}</TableCell>
                          <TableCell className="dark:text-gray-300">
                            {record.isPercentage ? 
                              `${record.score}%` : 
                              `${record.score}/${record.maxScore}`
                            }
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                record.grade.startsWith("A")
                                  ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                                  : record.grade.startsWith("B")
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                                  : record.grade.startsWith("C") 
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                  : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                              }`}
                            >
                              {record.grade}
                            </span>
                          </TableCell>
                          <TableCell className="hidden md:table-cell dark:text-gray-300">
                            {record.remarks}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default AcademicRecords;
