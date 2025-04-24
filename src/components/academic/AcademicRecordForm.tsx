
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { createAcademicRecord, AcademicRecord } from "@/lib/academic-service";
import { useToast } from "@/components/ui/use-toast";
import { auth } from "@/lib/firebase";

interface AcademicRecordFormProps {
  onRecordAdded: (newRecord: AcademicRecord) => void;
  onRecordUpdated?: (updatedRecord: AcademicRecord) => Promise<void>;
  initialData?: AcademicRecord | null;
  isOpen?: boolean;
  onClose?: () => void;
}

export const AcademicRecordForm = ({ 
  onRecordAdded, 
  onRecordUpdated,
  initialData,
  isOpen: isOpenProp,
  onClose
}: AcademicRecordFormProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();
  
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

  useEffect(() => {
    if (initialData) {
      setFormData({
        year: initialData.year || new Date().getFullYear().toString(),
        term: initialData.term || "1st Term",
        examType: initialData.examType || "Unit Test",
        class: initialData.class || "Pre-KG",
        subject: initialData.subject || "",
        score: initialData.score || 0,
        maxScore: initialData.maxScore || 100,
        remarks: initialData.remarks || "",
        isPercentage: initialData.isPercentage || false,
      });
    }
  }, [initialData]);

  useEffect(() => {
    if (isOpenProp !== undefined) {
      setIsAddDialogOpen(isOpenProp);
    }
  }, [isOpenProp]);

  // Generate years from 2020 to current year + 5
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2019 + 5 }, (_, i) => (2020 + i).toString());

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

  const handleAddRecord = async () => {
    if (!auth.currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to add records",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.subject) {
      toast({
        title: "Error",
        description: "Subject is required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (initialData && onRecordUpdated) {
        // Handle update case
        await onRecordUpdated({
          ...initialData,
          ...formData,
        });
      } else {
        // Handle create case
        const recordData = {
          ...formData,
          userId: auth.currentUser.uid,
        };
        
        const newRecord = await createAcademicRecord(recordData);
        
        if (newRecord) {
          onRecordAdded(newRecord);
          
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
        } else {
          throw new Error("Failed to create record");
        }
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error("Error adding/updating record:", error);
      toast({
        title: "Error",
        description: "Failed to save academic record",
        variant: "destructive",
      });
    }
  };

  const handleCloseDialog = () => {
    if (onClose) {
      onClose();
    } else {
      setIsAddDialogOpen(false);
    }
  };

  const dialogTitle = initialData ? "Edit Academic Record" : "Add Academic Record";
  const submitButtonText = initialData ? "Update Record" : "Add Record";

  return (
    <>
      {!isOpenProp && (
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Record
        </Button>
      )}
      
      <Dialog open={isAddDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="dark:text-white">{dialogTitle}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="year" className="dark:text-gray-300">Academic Year</Label>
              <Select value={formData.year} onValueChange={(value) => handleSelectChange("year", value)}>
                <SelectTrigger className="dark:bg-gray-700 dark:text-white">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700">
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
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
                  <SelectItem value="4th Term">4th Term</SelectItem>
                  <SelectItem value="Semester 1">Semester 1</SelectItem>
                  <SelectItem value="Semester 2">Semester 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="class" className="dark:text-gray-300">Class</Label>
              <Select value={formData.class} onValueChange={(value) => handleSelectChange("class", value)}>
                <SelectTrigger className="dark:bg-gray-700 dark:text-white">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700 max-h-[300px]">
                  <SelectItem value="Pre-KG">Pre-KG</SelectItem>
                  <SelectItem value="KG">KG</SelectItem>
                  <SelectItem value="Grade 1">Grade 1</SelectItem>
                  <SelectItem value="Grade 2">Grade 2</SelectItem>
                  <SelectItem value="Grade 3">Grade 3</SelectItem>
                  <SelectItem value="Grade 4">Grade 4</SelectItem>
                  <SelectItem value="Grade 5">Grade 5</SelectItem>
                  <SelectItem value="Grade 6">Grade 6</SelectItem>
                  <SelectItem value="Grade 7">Grade 7</SelectItem>
                  <SelectItem value="Grade 8">Grade 8</SelectItem>
                  <SelectItem value="Grade 9">Grade 9</SelectItem>
                  <SelectItem value="Grade 10">Grade 10</SelectItem>
                  <SelectItem value="Grade 11">Grade 11</SelectItem>
                  <SelectItem value="Grade 12">Grade 12</SelectItem>
                  <SelectItem value="College 1st Year">College 1st Year</SelectItem>
                  <SelectItem value="College 2nd Year">College 2nd Year</SelectItem>
                  <SelectItem value="College 3rd Year">College 3rd Year</SelectItem>
                  <SelectItem value="College 4th Year">College 4th Year</SelectItem>
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
                  <SelectItem value="Assignment">Assignment</SelectItem>
                  <SelectItem value="Quiz">Quiz</SelectItem>
                  <SelectItem value="Presentation">Presentation</SelectItem>
                  <SelectItem value="Practical">Practical</SelectItem>
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
              onClick={handleCloseDialog}
              className="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddRecord} 
              disabled={!formData.subject}
            >
              {submitButtonText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AcademicRecordForm;
