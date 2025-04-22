
import { TableHead, TableHeader as ShadcnTableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Column<T> {
  header: string;
  accessor: keyof T;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface TableHeaderProps<T> {
  columns: Column<T>[];
  sortConfig: {
    key: keyof T | null;
    direction: "asc" | "desc" | null;
  };
  onSort: (key: keyof T) => void;
}

export function TableHeader<T>({ columns, sortConfig, onSort }: TableHeaderProps<T>) {
  return (
    <ShadcnTableHeader>
      <TableRow>
        {columns.map((column) => (
          <TableHead
            key={String(column.accessor)}
            className={column.sortable ? "cursor-pointer select-none" : ""}
            onClick={() => {
              if (column.sortable) {
                onSort(column.accessor);
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
    </ShadcnTableHeader>
  );
}
