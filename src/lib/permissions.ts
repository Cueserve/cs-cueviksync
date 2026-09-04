import type { Database } from "@/lib/supabase/types";

export type UserRole = Database["public"]["Enums"]["user_role"] | "viewer";

/**
 * Explicit list of roles authorized to create, edit, or delete jobs.
 * Matches database RLS policies.
 */
export const JOB_EDIT_ROLES = [
  "owner_admin",
  "office_admin",
  "sales_manager",
] as const;

export type JobEditRole = (typeof JOB_EDIT_ROLES)[number];

/**
 * Returns true if the given role is authorized to create, update, or delete jobs.
 * Secure by default: returns false for null, undefined, or unauthorized roles.
 */
export function canEditJobs(role: string | null | undefined): boolean {
  if (!role) return false;
  return (JOB_EDIT_ROLES as readonly string[]).includes(role);
}
