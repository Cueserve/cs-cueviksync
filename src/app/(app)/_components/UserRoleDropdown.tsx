"use client";

import React from "react";
import { UserMenu } from "@/components/layout/user-menu";
import { signOut } from "@/app/actions/auth";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrator",
  manager: "Sales Manager",
  operator: "Office Admin",
  rep: "Sales Rep",
  viewer: "Read-Only Viewer",
  owner_admin: "Owner/Admin",
  sales_manager: "Sales Manager",
  office_admin: "Office Admin",
  sales_rep: "Sales Rep",
};

export function UserRoleDropdown({
  userRole,
  userEmail,
}: {
  userRole: string;
  userEmail: string;
}) {
  const label = ROLE_LABELS[userRole] || userRole;

  return (
    <UserMenu
      name={userEmail || "Unknown User"}
      roleLabel={`Role: ${label}`}
      roleSlot={null}
      onSignOut={async () => {
        await signOut();
      }}
    />
  );
}
