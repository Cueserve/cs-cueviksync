"use client";

import { usePathname } from "next/navigation";
import {
  Building2,
  Inbox,
  KanbanSquare,
  SlidersHorizontal,
} from "lucide-react";

import { Sidebar, type SidebarNavItem } from "@/components/layout/sidebar";
import { Topbar, type Crumb } from "@/components/layout/topbar";
import { UserMenu } from "@/components/layout/user-menu";
import { TooltipProvider } from "@/components/ui/tooltip";

// The chrome from DESIGN-SYSTEM.md §9: a fixed 220px dark rail, a persistent
// breadcrumb top bar, and an independently-scrolling content area. Client-side
// because the rail needs the current pathname to mark the active item; the
// pages it wraps stay Server Components.
//
// Structurally identical to RedyQuote's AppChrome with one deliberate
// difference: there is no prototype layer here. RedyQuote wraps this in a
// client-side `RoleProvider` and swaps `UserMenu` for a `PrototypeUserMenu`
// that reads fixtures. CuevikSync was scaffolded after that pattern was
// identified as delete-on-wiring scaffolding, so it goes straight to the
// permanent `UserMenu` and takes its identity from props. Nothing to remove
// later.

const NAV: SidebarNavItem[] = [
  {
    label: "Inquiries",
    href: "/inquiries",
    icon: <Inbox className="size-4" />,
  },
  {
    label: "Contacts",
    href: "/contacts",
    icon: <Building2 className="size-4" />,
  },
  {
    label: "Pipeline",
    href: "/pipeline",
    icon: <KanbanSquare className="size-4" />,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: <SlidersHorizontal className="size-4" />,
  },
];

// Settings appears for every role on purpose. ARCHITECTURE.md §7 classifies
// tenant configuration as readable by any signed-in user and admin-only to
// edit, so the honest design shows the configuration a user's work is governed
// by and withholds the controls — not the page.

const SECTION_LABEL: Record<string, string> = {
  inquiries: "Inquiries",
  contacts: "Contacts",
  pipeline: "Pipeline",
  settings: "Settings",
};

/** Resolves the trailing crumb for a detail route: an id in the URL should read
 *  as the thing it identifies, not as a uuid. Until routes fetch real records,
 *  a detail crumb falls back to the section's singular noun — never the raw id,
 *  which is both unreadable and a tenant-scoped value we should not print. */
function leafLabel(section: string, id: string) {
  if (id === "new") {
    return (
      {
        inquiries: "New Inquiry",
        contacts: "New Contact",
        pipeline: "New Opportunity",
      }[section] ?? "New"
    );
  }
  return (
    {
      inquiries: "Inquiry",
      contacts: "Contact",
      pipeline: "Opportunity",
    }[section] ?? "Detail"
  );
}

function crumbsFor(pathname: string): Crumb[] {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return [{ label: "Home" }];

  const [section, id] = segments;
  // "Home" points at `/`, which today only redirects to `/inquiries` — see the
  // comment in `app/page.tsx`. Deliberately not hardcoded to `/inquiries`: that
  // route becomes a real session router once auth lands, and a crumb wired
  // straight past it would keep sending an admin to the default landing page.
  //
  // Topbar drops the `href` on whichever crumb ends up last, so the section
  // crumb is a link on `/inquiries/<id>` and plain text on `/inquiries` with no
  // branching here.
  const crumbs: Crumb[] = [
    { label: "Home", href: "/" },
    { label: SECTION_LABEL[section] ?? section, href: `/${section}` },
  ];
  if (id) crumbs.push({ label: leafLabel(section, id) });
  return crumbs;
}

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const activeHref = `/${pathname.split("/").filter(Boolean)[0] ?? ""}`;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="relative flex h-dvh overflow-hidden">
        {/* A plain fragment link, deliberately not `next/link`: it moves focus
            within the page, it does not navigate. Four stops of rail precede
            the content on every route (WCAG 2.4.1). */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-foreground focus:outline-none focus:ring-3 focus:ring-ring"
        >
          Skip to content
        </a>
        <Sidebar
          className="shrink-0"
          items={NAV}
          activeHref={activeHref}
          logo={
            // A text wordmark, not an `Image`. There is no CuevikSync logo file
            // yet, and a placeholder raster would be worse than type: it would
            // need `sizes`/`priority` tuning for an asset that is going to be
            // replaced, and a wrong-looking logo reads as a bug where a
            // wordmark reads as a decision. Swap this for `next/image` when a
            // real asset exists — the chip around it already assumes an opaque
            // mark (globals.css --sidebar-logo-chip).
            <span className="text-lg font-semibold tracking-tight text-foreground">
              CuevikSync
            </span>
          }
        />
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Identity is hardcoded until Supabase Auth is wired. `UserMenu`
              takes plain props precisely so this line is the only thing that
              changes: a server-read profile replaces the literals, and
              `onSignOut` gains a Server Action. */}
          <Topbar
            crumbs={crumbsFor(pathname)}
            right={
              <UserMenu
                name="Not signed in"
                roleLabel="No session"
                signOutDisabledReason="Authentication is not wired yet."
              />
            }
          />
          <main
            id="main-content"
            tabIndex={-1}
            className="flex-1 overflow-y-auto outline-none"
          >
            {/* Keyed on pathname so the fade replays on every navigation —
                DESIGN-SYSTEM.md §Motion: 150ms ease-out, opacity only. */}
            <div key={pathname} className="animate-in fade-in-0 duration-150">
              {children}
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
