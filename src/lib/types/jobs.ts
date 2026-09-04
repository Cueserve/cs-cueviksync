import type { Database } from "@/lib/supabase/types";

export type JobRow = Database["public"]["Tables"]["jobs"]["Row"];
export type JobLineItemRow =
  Database["public"]["Tables"]["job_line_items"]["Row"];

export type JobInsert = Database["public"]["Tables"]["jobs"]["Insert"];
export type JobUpdate = Database["public"]["Tables"]["jobs"]["Update"];
export type JobLineItemInsert =
  Database["public"]["Tables"]["job_line_items"]["Insert"];
export type JobLineItemUpdate =
  Database["public"]["Tables"]["job_line_items"]["Update"];

export type JobWithItems = JobRow & {
  items: JobLineItemRow[];
};
