import { PageBody, PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";

/**
 * Placeholder landing route for the authenticated shell.
 *
 * It exists so `app/page.tsx`'s redirect resolves and the rail has an active
 * item to mark — not as a design for the inquiry queue. The real screen is
 * PRD-002..PRD-007 work and starts with a `/impeccable shape` brief, not by
 * extending this file.
 *
 * A Server Component with no data access, deliberately: nothing in this repo
 * talks to Postgres yet, and a fixture layer here would be the very
 * delete-on-wiring scaffolding CuevikSync was scaffolded to avoid.
 */
export default function InquiriesPage() {
  return (
    <>
      <PageBody>
        <PageHeader
          title="Inquiries"
          description="The shared inbound queue. Not built yet."
        />
        <EmptyState>
          <p>
            The inquiry queue is not implemented. This route exists so the app
            shell has a landing page while the capture path is built.
          </p>
        </EmptyState>
      </PageBody>
    </>
  );
}
