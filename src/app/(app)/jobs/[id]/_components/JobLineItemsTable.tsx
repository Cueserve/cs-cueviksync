import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  JobItem,
  JobLineItem,
} from "@/components/providers/tracker-provider";

interface JobLineItemsTableProps {
  draftJob: JobItem;
  canEdit: boolean;
  isPreviewMode: boolean;
  onAddItem: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onItemChange: (index: number, field: keyof JobLineItem, value: any) => void;
  onDeleteItem: (index: number) => void;
}

export function JobLineItemsTable({
  draftJob,
  canEdit,
  isPreviewMode,
  onAddItem,
  onItemChange,
  onDeleteItem,
}: JobLineItemsTableProps) {
  const previewInputClass = isPreviewMode
    ? "border-transparent bg-transparent shadow-none px-0 disabled:opacity-100 disabled:cursor-default disabled:text-foreground"
    : "";

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
      <div className="p-6 border-b border-border flex justify-between items-center">
        <h2 className="text-lg font-semibold">Items in this Job</h2>
        {canEdit && (
          <Button variant="outline" size="sm" onClick={onAddItem}>
            <Plus className="size-4 mr-2" /> Add Item
          </Button>
        )}
      </div>
      <div className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted text-muted-foreground text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Line</th>
              <th className="px-4 py-3 font-medium min-w-[200px]">
                Description <span className="text-destructive">*</span>
              </th>
              <th className="px-4 py-3 font-medium w-24">
                Qty <span className="text-destructive">*</span>
              </th>
              <th className="px-4 py-3 font-medium">Mat. Shortage</th>
              <th className="px-4 py-3 font-medium">Eq. Issue</th>
              {canEdit && <th className="px-4 py-3 font-medium w-16"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {draftJob.items.map((item, index) => (
              <tr key={item.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 text-center text-muted-foreground">
                  {item.lineNo}
                </td>
                <td className="px-4 py-2">
                  <Input
                    value={item.itemDescription}
                    onChange={(e) =>
                      onItemChange(index, "itemDescription", e.target.value)
                    }
                    placeholder="Item description..."
                    className={cn(
                      "h-8",
                      previewInputClass,
                      isPreviewMode &&
                        "truncate max-w-[200px] md:max-w-xs xl:max-w-md",
                    )}
                    title={item.itemDescription}
                    disabled={!canEdit || isPreviewMode}
                  />
                </td>
                <td className="px-4 py-2">
                  <Input
                    type="number"
                    min="0"
                    value={item.quantity === 0 ? "" : item.quantity}
                    onChange={(e) => {
                      const val = e.target.value;
                      onItemChange(
                        index,
                        "quantity",
                        val === "" ? 0 : Math.max(0, Number(val)),
                      );
                    }}
                    className={cn("h-8", previewInputClass)}
                    disabled={!canEdit || isPreviewMode}
                  />
                </td>
                <td className="px-4 py-2">
                  <Input
                    value={item.materialShortage}
                    onChange={(e) =>
                      onItemChange(index, "materialShortage", e.target.value)
                    }
                    placeholder="Y/N or reason"
                    className={cn(
                      "h-8",
                      previewInputClass,
                      isPreviewMode && "truncate max-w-[150px]",
                    )}
                    title={item.materialShortage}
                    disabled={!canEdit || isPreviewMode}
                  />
                </td>
                <td className="px-4 py-2">
                  <Input
                    value={item.equipmentIssue}
                    onChange={(e) =>
                      onItemChange(index, "equipmentIssue", e.target.value)
                    }
                    placeholder="Y/N or reason"
                    className={cn(
                      "h-8",
                      previewInputClass,
                      isPreviewMode && "truncate max-w-[150px]",
                    )}
                    title={item.equipmentIssue}
                    disabled={!canEdit || isPreviewMode}
                  />
                </td>
                {canEdit && (
                  <td className="px-4 py-2 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                      onClick={() => onDeleteItem(index)}
                      disabled={draftJob.items.length === 1}
                      title={
                        draftJob.items.length === 1
                          ? "Cannot delete the last item"
                          : "Delete Item"
                      }
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </td>
                )}
              </tr>
            ))}
            {draftJob.items.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No items. Click &quot;Add Item&quot; to begin.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
