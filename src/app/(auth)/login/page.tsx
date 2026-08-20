import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

/**
 * PRD-001 — email/password via Supabase Auth. The only pre-session route.
 *
 * No submit handler: authentication is a Server Action away, and this pass is
 * design only. When it lands, this form gets `action={signIn}` pointing at
 * `src/server/actions/`, plus `useActionState` for the error string — the
 * markup below is already shaped for it (a named form, real `name` attributes,
 * a live region reserved for the error).
 *
 * There is no sign-up link and no password reset by design: accounts are
 * provisioned by an admin (PRD-001), so an unauthenticated visitor has nothing
 * to self-serve here.
 */
export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 py-12">
      <div className="flex flex-col items-center gap-1.5">
        {/* The colour lockup, and the one place in the app that gets it: this
            is the only surface with no chrome competing for attention, and it
            sits on `--background`, light enough for the light lockup (the
            brand kit forbids it on anything darker than ~#E8EDF1).

            Two files rather than one `currentColor` inline, because the
            two-tone fill IS the mark here -- flattening it to a single
            inherited colour would throw away the thing that makes it the
            master. `dark:` swaps to the variant whose ink is lifted for dark
            surfaces.

            `unoptimized` because the source is already an SVG: the optimizer
            has nothing to do with it, and routing an SVG through it would
            otherwise require `dangerouslyAllowSVG` in next.config -- a global
            loosening for zero gain. 220px clears the kit's 130px minimum. */}
        <h1 className="sr-only">CuevikSync</h1>
        <Image
          src="/brand/cueviksync-horizontal.svg"
          alt=""
          aria-hidden
          width={220}
          height={39}
          unoptimized
          className="dark:hidden"
        />
        <Image
          src="/brand/cueviksync-horizontal-dark.svg"
          alt=""
          aria-hidden
          width={220}
          height={39}
          unoptimized
          className="hidden dark:block"
        />
        <p className="text-sm text-muted-foreground">
          Capture every inbound inquiry and turn it into revenue.
        </p>
      </div>

      <Card className="w-full max-w-96">
        <form className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-semibold">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@yourcompany.com"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-semibold">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>

          {/* Reserved for the Server Action's error string. */}
          <p aria-live="polite" className="sr-only" />

          <Button type="submit" className="w-full">
            Sign in
          </Button>
        </form>
      </Card>

      <p className="text-xs text-muted-foreground">
        Accounts are provisioned by an administrator. Contact your admin if you
        cannot sign in.
      </p>

      {/* Scaffold-only shortcut past a form that cannot authenticate yet.
          Delete this link in the same change that wires the sign-in Server
          Action — it is a route into the app that bypasses a gate. */}
      <Link href="/inquiries" className="text-xs">
        Continue without signing in
      </Link>
    </div>
  );
}
