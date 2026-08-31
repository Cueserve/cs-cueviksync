"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { TooltipProvider } from "@/components/ui/tooltip";

import { NAV_GROUPS, crumbsFor } from "@/config/navigation";
import { UserRoleDropdown } from "./UserRoleDropdown";

// The chrome from DESIGN-SYSTEM.md §9: a fixed 220px dark rail, a persistent
// breadcrumb top bar, and an independently-scrolling content area. Client-side
// because the rail needs the current pathname to mark the active item; the
// pages it wraps stay Server Components.

export function AppChrome({
  children,
  userRole,
  userEmail,
}: {
  children: React.ReactNode;
  userRole: string;
  userEmail: string;
}) {
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
          groups={NAV_GROUPS}
          activeHref={activeHref}
          logo={
            <Image
              src="/logo/CuevikSync-Logo_White_Horizontal.png"
              alt="CuevikSync"
              width={160}
              height={36}
              priority
              className="h-9 w-auto"
              style={{ width: "auto", height: "auto" }}
            />
          }
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar
            crumbs={crumbsFor(pathname)}
            right={
              <UserRoleDropdown userRole={userRole} userEmail={userEmail} />
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
