import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { type UserRole } from "@/lib/permissions";

export {
  canEditJobs,
  JOB_EDIT_ROLES,
  type UserRole,
  type JobEditRole,
} from "@/lib/permissions";

/**
 * Request-memoized helper to get the authenticated user.
 * Dedupes across layout, page, and nested components within the same request lifecycle.
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/**
 * Request-memoized helper to get the current user's role.
 * Executes once per request via get_user_role RPC (or profiles table) and caches for the remainder of the request.
 */
export const getCurrentUserRole = cache(async (): Promise<UserRole> => {
  const supabase = await createClient();
  const { data: roleData, error } = await supabase.rpc("get_user_role");

  if (error || !roleData) {
    const user = await getCurrentUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profile?.role) {
        return profile.role;
      }
    }
    return "viewer";
  }

  return roleData;
});
