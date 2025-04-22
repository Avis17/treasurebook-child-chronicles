import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { ActionColumn } from "./ActionColumn";

type SortDirection = "asc" | "desc" | null;

interface Column<T> {
  header: string;
  accessor: keyof T;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  itemsPerPage?: number;
  searchable?: boolean;
  searchFields?: Array<keyof T>;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  deleteDialogProps?: {
    title?: string;
    description?: string;
  };
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  itemsPerPage = 5,
  searchable = true,
  searchFields,
  onEdit,
  onDelete,
  deleteDialogProps,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | null;
    direction: SortDirection;
  }>({
    key: null,
    direction: null,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState<T[]>(data);

  const allColumns = [
    ...columns,
    ...(onEdit || onDelete
      ? [{
          header: "Actions",
          accessor: "actions" as keyof T,
          render: (item: T) => (
            <ActionColumn
              onEdit={onEdit ? () => onEdit(item) : undefined}
              onDelete={onDelete ? () => onDelete(item) : undefined}
              deleteDialogProps={deleteDialogProps}
            />
          ),
        }]
      : []),
  ];

  useEffect(() => {
    let result = [...data];

    if (searchTerm && searchFields) {
      result = result.filter((item) =>
        searchFields.some((field) => {
          const value = String(item[field]).toLowerCase();
          return value.includes(searchTerm.toLowerCase());
        })
      );
    }

    if (sortConfig.key && sortConfig.direction) {
      result = [...result].sort((a, b) => {
        const valueA = a[sortConfig.key as keyof T];
        const valueB = b[sortConfig.key as keyof T];
        
        if (valueA === valueB) return 0;
        
        const directionModifier = sortConfig.direction === "asc" ? 1 : -1;
        
        if (typeof valueA === "string" && typeof valueB === "string") {
          return valueA.localeCompare(valueB) * directionModifier;
        }
        
        return ((valueA < valueB ? -1 : 1) * directionModifier);
      });
    }

    setFilteredData(result);
    setCurrentPage(1);
  }, [data, sortConfig, searchTerm, searchFields]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleSort = (key: keyof T) => {
    setSortConfig((prevConfig) => {
      if (prevConfig.key === key) {
        if (prevConfig.direction === "asc") {
          return { key, direction: "desc" };
        }
        if (prevConfig.direction === "desc") {
          return { key: null, direction: null };
        }
      }
      return { key, direction: "asc" };
    });
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 3;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      
      if (currentPage > 2) {
        pageNumbers.push(-1);
      }
      
      if (currentPage !== 1 && currentPage !== totalPages) {
        pageNumbers.push(currentPage);
      }
      
      if (currentPage < totalPages - 1) {
        pageNumbers.push(-2);
      }
      
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  return (
    <div className="space-y-4">
      {searchable && searchFields && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {allColumns.map((column) => (
                <TableHead
                  key={String(column.accessor)}
                  className={column.sortable ? "cursor-pointer select-none" : ""}
                  onClick={() => {
                    if (column.sortable) {
                      handleSort(column.accessor);
                    }
                  }}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {column.sortable && (
                      <div className="flex flex-col">
                        <ChevronUp
                          className={`h-3 w-3 ${
                            sortConfig.key === column.accessor &&
                            sortConfig.direction === "asc"
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}
                        />
                        <ChevronDown
                          className={`h-3 w-3 ${
                            sortConfig.key === column.accessor &&
                            sortConfig.direction === "desc"
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}
                        />
                      </div>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item, index) => (
                <TableRow key={index}>
                  {allColumns.map((column) => (
                    <TableCell key={`${index}-${String(column.accessor)}`}>
                      {column.render
                        ? column.render(item)
                        : item[column.accessor] as React.ReactNode}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={allColumns.length}
                  className="h-24 text-center"
                >
                  No results found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage((prev) => Math.max(prev - 1, 1));
                }}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            
            {getPageNumbers().map((pageNum, index) => {
              if (pageNum < 0) {
                return (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <span className="flex h-9 w-9 items-center justify-center">...</span>
                  </PaginationItem>
                );
              }
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(pageNum);
                    }}
                    isActive={currentPage === pageNum}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                }}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
