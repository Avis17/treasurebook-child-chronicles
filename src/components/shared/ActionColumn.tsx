
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";

interface ActionColumnProps {
  onEdit?: () => void;
  onDelete?: () => void;
  deleteDialogProps?: {
    title?: string;
    description?: string;
  };
  loading?: boolean;
}

export function ActionColumn({
  onEdit,
  onDelete,
  deleteDialogProps,
  loading = false,
}: ActionColumnProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <div className="flex items-center gap-2">
      {onEdit && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
          disabled={loading}
        >
          <Edit className="h-4 w-4" />
        </Button>
      )}
      {onDelete && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive"
            disabled={loading}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <DeleteConfirmDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            onConfirm={onDelete}
            loading={loading}
            {...deleteDialogProps}
          />
        </>
      )}
    </div>
  );
}
