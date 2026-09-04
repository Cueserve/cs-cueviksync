"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogBody,
} from "@/components/ui/dialog";

import { updateJob } from "@/server/actions/jobs";
import type { JobWithItems } from "@/lib/types/jobs";

interface WasteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobs: JobWithItems[];
}

function WasteDialogForm({
  jobs,
  onClose,
}: {
  jobs: JobWithItems[];
  onClose: () => void;
}) {
  const [selectedJobId, setSelectedJobId] = useState("");
  const [modalSpoilage, setModalSpoilage] = useState("0");
  const [modalReprint, setModalReprint] = useState(false);
  const [modalNotes, setModalNotes] = useState("");

  const handleSaveLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobId) return;
    await updateJob(selectedJobId, {
      spoilagePercent: parseFloat(modalSpoilage) || 0,
      reprintRequired: modalReprint,
      notes: modalNotes,
    });
    onClose();
  };

  return (
    <form onSubmit={handleSaveLog}>
      <DialogHeader>
        <DialogTitle>Log Waste / Rework</DialogTitle>
      </DialogHeader>
      <DialogBody className="grid gap-4 py-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="jobSelect" className="text-sm font-medium">
            Select Job <span className="text-destructive">*</span>
          </label>
          <select
            id="jobSelect"
            value={selectedJobId}
            onChange={(e) => {
              const jId = e.target.value;
              setSelectedJobId(jId);
              const found = jobs.find((j) => j.id === jId);
              if (found) {
                setModalSpoilage(found.spoilagePercent.toString());
                setModalReprint(found.reprintRequired);
                setModalNotes(found.notes || "");
              }
            }}
            required
            className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">-- Choose a job --</option>
            {jobs.map((j) => {
              const itemsDesc = j.items
                .map((i) => i.itemDescription)
                .filter(Boolean)
                .join(", ");
              const truncatedDesc =
                itemsDesc.length > 40
                  ? itemsDesc.substring(0, 40) + "..."
                  : itemsDesc;
              return (
                <option key={j.id} value={j.id}>
                  {j.jobNo} - {j.items.length}{" "}
                  {j.items.length === 1 ? "item" : "items"}
                  {truncatedDesc ? ` - ${truncatedDesc}` : ""}
                </option>
              );
            })}
          </select>
        </div>

        <div className="grid grid-cols-4 items-center gap-4 mt-2">
          <label
            htmlFor="modalSpoilage"
            className="text-sm font-medium text-right"
          >
            Spoilage % <span className="text-destructive">*</span>
          </label>
          <Input
            id="modalSpoilage"
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={modalSpoilage}
            onChange={(e) => {
              let val = e.target.value;
              const num = parseFloat(val);
              if (!isNaN(num)) {
                if (num > 100) val = "100";
                else if (num < 0) val = "0";
              }
              setModalSpoilage(val);
            }}
            className="col-span-3 bg-card border-input focus-visible:ring-ring font-mono"
            required
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <label className="text-sm font-medium text-right">Reprint?</label>
          <div className="col-span-3 flex items-center gap-2">
            <Checkbox
              id="modalReprint"
              checked={modalReprint}
              onCheckedChange={(checked) => setModalReprint(!!checked)}
            />
            <label
              htmlFor="modalReprint"
              className="text-xs text-muted-foreground select-none"
            >
              Flag reprint needed (Y/N)
            </label>
          </div>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <label
            htmlFor="modalNotes"
            className="text-sm font-medium text-right"
          >
            Quality Notes
          </label>
          <Input
            id="modalNotes"
            value={modalNotes}
            onChange={(e) => setModalNotes(e.target.value)}
            className="col-span-3 bg-card border-input focus-visible:ring-ring"
            placeholder="e.g. Printer misalignment"
          />
        </div>
      </DialogBody>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          Save Log
        </Button>
      </DialogFooter>
    </form>
  );
}

export function WasteDialog({ open, onOpenChange, jobs }: WasteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        {open && (
          <WasteDialogForm jobs={jobs} onClose={() => onOpenChange(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}
