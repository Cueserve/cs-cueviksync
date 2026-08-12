import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { env } from "@/lib/config";

import type { Database } from "./types";

/**
 * Session-bound server Supabase client — Server Components and Server Actions.
 *
 * Carries the user's session, so RLS evaluates every statement.
 *
 * The elevated, RLS-bypassing client is a separate module — `./service-role` —
 * and is confined to the three system paths (Intake Receiver, Ingestion Worker,
 * provisioning) named in docs/ARCHITECTURE.md §5. It is deliberately not
 * reachable from this function: under it, a missing `tenant_id` filter is a
 * cross-tenant leak rather than an empty result set.
 *
 * Must be called per request — never hoisted to a module-level singleton, which
 * would share one user's session across requests.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components get a read-only cookie store, so a token refresh
          // cannot be written back here. Safe to ignore: src/proxy.ts refreshes
          // the session on every matched request and writes the cookies there.
        }
      },
    },
  });
}
