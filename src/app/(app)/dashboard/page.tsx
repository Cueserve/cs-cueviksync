import { PageBody, PageHeader } from "@/components/layout/page-header";

import { DashboardPeriodView } from "./_components/DashboardPeriodView";

/**
 * Concept dashboard -- a pitch artifact for a future PRD, not a preview of a
 * screen about to be wired up. Confirmed via `/impeccable shape` on
 * 2026-08-14: Jobs is grounded in the committed PRD-043 weekly KPI summary;
 * Sales and Finance are speculative, invented for this mockup, and have no
 * data model in this repo (PRODUCT.md §4 puts Sales reporting on the
 * post-thin-core roadmap and Finance/accounting permanently out of scope).
 *
 * A Server Component with hardcoded sample data, same reasoning as
 * `inquiries/page.tsx`: nothing here talks to Postgres, and a fixture layer
 * pretending otherwise would be the delete-on-wiring scaffolding this repo
 * was scaffolded to avoid. The period toggle is the one client boundary --
 * see `_components/DashboardPeriodView.tsx`.
 */
export default function DashboardPage() {
  return (
    <PageBody>
      <PageHeader
        title="Dashboard"
        description="Weekly, monthly, and quarterly KPIs across Sales, Jobs, and Finance."
      />
      <DashboardPeriodView />
    </PageBody>
  );
}
