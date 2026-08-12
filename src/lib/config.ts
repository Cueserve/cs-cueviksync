import { z } from "zod";

/**
 * Validated environment configuration.
 *
 * Every variable is read as a literal `process.env.NAME` expression rather than
 * a dynamic lookup, because the Next bundler substitutes NEXT_PUBLIC_* values by
 * matching that exact text. `process.env[name]` would silently yield undefined in
 * the browser bundle.
 *
 * Only the two PUBLIC values live here, because this module is imported by
 * `src/lib/supabase/client.ts` and therefore reaches the browser. The
 * server-only secrets are validated separately in `src/lib/config.server.ts`,
 * which is guarded by `server-only`.
 */
const envSchema = z.object({
  supabaseUrl: z.url(),
  supabaseAnonKey: z.string().min(1),
});

const parsed = envSchema.safeParse({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
    .join("\n");

  // Fail at startup rather than surfacing as an opaque Supabase error on the
  // first query. Missing configuration is not a runtime condition to handle.
  throw new Error(
    `Invalid environment configuration:\n${details}\n\n` +
      "Copy .env.example to .env.local and fill in the values from your Supabase " +
      "project (Dashboard -> Project Settings -> API).",
  );
}

export const env = parsed.data;
