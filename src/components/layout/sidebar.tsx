import * as React from "react";
import Link from "next/link";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// The design system's Sidebar: 220px dark rail (--sidebar, stone-900),
// white logo chip (a brand mark is rarely transparent-safe on dark), active
// item filled --sidebar-primary (brand), inactive items --sidebar-
// foreground. Not `ui/` -- chrome, not a shared atom, and allowed to be
// app-aware (current route) in a way ui/ components structurally can't be
// (see eslint.config.mjs's ui/ boundary rule).
//
// Below `xl` the rail collapses to icons (DESIGN-SYSTEM.md §9). A fixed 220px
// rail is 29% of a 768px tablet, which cost the quotes table 297px of its 787px
// of columns; the collapse hands 152px of that back. Supported range starts at
// tablet, so there is no phone drawer here and no hamburger.
//
// `xl` and not `lg`, which is counterintuitive enough to record: a two-width
// rail always shrinks the content area at the width where it expands, so the
// step gets placed, not removed. At `lg` it fell at 1024 and clipped 41px off
// the quotes table. At `xl` the same step falls at 1280, where 1060px of
// content still clears the 787px table (DESIGN-SYSTEM.md §9).
export interface SidebarNavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

// A group's label is Title Case per DESIGN-SYSTEM.md §11 ("primary nav ...
// section headers use Title Case") and stays --sidebar-foreground at full
// strength rather than a dimmer/alpha token invented for this one role --
// §4's contrast table only vets discrete stone steps, not opacity blends on
// a dark surface. Weight and size (text-xs font-semibold vs the items' text-
// sm font-medium) carry the de-emphasis instead, the same "weight, not hue"
// approach §4 uses for links.
export interface SidebarNavGroup {
  label: string;
  items: SidebarNavItem[];
}

function Sidebar({
  groups,
  activeHref,
  logo,
  footer,
  className,
}: {
  groups: SidebarNavGroup[];
  activeHref?: string;
  logo?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <aside
      data-slot="sidebar"
      className={cn(
        // `px-2.5` collapsed, `xl:px-3` expanded: the narrower inset below `xl`
        // is what makes the 44px tap-target floor below possible without
        // moving the rail's own 64px width, which DESIGN-SYSTEM.md §9 ties to
        // the documented 156px rail-collapse step. `xl:px-3` restores the
        // original 12px inset once the rail is wide enough not to need it,
        // keeping the §4-driven 24px logo/footer/item alignment intact there.
        "flex h-full w-16 flex-col gap-0.5 bg-sidebar px-2.5 py-3 text-sidebar-foreground xl:w-55 xl:px-3",
        className,
      )}
    >
      {/* The wordmark is the only brand asset there is, and it is illegible at
          40px of usable width. Below `xl` the chip drops rather than shrinking
          into mush or inventing a monogram the brand doesn't have -- the Topbar
          breadcrumb still says where you are. */}
      {logo ? (
        <div className="mx-1 mb-5 hidden w-fit rounded-md bg-sidebar-logo-chip p-2 xl:block">
          {logo}
        </div>
      ) : null}
      <nav aria-label="Main" className="flex flex-col gap-4">
        {groups.map((group) => {
          const headingId = `sidebar-group-${group.label.toLowerCase().replace(/\s+/g, "-")}`;
          return (
            <div
              key={group.label}
              role="group"
              aria-labelledby={headingId}
              className="flex flex-col gap-0.5"
            >
              {/* `sr-only` below `xl`, matching the item labels: the grouping
                  is still meaningful to a screen-reader user with the rail
                  collapsed, even though there's no room to show it. */}
              <span
                id={headingId}
                className="px-3 pb-1 text-xs font-semibold text-sidebar-foreground max-xl:sr-only"
              >
                {group.label}
              </span>
              {group.items.map((item) => {
                const isActive = item.href === activeHref;
                return (
                  <Tooltip key={item.href}>
                    {/* `asChild` is correct here and only here: Link already
                        renders a focusable anchor, so the trigger has a real
                        element to attach to (see the note in ui/tooltip.tsx). */}
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          // `ring-sidebar-ring`, not the base layer's
                          // `ring-ring`: clay-600 on the stone-900 rail
                          // measures 2.37:1, under the 3:1 non-text floor
                          // (WCAG 1.4.11). --sidebar-ring is clay-400 for
                          // exactly this surface -- 5.63:1 on the rail
                          // (DESIGN-SYSTEM.md §4). The ring is drawn outside
                          // the border box, so the rail is the adjacent
                          // surface that matters; against the active item's
                          // own clay fill it is only 2.37, which is why it
                          // must never be drawn inset.
                          // `max-xl:py-3.5`, not `py-3`: with the rail's own
                          // collapsed inset trimmed to `px-2.5` above, this
                          // link's box is exactly 44x44px (44 content width x
                          // (14px + 16px icon + 14px) height) -- the WCAG
                          // 2.5.5/2.5.8 minimum tap target, not the 40x40px it
                          // measured before either value moved.
                          "flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium no-underline transition-colors focus-visible:ring-sidebar-ring max-xl:justify-center max-xl:px-0 max-xl:py-3.5",
                          isActive
                            ? "bg-sidebar-primary font-semibold text-sidebar-primary-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        )}
                      >
                        {item.icon}
                        {/* Hidden, not removed: the collapsed rail still
                            needs an accessible name for every destination. */}
                        <span className="max-xl:sr-only">{item.label}</span>
                      </Link>
                    </TooltipTrigger>
                    {/* Earns its place only while the label is hidden. */}
                    <TooltipContent side="right" className="xl:hidden">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          );
        })}
      </nav>
      {/* Co-branding's second slot. The chip above is the tenant's mark -- this
          is the product's, deliberately demoted to attribution: the people in
          this rail all day work for the tenant, not for us. Kept a slot rather
          than hardcoded so `ui/`-adjacent chrome stays app-agnostic and the
          caller owns what the two marks actually are.

          `mt-auto` pins it to the floor of the rail regardless of nav length.
          Hidden below `xl` for the same reason the chip is: 40px of usable
          width renders it as mush, and attribution is the first thing that
          should go, not the last. */}
      {footer ? (
        <div className="mt-auto hidden px-3 pt-4 xl:block">{footer}</div>
      ) : null}
    </aside>
  );
}

export { Sidebar };
