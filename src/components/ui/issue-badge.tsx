import React from "react";
import { AlertTriangle, Settings, Check } from "lucide-react";

interface IssueBadgeProps {
  type: "material" | "equipment";
  text?: string;
}

export function IssueBadge({ type, text }: IssueBadgeProps) {
  const formattedText = text
    ? text.toLowerCase() === "yes"
      ? "Y"
      : text.toLowerCase().startsWith("yes")
        ? "Y" + text.slice(3)
        : text
    : "";

  if (type === "material") {
    return text && text.toLowerCase() !== "no" ? (
      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-warning/10 text-warning border border-warning/20">
        <AlertTriangle className="size-3 shrink-0" />
        {formattedText}
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-success/10 text-success border border-success/20">
        <Check className="size-3 shrink-0" /> N
      </span>
    );
  }

  // Equipment type
  const isBroken = text && text.toLowerCase() !== "no";
  return isBroken ? (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20">
      <Settings className="size-3 shrink-0 animate-spin" />
      {formattedText}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-success/10 text-success border border-success/20">
      <Check className="size-3 shrink-0" /> N
    </span>
  );
}
