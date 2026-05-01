import type { ReactNode } from "react";
import { colors, fonts } from "@/lib/jamie/brand";

export const metadata = {
  title: "Jamie's Bach 2026 🌸",
  description: "Newport, RI · July 10–13, 2026",
};

export default function JamieBachLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <link
        rel="preconnect"
        href="https://fonts.googleapis.com"
      />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Fraunces:ital,opsz,wght@1,9..144,700;1,9..144,900&family=Inter:wght@400;500;600;700&display=swap"
      />
      <div
        style={{
          background: colors.cream,
          color: colors.navy,
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
