import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  addJob,
  updateJob as updateJobAction,
} from "@/app/actions/job-actions";
import type { JobWithItems } from "@/app/(app)/jobs/_components/JobsDashboardClient";
import type { Database } from "@/lib/supabase/types";

type JobLineItemInsert =
  Database["public"]["Tables"]["job_line_items"]["Insert"];
type JobInsert = Database["public"]["Tables"]["jobs"]["Insert"];

export function useJobForm(
  initialJob: JobWithItems | null,
  canEdit: boolean,
  allJobs: JobWithItems[],
  isNewRoute?: boolean,
) {
  const router = useRouter();

  const isNew = isNewRoute ?? !initialJob;
  const existingJob = initialJob;

  const [draftJob, setDraftJob] = useState<JobWithItems>({
    id: "",
    jobNo: "",
    orderDate: new Date().toISOString().split("T")[0],
    promisedDate: "",
    completedDate: null,
    deliveredDate: null,
    overdueReason: null,
    inThisWeek: false,
    invoiceValue: 0,
    spoilagePercent: 0,
    reprintRequired: false,
    notes: null,
    deleted_at: null,
    created_at: "",
    updated_at: "",
    items: [
      {
        id: "temp-1",
        job_id: "",
        lineNo: 1,
        itemDescription: "",
        quantity: 0,
        materialShortage: null,
        equipmentIssue: null,
      },
    ],
  });

  const [isPreviewMode, setIsPreviewMode] = useState(!canEdit);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!canEdit) setIsPreviewMode(true);
  }, [canEdit]);

  useEffect(() => {
    if (existingJob) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDraftJob(JSON.parse(JSON.stringify(existingJob))); // deep copy
    }
  }, [existingJob]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUpdateField = (field: keyof JobWithItems, value: any) => {
    setDraftJob((prev) => {
      const next = { ...prev, [field]: value };

      if (field === "orderDate" && value) {
        if (
          next.promisedDate &&
          new Date(value) > new Date(next.promisedDate)
        ) {
          next.promisedDate = "";
        }
        if (
          next.completedDate &&
          new Date(value) > new Date(next.completedDate)
        ) {
          next.completedDate = null;
          next.deliveredDate = null;
        }
      }

      if (field === "completedDate") {
        if (value) {
          if (
            !next.deliveredDate ||
            new Date(value) > new Date(next.deliveredDate)
          ) {
            next.deliveredDate = value;
          }
        } else {
          next.deliveredDate = null;
        }
      }

      return next as JobWithItems;
    });
  };

  const handleItemChange = (
    index: number,
    field: keyof JobWithItems["items"][0],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
  ) => {
    setDraftJob((prev) => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, items: newItems };
    });
  };

  const handleAddItem = () => {
    setDraftJob((prev) => {
      const newLineNo =
        prev.items.length > 0
          ? Math.max(...prev.items.map((i) => i.lineNo)) + 1
          : 1;
      const newItem: JobLineItemInsert = {
        id: `temp-${Date.now()}`,
        job_id: prev.id,
        lineNo: newLineNo,
        itemDescription: "",
        quantity: 0,
        materialShortage: null,
        equipmentIssue: null,
      };
      return {
        ...prev,
        items: [...prev.items, newItem as JobWithItems["items"][0]],
      };
    });
  };

  const handleDeleteItem = (index: number) => {
    setDraftJob((prev) => {
      const newItems = [...prev.items];
      newItems.splice(index, 1);
      // Reindex line numbers
      newItems.forEach((item, i) => {
        item.lineNo = i + 1;
      });
      return { ...prev, items: newItems };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    // Job number is generated securely on the server now
    if (!draftJob.orderDate) {
      toast.warning("Order Date is required");
      return;
    }
    if (!draftJob.promisedDate) {
      toast.warning("Promised Date is required");
      return;
    }
    const validItemsCount = draftJob.items.filter(
      (item) => item.itemDescription.trim() && item.quantity > 0,
    ).length;

    if (validItemsCount === 0) {
      toast.warning("At least one line item is necessary.");
      return;
    }

    const hasInvalidItem = draftJob.items.some(
      (item) => !item.itemDescription.trim() || item.quantity <= 0,
    );
    if (hasInvalidItem) {
      toast.warning(
        "Description and quantity are required for all line items.",
      );
      return;
    }
    if (
      draftJob.completedDate &&
      draftJob.deliveredDate &&
      new Date(draftJob.deliveredDate) < new Date(draftJob.completedDate)
    ) {
      toast.warning("Delivered date cannot be earlier than Completed date.");
      return;
    }

    if (isNew) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { items, id, created_at, updated_at, ...jobWithoutItems } =
        draftJob;
      const res = await addJob(
        jobWithoutItems as JobInsert,
        items.map((i) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id: _id, job_id, ...itemWithoutId } = i;
          return itemWithoutId as JobLineItemInsert;
        }),
      );
      if (!res?.success) {
        console.error("Failed to add job:", res?.error);
        toast.error(`Failed to add job: ${res?.error}`);
        return;
      }
      toast.success("Job created successfully!");
    } else {
      const { items, ...jobWithoutItems } = draftJob;
      const originalItems = existingJob?.items || [];
      const currentItemIds = items
        .map((i) => i.id)
        .filter((id) => !id.startsWith("temp-"));
      const itemsToDelete = originalItems
        .filter((i) => !currentItemIds.includes(i.id))
        .map((i) => i.id);

      const itemsToUpsert = items.map((i) => {
        if (i.id.startsWith("temp-")) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id: _id, ...itemWithoutId } = i;
          return { ...itemWithoutId, job_id: draftJob.id } as JobLineItemInsert;
        }
        return { ...i, job_id: draftJob.id } as JobLineItemInsert;
      });

      const res = await updateJobAction(
        draftJob.id,
        jobWithoutItems,
        itemsToUpsert,
        itemsToDelete,
      );
      if (!res?.success) {
        console.error("Failed to update job:", res?.error);
        toast.error(`Failed to update job: ${res?.error}`);
        return;
      }
      toast.success("Job updated successfully!");
    }
    router.push("/jobs");
  };

  return {
    isNew,
    existingJob,
    canEdit,
    draftJob,
    isPreviewMode,
    setIsPreviewMode,
    handleUpdateField,
    handleItemChange,
    handleAddItem,
    handleDeleteItem,
    handleSubmit,
    jobs: allJobs, // exposing jobs just in case for validation
  };
}
