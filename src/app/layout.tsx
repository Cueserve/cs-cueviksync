import type { Metadata } from "next";
import "./globals.css";

import { fontVariables } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "CuevikSync",
  description:
    "Turn every inbound inquiry into revenue and every booked job into faster delivery.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
