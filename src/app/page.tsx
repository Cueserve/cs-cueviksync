import { redirect } from "next/navigation";

/**
 * Entry route. Redirects to dashboard for PrintWorks KPI tracker.
 */
export default function RootPage() {
  redirect("/dashboard");
}
