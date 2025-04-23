
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

interface RecordViewDialogProps<T> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: T | null;
  fields: Array<{ label: string; value: React.ReactNode; rawKey?: string }>;
  onEdit?: () => void;
  editLabel?: string;
}

export function RecordViewDialog<T>({
  open,
  onOpenChange,
  record,
  fields,
  onEdit,
  editLabel = "Edit",
}: RecordViewDialogProps<T>) {
  // If Notes or Remarks is present, group for highlight
  let highlightFields: { label: string; value: React.ReactNode }[] = [];

  // Keys to hide everywhere
  const hideFields = ["createdAt", "updatedAt", "userId", "id"];
  const highlightKeys = ["notes", "remarks"];

  // Custom visible fields mapping (hiding unnecessary keys)
  const visibleFields = fields.filter((f) => {
    const key = (f as any).rawKey || f.label?.replace(/\s/g, '').toLowerCase();
    if (key && highlightKeys.some(hkey => key.includes(hkey))) {
      highlightFields.push(f);
      return false;
    }
    return !hideFields.includes(key);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Details</DialogTitle>
          <DialogDescription>
            View all details of this record below.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 px-1 py-2 max-h-[50vh] overflow-y-auto">
          {visibleFields.map(({ label, value }, i) => (
            <div key={i} className="flex py-1">
              <span className="w-40 font-semibold text-gray-700 dark:text-white">{label}</span>
              <span className="text-gray-900 dark:text-gray-300">{value}</span>
            </div>
          ))}
          {highlightFields.length > 0 && (
            <div className="mt-4 bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-500 px-4 py-3 rounded flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-1">
                <Info className="h-4 w-4 text-blue-600" />
                <span className="font-semibold text-blue-700 dark:text-blue-200">
                  {highlightFields.length === 1
                    ? highlightFields[0].label
                    : highlightFields.map(f => f.label).join(" & ")}
                </span>
              </div>
              {highlightFields.map((field, idx) => (
                <div
                  className="text-gray-900 dark:text-blue-100 whitespace-pre-line"
                  key={idx}
                  style={{
                    fontSize: '1.05rem',
                    background: 'rgba(30,64,175,0.06)',
                    borderRadius: '6px',
                    padding: '0.25rem 0.5rem'
                  }}
                >
                  {typeof field.value === "string" && !field.value.trim()
                    ? <span className="italic text-gray-400">(No {field.label.toLowerCase()} provided)</span>
                    : field.value}
                </div>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          {onEdit && (
            <Button onClick={() => onEdit?.()}>{editLabel}</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
