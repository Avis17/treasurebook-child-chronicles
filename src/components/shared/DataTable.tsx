
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { ActionColumn } from "./ActionColumn";
import { SearchBar } from "./data-table/SearchBar";
import { TableHeader } from "./data-table/TableHeader";
import { TablePagination } from "./data-table/TablePagination";

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

  const allColumns: Column<T>[] = [
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
          sortable: false,
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
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

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

  return (
    <div className="space-y-4">
      {searchable && searchFields && (
        <SearchBar value={searchTerm} onChange={setSearchTerm} />
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader
            columns={allColumns}
            sortConfig={sortConfig}
            onSort={handleSort}
          />
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
                <TableCell colSpan={allColumns.length} className="h-24 text-center">
                  No results found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
