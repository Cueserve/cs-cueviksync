import React from "react";

interface TableEmptyStateProps {
  colSpan: number;
  message: string;
}

export function TableEmptyState({ colSpan, message }: TableEmptyStateProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="p-8 text-muted-foreground">
        <div className="sticky left-10 inline-block font-medium">{message}</div>
      </td>
    </tr>
  );
}
