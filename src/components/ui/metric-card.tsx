import React from "react";
import { Card } from "./card";

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  valueClassName?: string;
}

export function MetricCard({
  title,
  value,
  description,
  icon,
  valueClassName,
}: MetricCardProps) {
  return (
    <Card padding="default">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{title}</span>
        {icon}
      </div>
      <div
        className={`text-2xl font-semibold mt-2 font-mono ${valueClassName || "text-foreground"}`}
      >
        {value}
      </div>
      {description && (
        <div className="text-xs text-muted-foreground mt-1">{description}</div>
      )}
    </Card>
  );
}
