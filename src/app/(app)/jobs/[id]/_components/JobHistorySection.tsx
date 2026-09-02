"use client";

import React, { useState } from "react";
import { Clock } from "lucide-react";

const ExpandableText = ({ text }: { text: string }) => {
  const [expanded, setExpanded] = useState(false);

  if (text.length <= 100) {
    return <span>{text}</span>;
  }

  return (
    <span
      onClick={() => setExpanded(!expanded)}
      className="cursor-pointer transition-all hover:text-primary"
      title={expanded ? "Click to collapse" : "Click to expand"}
    >
      {expanded ? text : `${text.substring(0, 100)}...`}
    </span>
  );
};

const formatDateTime = (dateString: string) => {
  if (!dateString) return "Unknown Date";
  const date = new Date(dateString);
  const datePart = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timePart = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${datePart} at ${timePart}`;
};

type HistoryChange = {
  old?: unknown;
  new?: unknown;
};

export type JobHistoryEntry = {
  id: string;
  created_at: string;
  action_type: string;
  entity_type: string;
  entity_id: string;
  changes: Record<string, HistoryChange | unknown>;
  user: {
    full_name: string;
  };
};

export function JobHistorySection({ history }: { history: JobHistoryEntry[] }) {
  if (!history || history.length === 0) {
    return null;
  }

  // Format field names nicely
  const formatFieldName = (field: string) => {
    // Camel case to Title Case with spaces
    const result = field.replace(/([A-Z])/g, " $1");
    return result.charAt(0).toUpperCase() + result.slice(1);
  };

  return (
    <div className="mt-12 mb-8 bg-card rounded-xl border p-6">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="size-5 text-muted-foreground" />
        <h2 className="text-xl font-semibold text-foreground">
          Activity History
        </h2>
      </div>

      <div className="space-y-6">
        {history.map((entry) => (
          <div
            key={entry.id}
            className="flex gap-4 items-start relative pb-6 last:pb-0"
          >
            {/* Timeline line */}
            <div className="absolute left-[11px] top-6 bottom-0 w-px bg-border last:hidden" />

            {/* Timeline dot */}
            <div className="relative z-10 w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center shrink-0 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-primary/50" />
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  {entry.user?.full_name || "Unknown User"}
                  <span className="text-muted-foreground font-normal ml-1">
                    {entry.action_type === "INSERT"
                      ? "created"
                      : entry.action_type === "UPDATE"
                        ? "updated"
                        : "deleted"}{" "}
                    {entry.entity_type === "line_item"
                      ? "a line item"
                      : "the job"}
                  </span>
                </p>
                <span
                  className="text-xs text-muted-foreground"
                  suppressHydrationWarning
                >
                  {formatDateTime(entry.created_at)}
                </span>
              </div>

              {entry.action_type === "UPDATE" && entry.changes && (
                <div className="mt-2 space-y-2">
                  {Object.entries(entry.changes).map(([field, values]) => {
                    if (
                      values &&
                      typeof values === "object" &&
                      ("old" in values || "new" in values)
                    ) {
                      return (
                        <div
                          key={field}
                          className="text-sm bg-muted/30 p-2 rounded-md border text-muted-foreground break-all"
                        >
                          <span className="font-medium text-foreground">
                            {formatFieldName(field)}
                          </span>{" "}
                          changed from
                          <span className="font-medium text-foreground mx-1">
                            <ExpandableText
                              text={String(values.old ?? "empty")}
                            />
                          </span>{" "}
                          to
                          <span className="font-medium text-foreground ml-1">
                            <ExpandableText
                              text={String(values.new ?? "empty")}
                            />
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
