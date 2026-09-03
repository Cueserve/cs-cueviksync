import { redirect } from "next/navigation";
import { AppChrome } from "./_components/AppChrome";
import { getCurrentUser, getCurrentUserRole } from "@/lib/auth";

/**
 * The authenticated shell. Every route under `(app)` assumes a session.
 */
export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const userRole = await getCurrentUserRole();

  return (
    <AppChrome userRole={userRole} userEmail={user.email || ""}>
      {children}
    </AppChrome>
  );
}
