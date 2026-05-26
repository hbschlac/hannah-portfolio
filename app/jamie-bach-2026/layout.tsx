import type { ReactNode } from "react";
import { colors, fonts } from "@/lib/jamie/brand";

export const metadata = {
  metadataBase: new URL("https://jamiesbach.schlacter.me"),
  title: "Jamie's Bachelorette · Newport",
  description: "Newport, Rhode Island · July 10–12, 2026",
  openGraph: {
    title: "Jamie's Bachelorette · Newport",
    description: "Newport, Rhode Island · July 10–12, 2026",
    url: "https://jamiesbach.schlacter.me",
    siteName: "Jamie's Bach",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jamie's Bachelorette · Newport",
    description: "Newport, Rhode Island · July 10–12, 2026",
  },
};

export default function JamieBachLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap"
      />
      <div
        style={{
          background: colors.paper,
          color: colors.ink,
          fontFamily: fonts.body,
          minHeight: "100vh",
          paddingBottom: "80px",
        }}
      >
        {children}
      </div>
    </>
  );
}
