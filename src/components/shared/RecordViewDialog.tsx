
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface RecordViewDialogProps<T> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: T | null;
  fields: Array<{ label: string; value: React.ReactNode }>;
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
          {fields.map(({ label, value }, i) => (
            <div key={i} className="flex">
              <span className="w-40 font-semibold text-gray-700 dark:text-white">{label}</span>
              <span className="text-gray-900 dark:text-gray-300">{value}</span>
            </div>
          ))}
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
