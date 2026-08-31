import { redirect } from "next/navigation";
import { AppChrome } from "./_components/AppChrome";
import { createClient } from "@/lib/supabase/server";

/**
 * The authenticated shell. Every route under `(app)` assumes a session.
 */
export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: roleData } = await supabase.rpc("get_user_role");
  const userRole = roleData || "viewer";

  return (
    <AppChrome userRole={userRole} userEmail={user.email || ""}>
      {children}
    </AppChrome>
  );
}
