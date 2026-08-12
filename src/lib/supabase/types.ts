/**
 * PLACEHOLDER — hand-authored, not generated.
 *
 * `npm run db:types` overwrites this file wholesale from the live schema. Until
 * CuevikSync has a linked Supabase project there is no schema to generate from,
 * and the client factories in this directory need a `Database` type to compile.
 *
 * Every table is typed as empty on purpose. A plausible-but-wrong schema here
 * would be worse than none: it would typecheck queries against tables that do
 * not exist, and the error would surface at runtime against a real database
 * instead of at build time.
 *
 * Delete this comment on the first real generation. If you are reading it and
 * migrations have been applied, the generation step was skipped — run
 * `npm run db:types`.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
