
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, Search } from "lucide-react";
import { AcademicRecord } from "@/lib/academic-service";

interface AcademicTableProps {
  records: AcademicRecord[];
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export const AcademicTable = ({ records, hasActiveFilters, onClearFilters }: AcademicTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof AcademicRecord | null;
    direction: "asc" | "desc" | null;
  }>({
    key: null,
    direction: null,
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // Filter records by search term
  const filteredRecords = records.filter((record) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      record.subject.toLowerCase().includes(searchTermLower) ||
      record.year.toLowerCase().includes(searchTermLower) ||
      record.term.toLowerCase().includes(searchTermLower) ||
      record.class.toLowerCase().includes(searchTermLower) ||
      record.examType.toLowerCase().includes(searchTermLower)
    );
  });

  // Sort records
  const sortedRecords = [...filteredRecords].sort((a, b) => {
    if (!sortConfig.key || !sortConfig.direction) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue === bValue) return 0;
    
    const direction = sortConfig.direction === "asc" ? 1 : -1;
    
    if (typeof aValue === "string" && typeof bValue === "string") {
      return aValue.localeCompare(bValue) * direction;
    }
    
    return ((aValue < bValue ? -1 : 1) * direction);
  });

  // Paginate records
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = sortedRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(sortedRecords.length / recordsPerPage);

  const handleSort = (key: keyof AcademicRecord) => {
    setSortConfig((prevConfig) => {
      if (prevConfig.key === key) {
        if (prevConfig.direction === "asc") {
          return { key, direction: "desc" };
        }
        return { key: null, direction: null };
      }
      return { key, direction: "asc" };
    });
  };

  const renderSortIcon = (columnKey: keyof AcademicRecord) => {
    if (sortConfig.key !== columnKey) return null;
    
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="inline-block ml-1 h-4 w-4" />
    ) : (
      <ArrowDown className="inline-block ml-1 h-4 w-4" />
    );
  };

  if (records.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500 dark:text-gray-400">No academic records found</p>
        {hasActiveFilters && (
          <Button 
            variant="link" 
            onClick={onClearFilters} 
            className="mt-2"
          >
            Clear filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <div className="relative flex-1">
          <Input
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 dark:bg-gray-700 dark:text-white"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      
      <div className="rounded-md border dark:border-gray-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="dark:bg-gray-900 dark:hover:bg-gray-800">
              <TableHead 
                className="dark:text-gray-300 cursor-pointer"
                onClick={() => handleSort('class')}
              >
                Class/Year {renderSortIcon('class')}
              </TableHead>
              <TableHead 
                className="dark:text-gray-300 cursor-pointer"
                onClick={() => handleSort('term')}
              >
                Term {renderSortIcon('term')}
              </TableHead>
              <TableHead 
                className="dark:text-gray-300 cursor-pointer"
                onClick={() => handleSort('subject')}
              >
                Subject {renderSortIcon('subject')}
              </TableHead>
              <TableHead 
                className="dark:text-gray-300 cursor-pointer"
                onClick={() => handleSort('examType')}
              >
                Exam {renderSortIcon('examType')}
              </TableHead>
              <TableHead 
                className="dark:text-gray-300 cursor-pointer"
                onClick={() => handleSort('score')}
              >
                Score {renderSortIcon('score')}
              </TableHead>
              <TableHead 
                className="dark:text-gray-300 cursor-pointer"
                onClick={() => handleSort('grade')}
              >
                Grade {renderSortIcon('grade')}
              </TableHead>
              <TableHead className="hidden md:table-cell dark:text-gray-300">
                Remarks
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentRecords.map((record) => (
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {indexOfFirstRecord + 1}-{Math.min(indexOfLastRecord, filteredRecords.length)} of {filteredRecords.length} records
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              let pageNumber: number;
              
              // Calculate which page numbers to show
              if (totalPages <= 5) {
                pageNumber = i + 1;
              } else if (currentPage <= 3) {
                pageNumber = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + i;
              } else {
                pageNumber = currentPage - 2 + i;
              }
              
              return (
                <Button
                  key={i}
                  variant={currentPage === pageNumber ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNumber)}
                >
                  {pageNumber}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
