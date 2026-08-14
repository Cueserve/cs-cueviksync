/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect } from "react";
import {
  useTracker,
  type JobItem,
} from "@/components/providers/tracker-provider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogBody,
} from "@/components/ui/dialog";

interface IssueDialogProps {
  activeJob: JobItem | null;
  onOpenChange: (open: boolean) => void;
  canEdit: boolean;
}

export function IssueDialog({
  activeJob,
  onOpenChange,
  canEdit,
}: IssueDialogProps) {
  const { updateJobItem } = useTracker();

  const [materialShortage, setMaterialShortage] = useState("");
  const [equipmentIssue, setEquipmentIssue] = useState("");

  useEffect(() => {
    if (activeJob) {
      setMaterialShortage(activeJob.materialShortage);
      setEquipmentIssue(activeJob.equipmentIssue);
    }
  }, [activeJob]);

  const handleSave = () => {
    if (!canEdit || !activeJob) return;
    updateJobItem(activeJob.id, {
      materialShortage,
      equipmentIssue,
    });
    onOpenChange(false);
  };

  return (
    <Dialog
      open={!!activeJob}
      onOpenChange={(open) => {
        if (!open) {
          onOpenChange(false);
        }
      }}
    >
      <DialogContent
        className="sm:max-w-[425px]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Update Weekly Issue Logs</DialogTitle>
        </DialogHeader>
        <DialogBody className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label
              htmlFor="matShortage"
              className="text-right text-sm font-medium"
            >
              Material Shortage
            </label>
            <Input
              id="matShortage"
              value={materialShortage}
              onChange={(e) => setMaterialShortage(e.target.value)}
              className="col-span-3"
              placeholder="e.g. Awaiting paper shipment"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="eqIssue" className="text-right text-sm font-medium">
              Equip. Issue
            </label>
            <Input
              id="eqIssue"
              value={equipmentIssue}
              onChange={(e) => setEquipmentIssue(e.target.value)}
              className="col-span-3"
              placeholder="e.g. Press #2 out of alignment"
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            Save Logs
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
