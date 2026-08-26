"use client";

import React from "react";
import { UserMenu } from "@/components/layout/user-menu";
import {
  useTracker,
  type UserRole,
  ROLE_LABELS,
} from "@/components/providers/tracker-provider";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export function UserRoleDropdown() {
  const { selectedRole, setSelectedRole } = useTracker();

  return (
    <UserMenu
      name="Not signed in"
      roleLabel={`Role: ${ROLE_LABELS[selectedRole]}`}
      signOutDisabledReason="Authentication is not wired yet."
      roleSlot={
        <>
          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
            Switch Active Role
          </div>
          {(["admin", "manager", "operator", "rep"] as UserRole[]).map((r) => (
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
  );
}
