import type { Metadata } from "next";
import type { ReactNode } from "react";

// Passthrough layout that just declares the favicon + iOS homescreen icon
// for every /stuff/* route. (Next 16 wasn't picking up icon.tsx /
// apple-icon.tsx from the file convention alone — declaring them in
// metadata at this segment makes the <link> tags get injected for both
// /stuff/login and the (app) group's authed pages.)
export const metadata: Metadata = {
  icons: {
    icon: "/stuff/icon",
    apple: "/stuff/apple-icon",
  },
};

export default function StuffSegmentLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
