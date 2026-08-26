"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Hash, ArrowLeft } from "lucide-react";
import { useJobForm } from "@/hooks/use-job-form";
import { JobLineItemsTable } from "./_components/JobLineItemsTable";
import { JobSummaryPane } from "./_components/JobSummaryPane";
import { JobDetailsForm } from "./_components/JobDetailsForm";
import { JobWasteAndNotesForm } from "./_components/JobWasteAndNotesForm";

export default function JobDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const {
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
    jobs,
  } = useJobForm(id);

  if (!isNew && !existingJob) {
    return (
      <div className="p-8">
        <p>Job not found.</p>
        <Button onClick={() => router.push("/jobs")}>Back to Jobs</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto w-full mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="mb-2 text-muted-foreground -ml-2 hover:bg-transparent"
            onClick={() => router.push("/jobs")}
          >
            <ArrowLeft className="size-4 mr-1" /> Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Hash className="size-8 text-primary" />
            {isNew ? "New Job" : `Job Details: ${draftJob.jobNo}`}
          </h1>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Form & Items */}
        <div className="lg:col-span-2 space-y-6">
          <JobDetailsForm
            draftJob={draftJob}
            canEdit={canEdit}
            isPreviewMode={isPreviewMode}
            jobs={jobs}
            handleUpdateField={handleUpdateField}
          />

          <JobLineItemsTable
            draftJob={draftJob}
            canEdit={canEdit}
            isPreviewMode={isPreviewMode}
            onAddItem={handleAddItem}
            onItemChange={handleItemChange}
            onDeleteItem={handleDeleteItem}
          />

          <JobWasteAndNotesForm
            draftJob={draftJob}
            canEdit={canEdit}
            isPreviewMode={isPreviewMode}
            handleUpdateField={handleUpdateField}
          />
        </div>

        {/* Right Column: Live Summary */}
        <JobSummaryPane
          draftJob={draftJob}
          canEdit={canEdit}
          isPreviewMode={isPreviewMode}
          onTogglePreview={() => setIsPreviewMode(!isPreviewMode)}
          onSubmit={handleSubmit}
          onDiscard={() => router.push("/jobs")}
        />
      </div>
    </div>
  );
}
