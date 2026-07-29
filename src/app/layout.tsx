import type { Metadata } from "next";
import "./globals.css";
import { SiteContentProvider } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Men's Palace — Premium Men's Fashion",
  description:
    "Discover premium outerwear and urban essentials crafted for the modern gentleman. Where luxury meets streetwear.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="auto" className="h-full antialiased">
      <body className="min-h-full flex flex-col overflow-x-hidden" style={{ fontFamily: "'Cairo', system-ui, -apple-system, sans-serif" }}>
        <SiteContentProvider>
          {children}
        </SiteContentProvider>
      </body>
    </html>
  );
}
