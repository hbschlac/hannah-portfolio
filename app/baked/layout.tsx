import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "baked by hannah",
  description:
    "hi, i'm hannah — looking for applied AI and native AI product roles.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🧁</text></svg>",
  },
};

export default function BakedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
