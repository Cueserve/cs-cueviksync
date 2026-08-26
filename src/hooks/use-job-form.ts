import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useTracker,
  type JobItem,
  type JobLineItem,
} from "@/components/providers/tracker-provider";

export function useJobForm(id: string) {
  const router = useRouter();
  const { jobs, addJob, updateJob, selectedRole } = useTracker();

  const isNew = id === "new";
  const existingJob = isNew ? null : jobs.find((j) => j.id === id);

  const canEdit =
    selectedRole === "admin" ||
    selectedRole === "operator" ||
    selectedRole === "manager";

  const [draftJob, setDraftJob] = useState<JobItem>({
    id: "",
    jobNo: "",
    orderDate: new Date().toISOString().split("T")[0],
    promisedDate: "",
    completedDate: "",
    deliveredDate: "",
    overdueReason: "",
    inThisWeek: false,
    invoiceValue: 0,
    spoilagePercent: 0,
    reprintRequired: false,
    notes: "",
    items: [
      {
        id: "temp-1",
        lineNo: 1,
        itemDescription: "",
        quantity: 0,
        materialShortage: "",
        equipmentIssue: "",
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
  const handleUpdateField = (field: keyof JobItem, value: any) => {
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
          next.completedDate = "";
          next.deliveredDate = "";
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
          next.deliveredDate = "";
        }
      }

      return next;
    });
  };

  const handleItemChange = (
    index: number,
    field: keyof JobLineItem,
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
      const newItem: JobLineItem = {
        id: `temp-${Date.now()}`,
        lineNo: newLineNo,
        itemDescription: "",
        quantity: 0,
        materialShortage: "",
        equipmentIssue: "",
      };
      return { ...prev, items: [...prev.items, newItem] };
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    if (!draftJob.jobNo) {
      alert("Job number is required");
      return;
    }
    const isDuplicateJobNo = jobs.some(
      (j) =>
        j.jobNo.trim().toLowerCase() === draftJob.jobNo.trim().toLowerCase() &&
        j.id !== draftJob.id,
    );
    if (isDuplicateJobNo) {
      alert("Job number already exists. Please choose a unique job number.");
      return;
    }
    if (!draftJob.orderDate) {
      alert("Order Date is required");
      return;
    }
    if (!draftJob.promisedDate) {
      alert("Promised Date is required");
      return;
    }
    const validItemsCount = draftJob.items.filter(
      (item) => item.itemDescription.trim() && item.quantity > 0,
    ).length;

    if (validItemsCount === 0) {
      alert("At least one line item is necessary.");
      return;
    }

    const hasInvalidItem = draftJob.items.some(
      (item) => !item.itemDescription.trim() || item.quantity <= 0,
    );
    if (hasInvalidItem) {
      alert("Description and quantity are required for all line items.");
      return;
    }
    if (
      draftJob.completedDate &&
      draftJob.deliveredDate &&
      new Date(draftJob.deliveredDate) < new Date(draftJob.completedDate)
    ) {
      alert("Delivered date cannot be earlier than Completed date.");
      return;
    }

    if (isNew) {
      addJob(draftJob);
    } else {
      updateJob(draftJob.id, draftJob);
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
    jobs, // exposing jobs just in case for validation
  };
}
