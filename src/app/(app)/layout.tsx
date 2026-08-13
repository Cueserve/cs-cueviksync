import { AppChrome } from "./_components/AppChrome";
import { TrackerProvider } from "@/components/providers/tracker-provider";

/**
 * The authenticated shell. Every route under `(app)` assumes a session.
 */
export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <TrackerProvider>
      <AppChrome>{children}</AppChrome>
    </TrackerProvider>
  );
}
