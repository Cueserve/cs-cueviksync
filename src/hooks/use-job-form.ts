import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { addJob, updateJob as updateJobAction } from "@/server/actions/jobs";
import type { JobWithItems } from "@/lib/types/jobs";
import type { Database } from "@/lib/supabase/types";
import { calculateJobFormulas } from "@/lib/job-formulas";

type JobLineItemInsert =
  Database["public"]["Tables"]["job_line_items"]["Insert"];
type JobInsert = Database["public"]["Tables"]["jobs"]["Insert"];
type JobUpdate = Database["public"]["Tables"]["jobs"]["Update"];

export function useJobForm(
  initialJob: JobWithItems | null,
  canEdit: boolean,
  isNewRoute?: boolean,
) {
  const router = useRouter();

  const isNew = isNewRoute ?? !initialJob;
  const existingJob = initialJob;

  const [draftJob, setDraftJob] = useState<JobWithItems>(() => {
    if (existingJob) return structuredClone(existingJob);
    return {
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
          id: crypto.randomUUID(),
          job_id: "",
          lineNo: 1,
          itemDescription: "",
          quantity: 0,
          materialShortage: null,
          equipmentIssue: null,
        },
      ],
    };
  });

  // Adjust state during render when existingJob changes (official React recommended pattern)
  const [prevJobId, setPrevJobId] = useState(existingJob?.id);
  if (existingJob && existingJob.id !== prevJobId) {
    setPrevJobId(existingJob.id);
    setDraftJob(structuredClone(existingJob));
  }

  // Derive preview mode: if !canEdit, always preview; otherwise follow user state
  const [userPreviewMode, setUserPreviewMode] = useState(false);
  const isPreviewMode = !canEdit || userPreviewMode;
  const setIsPreviewMode = (val: boolean) => setUserPreviewMode(val);

  const handleUpdateField = <K extends keyof JobWithItems>(
    field: K,
    value: JobWithItems[K],
  ) => {
    setDraftJob((prev) => {
      const val =
        (field === "completedDate" || field === "deliveredDate") && value === ""
          ? null
          : value;
      const next = { ...prev, [field]: val };

      if (field === "orderDate" && typeof value === "string" && value) {
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
        if (value && typeof value === "string") {
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

      // If the job is not overdue or delivered late, reset overdueReason to null
      const { isOverdueOrLate } = calculateJobFormulas(next);
      if (!isOverdueOrLate) {
        next.overdueReason = null;
      }

      return next as JobWithItems;
    });
  };

  const handleItemChange = <K extends keyof JobWithItems["items"][0]>(
    index: number,
    field: K,
    value: JobWithItems["items"][0][K],
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
        id: crypto.randomUUID(),
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

    const { isOverdueOrLate: isJobOverdueOrLate } =
      calculateJobFormulas(draftJob);
    const sanitizedJobData = {
      jobNo: draftJob.jobNo,
      orderDate: draftJob.orderDate,
      promisedDate: draftJob.promisedDate,
      completedDate: draftJob.completedDate || null,
      deliveredDate: draftJob.deliveredDate || null,
      overdueReason: isJobOverdueOrLate ? draftJob.overdueReason : null,
      inThisWeek: draftJob.inThisWeek,
      invoiceValue: draftJob.invoiceValue,
      spoilagePercent: draftJob.spoilagePercent,
      reprintRequired: draftJob.reprintRequired,
      notes: draftJob.notes,
    };

    if (isNew) {
      const sanitizedJob: JobInsert = {
        ...sanitizedJobData,
        id: crypto.randomUUID(),
      };
      const res = await addJob(
        sanitizedJob,
        draftJob.items.map((i) => ({
          id: i.id,
          job_id: "",
          lineNo: i.lineNo,
          itemDescription: i.itemDescription,
          quantity: i.quantity,
          materialShortage: i.materialShortage,
          equipmentIssue: i.equipmentIssue,
        })),
      );
      if (!res?.success) {
        console.error("Failed to add job:", res?.error);
        toast.error(`Failed to add job: ${res?.error}`);
        return;
      }
      toast.success("Job created successfully!");
    } else {
      const sanitizedJob: JobUpdate = sanitizedJobData;
      const originalItems = existingJob?.items || [];
      const currentItemIds = new Set(draftJob.items.map((i) => i.id));
      const itemsToDelete = originalItems
        .filter((i) => !currentItemIds.has(i.id))
        .map((i) => i.id);

      const itemsToUpsert: JobLineItemInsert[] = draftJob.items.map((i) => ({
        id: i.id,
        job_id: draftJob.id,
        lineNo: i.lineNo,
        itemDescription: i.itemDescription,
        quantity: i.quantity,
        materialShortage: i.materialShortage,
        equipmentIssue: i.equipmentIssue,
      }));

      const res = await updateJobAction(
        draftJob.id,
        sanitizedJob,
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
  };
}
