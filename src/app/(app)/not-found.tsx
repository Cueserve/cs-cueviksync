import Link from "next/link";

import { PageBody } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/**
 * The not-found boundary for every authenticated route — what `notFound()` in
 * a detail route renders.
 *
 * LOAD-BEARING RULE, inherited from RedyQuote where it was found the hard way:
 * a `loading.tsx` sitting at a bare route segment wraps the whole subtree
 * including `[id]`, so the response streams, the 200 is committed, and a later
 * `notFound()` renders this page *under a 200*. The fix is a `(list)` route
 * group that keeps the list's loading UI off the detail routes — see
 * docs/PROJECT-STRUCTURE.md §4, "List loading boundary rule".
 *
 * So: no `loading.tsx` at `<route>/` or at `<route>/[id]/`. Detail routes use
 * `LinkPending` for navigation feedback instead. Measure the status code, do
 * not assume it — RedyQuote measured 200 where it expected 404.
 *
 * The copy stays vague on purpose. Under RLS a user may simply not be able to
 * see a record that exists, and a 404 that distinguished "does not exist" from
 * "not yours" would leak tenant membership (ARCHITECTURE.md §7).
 */
export default function AppNotFound() {
  return (
    <PageBody>
      <Card className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-md font-semibold">Not Found.</h1>
          <p className="text-sm text-muted-foreground">
            That record does not exist, or the link is out of date.
          </p>
        </div>
        <div>
          <Button asChild variant="outline">
            <Link href="/inquiries">Back to inquiries</Link>
          </Button>
        </div>
      </Card>
    </PageBody>
  );
}
