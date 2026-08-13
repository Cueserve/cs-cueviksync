"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Layers, Calendar, Trash2 } from "lucide-react";

import { Sidebar, type SidebarNavItem } from "@/components/layout/sidebar";
import { Topbar, type Crumb } from "@/components/layout/topbar";
import { UserMenu } from "@/components/layout/user-menu";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  useTracker,
  type UserRole,
  ROLE_LABELS,
} from "@/components/providers/tracker-provider";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

// The chrome from DESIGN-SYSTEM.md §9: a fixed 220px dark rail, a persistent
// breadcrumb top bar, and an independently-scrolling content area. Client-side
// because the rail needs the current pathname to mark the active item; the
// pages it wraps stay Server Components.

const NAV: SidebarNavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="size-4" />,
  },
  {
    label: "Jobs Dashboard",
    href: "/jobs",
    icon: <Layers className="size-4" />,
  },
  {
    label: "This Week Schedule",
    href: "/schedule",
    icon: <Calendar className="size-4" />,
  },
  {
    label: "Waste & Rework",
    href: "/waste",
    icon: <Trash2 className="size-4" />,
  },
];

const SECTION_LABEL: Record<string, string> = {
  dashboard: "Dashboard",
  jobs: "Jobs Dashboard",
  schedule: "This Week Schedule",
  waste: "Waste & Rework",
};

/** Resolves the trailing crumb for a detail route */
function leafLabel(section: string, id: string) {
  if (id === "new") {
    return (
      {
        jobs: "New Job",
      }[section] ?? "New"
    );
  }
  return (
    {
      jobs: "Job Detail",
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
  const { selectedRole, setSelectedRole } = useTracker();

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
            <Image
              src="/logo/CuevikSync-Logo_White_Horizontal.png"
              alt="CuevikSync"
              width={160}
              height={36}
              priority
              className="h-9 w-auto"
            />
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
                roleLabel={`Role: ${ROLE_LABELS[selectedRole]}`}
                signOutDisabledReason="Authentication is not wired yet."
                roleSlot={
                  <>
                    <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                      Switch Active Role
                    </div>
                    {(
                      ["admin", "manager", "operator", "rep"] as UserRole[]
                    ).map((r) => (
                      <DropdownMenuItem
                        key={r}
                        onClick={() => setSelectedRole(r)}
                        className={
                          selectedRole === r
                            ? "font-semibold bg-accent text-accent-foreground"
                            : ""
                        }
                      >
                        {ROLE_LABELS[r]}
                      </DropdownMenuItem>
                    ))}
                  </>
                }
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
