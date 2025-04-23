
import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Filter } from "lucide-react";

interface AcademicFiltersProps {
  onApplyFilters: (filters: FilterOptions) => void;
  hasActiveFilters: boolean;
}

export interface FilterOptions {
  year?: string;
  term?: string;
  class?: string;
  examType?: string;
}

export const AcademicFilters = ({ onApplyFilters, hasActiveFilters }: AcademicFiltersProps) => {
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [filterForm, setFilterForm] = useState<FilterOptions>({
    year: "",
    term: "",
    class: "",
    examType: "",
  });

  const handleFilterChange = (name: string, value: string) => {
    setFilterForm({ ...filterForm, [name]: value });
  };

  const applyFilters = () => {
    onApplyFilters(filterForm);
    setIsFilterDialogOpen(false);
  };

  const clearFilters = () => {
    const emptyFilters: FilterOptions = {
      year: "",
      term: "",
      class: "",
      examType: "",
    };
    
    setFilterForm(emptyFilters);
    onApplyFilters(emptyFilters);
    setIsFilterDialogOpen(false);
  };

  // Generate years from 2020 to current year + 5
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2019 + 5 }, (_, i) => (2020 + i).toString());

  return (
    <>
      <Button 
        variant={hasActiveFilters ? "default" : "outline"}
        onClick={() => setIsFilterDialogOpen(true)}
      >
        <Filter className="mr-2 h-4 w-4" /> 
        {hasActiveFilters ? "Filtered" : "Filter"}
      </Button>

      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent className="dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Filter Records</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="filter-year" className="dark:text-gray-300">Year</Label>
              <Select 
                value={filterForm.year} 
                onValueChange={(value) => handleFilterChange("year", value)}
              >
                <SelectTrigger className="dark:bg-gray-700 dark:text-white">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700">
                  <SelectItem value="">All Years</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="filter-term" className="dark:text-gray-300">Term</Label>
              <Select 
                value={filterForm.term} 
                onValueChange={(value) => handleFilterChange("term", value)}
              >
                <SelectTrigger className="dark:bg-gray-700 dark:text-white">
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700">
                  <SelectItem value="">All Terms</SelectItem>
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
              <Label htmlFor="filter-class" className="dark:text-gray-300">Class</Label>
              <Select 
                value={filterForm.class} 
                onValueChange={(value) => handleFilterChange("class", value)}
              >
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
              <Label htmlFor="filter-examType" className="dark:text-gray-300">Exam Type</Label>
              <Select 
                value={filterForm.examType} 
                onValueChange={(value) => handleFilterChange("examType", value)}
              >
                <SelectTrigger className="dark:bg-gray-700 dark:text-white">
                  <SelectValue placeholder="Select exam type" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700">
                  <SelectItem value="">All Exam Types</SelectItem>
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
    </>
  );
};
