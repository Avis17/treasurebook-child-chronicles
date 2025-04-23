
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
  // Hide these fields
  const hideFields = ["createdAt", "updatedAt", "userId", "id"];
  let notesField: { label: string; value: React.ReactNode } | undefined = undefined;
  const visibleFields = fields.filter((f) => {
    // New version: Accept rawKey from map or fallback to label (for custom mapping)
    const key = (f as any).rawKey || f.label?.replace(/\s/g, '').toLowerCase();
    if (key && key.toLowerCase().includes("notes")) {
      notesField = f;
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
          {notesField && (
            <div className="mt-4 bg-blue-50 dark:bg-gray-700/50 border-l-4 border-blue-500 px-4 py-3 rounded">
              <div className="font-semibold text-blue-700 dark:text-blue-200 mb-1">{notesField.label}</div>
              <div className="text-gray-900 dark:text-gray-100 whitespace-pre-line">{notesField.value}</div>
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
