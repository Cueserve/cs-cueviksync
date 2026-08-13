import React from "react";

interface TableEmptyStateProps {
  colSpan: number;
  message: string;
}

export function TableEmptyState({ colSpan, message }: TableEmptyStateProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="p-8 text-center text-muted-foreground">
        {message}
      </td>
    </tr>
  );
}
