import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { env } from "@/lib/config";
import { serverEnv } from "@/lib/config.server";

import type { Database } from "./types";

/**
 * RLS-bypassing Supabase client. Confined to the three system paths named in
 * docs/ARCHITECTURE.md §5: the Intake Receiver, the Ingestion Worker, and
 * tenant provisioning.
 *
 * Every one of those paths MUST re-apply `tenant_id` in code from a
 * server-resolved value. This client has no session, so RLS does not scope it —
 * a missing filter here is a cross-tenant leak, not an empty result set. That
 * inversion is the entire reason it lives in its own module behind
 * `server-only` rather than beside the user-scoped client in `./server`, where
 * it would be one autocomplete away from any request handler.
 *
 * If you are reaching for this from a Server Action that serves an
 * authenticated user, you want `./server` instead.
 *
 * `persistSession` and `autoRefreshToken` are off deliberately: there is no
 * user session to persist, and leaving them on would have the client write
 * token state for an identity that does not exist.
 */
export function createServiceRoleClient() {
  return createSupabaseClient<Database>(
    env.supabaseUrl,
    serverEnv.serviceRoleKey,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
