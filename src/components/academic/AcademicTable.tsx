
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, Search, Eye, Edit2, Trash } from "lucide-react";
import { AcademicRecord } from "@/lib/academic-service";
import { RecordViewDialog } from "../shared/RecordViewDialog";

interface AcademicTableProps {
  records: AcademicRecord[];
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onEdit?: (item: AcademicRecord) => void;
  onDelete?: (item: AcademicRecord) => void;
}

export const AcademicTable = ({
  records,
  hasActiveFilters,
  onClearFilters,
  onEdit,
  onDelete,
}: AcademicTableProps) => {
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
  const [viewOpen, setViewOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<AcademicRecord | null>(null);

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

  // Map record fields for dialog
  function getFields(record: AcademicRecord) {
    return [
      { label: "Class", value: record.class, rawKey: "class" },
      { label: "Year", value: record.year, rawKey: "year" },
      { label: "Term", value: record.term, rawKey: "term" },
      { label: "Subject", value: record.subject, rawKey: "subject" },
      { label: "Exam Type", value: record.examType, rawKey: "examType" },
      { label: "Score", value: record.isPercentage ? `${record.score}%` : `${record.score}/${record.maxScore}`, rawKey: "score" },
      { label: "Grade", value: record.grade, rawKey: "grade" },
      { label: "Remarks", value: record.remarks ?? "", rawKey: "remarks" },
      { label: "Notes", value: record.notes ?? "", rawKey: "notes" },
    ];
  }

  function handleDelete(record: AcademicRecord) {
    if (onDelete) onDelete(record);
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
              <TableHead onClick={() => handleSort('class')} className="dark:text-gray-300 cursor-pointer">Class/Year {renderSortIcon('class')}</TableHead>
              <TableHead onClick={() => handleSort('term')} className="dark:text-gray-300 cursor-pointer">Term {renderSortIcon('term')}</TableHead>
              <TableHead onClick={() => handleSort('subject')} className="dark:text-gray-300 cursor-pointer">Subject {renderSortIcon('subject')}</TableHead>
              <TableHead onClick={() => handleSort('examType')} className="dark:text-gray-300 cursor-pointer">Exam {renderSortIcon('examType')}</TableHead>
              <TableHead onClick={() => handleSort('score')} className="dark:text-gray-300 cursor-pointer">Score {renderSortIcon('score')}</TableHead>
              <TableHead onClick={() => handleSort('grade')} className="dark:text-gray-300 cursor-pointer">Grade {renderSortIcon('grade')}</TableHead>
              <TableHead className="hidden md:table-cell dark:text-gray-300">Remarks</TableHead>
              <TableHead className="dark:text-gray-300">Actions</TableHead>
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
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {setViewRecord(record); setViewOpen(true);}}
                      title="View details"
                    >
                      <Eye />
                    </Button>
                    {onDelete && (
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(record)}
                        title="Delete"
                      >
                        <Trash />
                      </Button>
                    )}
                    {onEdit && (
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={() => onEdit(record)}
                        title="Edit"
                      >
                        <Edit2 />
                      </Button>
                    )}
                  </div>
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

      {/* View dialog */}
      <RecordViewDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        record={viewRecord}
        fields={viewRecord ? getFields(viewRecord) : []}
        onEdit={onEdit && viewRecord ? () => { setViewOpen(false); onEdit(viewRecord); } : undefined}
        editLabel="Edit"
      />
    </div>
  );
};
