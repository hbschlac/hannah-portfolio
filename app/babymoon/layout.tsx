import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./babymoon.css";
import TabBar from "./_components/TabBar";

export const metadata: Metadata = {
  metadataBase: new URL("https://babymoon.giddins.family"),
  title: "Cabo Babymoon",
  description: "Hannah & Sam · Cabo San Lucas · Aug 2026",
  manifest: "/babymoon/manifest.webmanifest",
  // The portfolio root layout sets metadata.icons, which suppresses this
  // segment's icon FILES — so point explicitly at the route-scoped handlers.
  icons: {
    icon: "/babymoon/icon",
    apple: "/babymoon/apple-icon",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Babymoon",
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#147d78",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function BabymoonLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bm">
      {children}
      <TabBar />
    </div>
  );
}
