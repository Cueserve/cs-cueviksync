import { redirect } from "next/navigation";

/**
 * Entry route. Real behaviour once auth is wired: read the session and send the
 * user to `/inquiries` or `/login`. Until then it always lands on the app,
 * since `(app)/layout.tsx` has no session gate yet.
 */
export default function RootPage() {
  redirect("/inquiries");
}
