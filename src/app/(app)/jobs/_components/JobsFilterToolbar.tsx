import React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";

export type JobStatusTab =
  "all" | "pending" | "completed" | "this-week" | "archived";

interface JobsFilterToolbarProps {
  selectedTab: JobStatusTab;
  onTabChange: (tab: JobStatusTab) => void;
  hasActiveDateFilters: boolean;
  onClearDateFilters: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
}

const TABS: JobStatusTab[] = [
  "all",
  "pending",
  "completed",
  "this-week",
  "archived",
];

export function JobsFilterToolbar({
  selectedTab,
  onTabChange,
  hasActiveDateFilters,
  onClearDateFilters,
  searchValue,
  onSearchChange,
}: JobsFilterToolbarProps) {
  return (
    <div className="flex items-center justify-between border-b border-border mt-8">
      <div className="flex">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={cn(
              "px-4 py-2 text-sm font-semibold transition-colors border-b-2 -mb-[2px] capitalize",
              selectedTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.replace("-", " ")}
          </button>
        ))}
      </div>
      <div className="pb-2 flex items-center gap-2">
        {hasActiveDateFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearDateFilters}
            className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5 mr-1" />
            Clear Date Filters
          </Button>
        )}
        <SearchInput
          placeholder="Search jobs..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-[250px]"
        />
      </div>
    </div>
  );
}
