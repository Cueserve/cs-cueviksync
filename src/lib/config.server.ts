import "server-only";

import { z } from "zod";

/**
 * Server-only environment configuration.
 *
 * Split from `@/lib/config` because that module is imported by the browser
 * Supabase client, where these three variables are legitimately undefined —
 * Next does not inline a non-NEXT_PUBLIC_ value into the client bundle.
 * Validating them in the shared schema would throw on every browser render.
 *
 * `import "server-only"` turns an accidental client import into a build error
 * rather than a runtime leak. That is the whole reason this is a second file
 * and not three more keys in the schema next door.
 */
const serverEnvSchema = z.object({
  serviceRoleKey: z.string().min(1),
  dbUrl: z.string().min(1),
  intakeKeySecret: z.string().min(1),
});

const parsed = serverEnvSchema.safeParse({
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  dbUrl: process.env.SUPABASE_DB_URL,
  intakeKeySecret: process.env.INTAKE_KEY_SECRET,
});

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
    .join("\n");

  throw new Error(
    `Invalid server environment configuration:\n${details}\n\n` +
      "See .env.example for the server-only keys.",
  );
}

export const serverEnv = parsed.data;
