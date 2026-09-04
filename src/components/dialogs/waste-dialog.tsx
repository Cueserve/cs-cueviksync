"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { SearchInput } from "@/components/ui/search-input";
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
import { cn } from "@/lib/utils";
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
  const [jobSearch, setJobSearch] = useState("");
  const [modalSpoilage, setModalSpoilage] = useState("0");
  const [modalReprint, setModalReprint] = useState(false);
  const [modalNotes, setModalNotes] = useState("");

  const filteredJobs = React.useMemo(() => {
    if (!jobSearch.trim()) return jobs;
    const term = jobSearch.toLowerCase();
    return jobs.filter((j) => {
      const matchNo = j.jobNo.toLowerCase().includes(term);
      const matchItems = j.items.some((i) =>
        i.itemDescription.toLowerCase().includes(term),
      );
      return matchNo || matchItems;
    });
  }, [jobs, jobSearch]);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Focus search input when dropdown opens
  React.useEffect(() => {
    if (isDropdownOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isDropdownOpen]);

  const selectedJob = jobs.find((j) => j.id === selectedJobId);
  const selectedJobSummary = selectedJob
    ? `${selectedJob.jobNo} - ${selectedJob.items.length} ${
        selectedJob.items.length === 1 ? "item" : "items"
      }${
        selectedJob.items[0]?.itemDescription
          ? ` - ${selectedJob.items[0].itemDescription}`
          : ""
      }`
    : "";

  const handleSelectJob = (jId: string) => {
    setSelectedJobId(jId);
    setIsDropdownOpen(false);
    const found = jobs.find((j) => j.id === jId);
    if (found) {
      setModalSpoilage(found.spoilagePercent.toString());
      setModalReprint(found.reprintRequired);
      setModalNotes(found.notes || "");
    }
  };

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
    <form onSubmit={handleSaveLog} className="w-full min-w-0 overflow-visible">
      <DialogHeader>
        <DialogTitle>Log Waste / Rework</DialogTitle>
      </DialogHeader>
      <DialogBody className="grid gap-4 py-4 w-full min-w-0 overflow-visible">
        <div
          className="flex flex-col gap-1.5 relative w-full min-w-0"
          ref={dropdownRef}
        >
          <label className="text-sm font-medium">
            Select Job <span className="text-destructive">*</span>
          </label>

          {/* Trigger Button */}
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex h-9 w-full min-w-0 items-center justify-between rounded-md border border-input bg-card px-3 py-1 text-sm shadow-sm transition-colors hover:bg-muted/40 focus:outline-none focus:ring-1 focus:ring-ring text-left"
          >
            <span
              className={cn(
                "w-0 flex-1 truncate",
                selectedJobSummary
                  ? "text-foreground font-medium"
                  : "text-muted-foreground",
              )}
            >
              {selectedJobSummary || "-- Choose a job --"}
            </span>
            <span className="ml-2 shrink-0 text-muted-foreground text-xs">
              ▼
            </span>
          </button>

          {/* Hidden input to enforce form required validation without layout shift */}
          <input type="hidden" name="jobId" value={selectedJobId} />

          {/* Dropdown Menu with Searchbar Inside */}
          {isDropdownOpen && (
            <div className="absolute top-[66px] left-0 right-0 z-[100] rounded-md border border-border bg-popover text-popover-foreground shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95">
              <div className="p-2 border-b border-border bg-muted/30">
                <SearchInput
                  ref={searchInputRef}
                  placeholder="Search job # or item..."
                  value={jobSearch}
                  onChange={(e) => setJobSearch(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="max-h-56 overflow-y-auto p-1 divide-y divide-border/20">
                {filteredJobs.length === 0 ? (
                  <div className="py-4 text-center text-xs text-muted-foreground">
                    No matching jobs found
                  </div>
                ) : (
                  filteredJobs.map((j) => {
                    const isSelected = j.id === selectedJobId;
                    const itemsDesc = j.items
                      .map((i) => i.itemDescription)
                      .filter(Boolean)
                      .join(", ");

                    return (
                      <button
                        key={j.id}
                        type="button"
                        onClick={() => handleSelectJob(j.id)}
                        className={`w-full text-left px-3 py-2 text-xs rounded hover:bg-accent hover:text-accent-foreground transition-colors flex flex-col gap-0.5 ${
                          isSelected ? "bg-accent/70 font-semibold" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-foreground">
                            {j.jobNo}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {j.items.length}{" "}
                            {j.items.length === 1 ? "item" : "items"}
                          </span>
                        </div>
                        {itemsDesc && (
                          <div
                            className="text-muted-foreground truncate w-full min-w-0"
                            title={itemsDesc}
                          >
                            {itemsDesc}
                          </div>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1.5 w-full min-w-0">
          <label htmlFor="modalSpoilage" className="text-sm font-medium">
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
            className="bg-card border-input focus-visible:ring-ring font-mono w-full min-w-0"
            required
          />
        </div>

        <div className="flex items-center gap-2 py-1 w-full min-w-0">
          <Checkbox
            id="modalReprint"
            checked={modalReprint}
            onCheckedChange={(checked) => setModalReprint(!!checked)}
          />
          <label
            htmlFor="modalReprint"
            className="text-sm text-foreground select-none cursor-pointer font-medium truncate"
          >
            Reprint Required{" "}
            <span className="text-xs text-muted-foreground font-normal">
              (Flag reprint needed)
            </span>
          </label>
        </div>

        <div className="flex flex-col gap-1.5 w-full min-w-0">
          <label htmlFor="modalNotes" className="text-sm font-medium">
            Quality Notes
          </label>
          <Input
            id="modalNotes"
            value={modalNotes}
            onChange={(e) => setModalNotes(e.target.value)}
            className="bg-card border-input focus-visible:ring-ring w-full min-w-0"
            placeholder="e.g. Printer misalignment"
          />
        </div>
      </DialogBody>
      <DialogFooter className="w-full">
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
      <DialogContent className="sm:max-w-[480px] overflow-visible">
        {open && (
          <WasteDialogForm jobs={jobs} onClose={() => onOpenChange(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}
