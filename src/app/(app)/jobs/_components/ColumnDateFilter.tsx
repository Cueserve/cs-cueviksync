"use client";

import React, { useState } from "react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ColumnDateFilterProps {
  title: string;
  from: string;
  to: string;
  onChange: (range: { from: string; to: string }) => void;
}

export function ColumnDateFilter({
  title,
  from,
  to,
  onChange,
}: ColumnDateFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempFrom, setTempFrom] = useState(from);
  const [tempTo, setTempTo] = useState(to);

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setTempFrom(from);
      setTempTo(to);
    }
    setIsOpen(open);
  };

  const hasFilter = !!(from || to);

  const handleApply = () => {
    onChange({ from: tempFrom, to: tempTo });
    setIsOpen(false);
  };

  const handleClear = () => {
    setTempFrom("");
    setTempTo("");
    onChange({ from: "", to: "" });
    setIsOpen(false);
  };

  return (
    <PopoverPrimitive.Root open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          title={`Filter by ${title}`}
          className={cn(
            "ml-1 px-1 py-0.5 rounded-sm transition-all cursor-pointer inline-flex items-center justify-center gap-0.5",
            hasFilter
              ? "bg-primary/20 text-primary ring-1 ring-primary/50 font-bold"
              : "text-muted-foreground/70 hover:text-foreground hover:bg-muted/80",
          )}
        >
          <span className="text-xs leading-none select-none">📅</span>
          {hasFilter && <span className="size-1.5 rounded-full bg-primary" />}
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={6}
          className="z-[9999] min-w-[240px] rounded-md border border-border bg-popover p-3 text-popover-foreground shadow-2xl animate-in fade-in-0 zoom-in-95 text-left font-sans"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-2 border-b border-border/60 mb-2.5">
            <span className="text-xs font-semibold text-foreground">
              Filter {title}
            </span>
            {hasFilter && (
              <button
                type="button"
                onClick={handleClear}
                className="text-[11px] text-destructive hover:underline cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <div className="space-y-2.5 text-xs">
            <div>
              <label className="text-[11px] text-muted-foreground block mb-1">
                From Date:
              </label>
              <input
                type="date"
                value={tempFrom}
                onChange={(e) => setTempFrom(e.target.value)}
                className="w-full h-8 px-2 rounded-sm border border-input bg-card text-xs text-foreground font-mono outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="text-[11px] text-muted-foreground block mb-1">
                To Date:
              </label>
              <input
                type="date"
                value={tempTo}
                onChange={(e) => setTempTo(e.target.value)}
                className="w-full h-8 px-2 rounded-sm border border-input bg-card text-xs text-foreground font-mono outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-1.5 mt-3 pt-2 border-t border-border/60">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground rounded-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-3 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Check className="size-3" />
              Apply
            </button>
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
