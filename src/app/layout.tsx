import type { Metadata } from "next";
import "./globals.css";

import { fontVariables } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "CuevikSync",
  description: "Capture every inbound inquiry and turn it into revenue.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-US" className={`${fontVariables} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
