import React from "react";

interface StatusBadgeProps {
  value: string | boolean | undefined | null;
  fallback?: string;
}

export function StatusBadge({ value, fallback = "-" }: StatusBadgeProps) {
  if (value === undefined || value === null || value === "") {
    return <span className="text-muted-foreground">{fallback}</span>;
  }

  const normalized =
    typeof value === "boolean"
      ? value
        ? "Y"
        : "N"
      : value.trim().toUpperCase();

  if (normalized === "Y" || normalized === "YES") {
    return (
      <span className="inline-flex items-center rounded bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
        Y
      </span>
    );
  }

  if (normalized === "N" || normalized === "NO") {
    return (
      <span className="inline-flex items-center rounded bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
        N
      </span>
    );
  }

  return <span>{value}</span>;
}
