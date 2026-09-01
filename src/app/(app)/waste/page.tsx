import { createClient } from "@/lib/supabase/server";
import WasteClient from "./_components/WasteClient";

export default async function WasteReworkPage() {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  let userRole = "sales_rep";

  if (userData.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userData.user.id)
      .single();

    if (profile) {
      userRole = profile.role;
    }
  }

  const { data: jobs, error } = await supabase
    .from("jobs")
    .select(
      `
      *,
      items:job_line_items(*)
    `,
    )
    .is("deleted_at", null)
    .order("orderDate", { ascending: false });

  if (error) {
    console.error("Error fetching jobs:", error);
    return <div>Error loading waste log: {error.message}</div>;
  }

  return <WasteClient jobs={jobs || []} userRole={userRole} />;
}
