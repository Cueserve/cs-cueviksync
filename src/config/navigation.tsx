import React from "react";
import { LayoutDashboard, Layers, Trash2 } from "lucide-react";
import { SidebarNavGroup } from "@/components/layout/sidebar";
import type { Crumb } from "@/components/layout/topbar";

// Grouped by where a record sits in the inquiry-to-revenue funnel
// (PRODUCT.md §4): Sales covers everything before an opportunity is Won,
// Jobs covers execution after. Settings is its own group rather than folded
// into either -- it's configuration, not a pipeline stage.
export const NAV_GROUPS: SidebarNavGroup[] = [
  {
    items: [
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
        label: "Waste & Rework",
        href: "/waste",
        icon: <Trash2 className="size-4" />,
      },
    ],
  },
];

export const SECTION_LABEL: Record<string, string> = {
  dashboard: "Dashboard",
  jobs: "Jobs Dashboard",
  schedule: "This Week Schedule",
  waste: "Waste & Rework",
};

/** Resolves the trailing crumb for a detail route */
export function leafLabel(section: string, id: string) {
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

export function crumbsFor(pathname: string): Crumb[] {
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
