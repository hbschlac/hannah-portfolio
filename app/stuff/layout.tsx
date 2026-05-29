import type { Metadata } from "next";
import type { ReactNode } from "react";
import StuffProvider from "./_components/StuffProvider";
import StuffGate from "./_components/StuffGate";
import TabBar from "./_components/TabBar";
import Sidebar from "./_components/Sidebar";

export const metadata: Metadata = {
  title: "Stuff",
  description: "Stuff to read later.",
};

export default function StuffLayout({ children }: { children: ReactNode }) {
  return (
    <StuffGate>
      <StuffProvider>
        <div className="min-h-screen bg-white text-neutral-950 md:flex">
          <Sidebar />
          <main className="mx-auto w-full max-w-[480px] px-5 pb-28 pt-[env(safe-area-inset-top)] md:max-w-3xl md:px-10 md:pb-16 md:pt-2">
            {children}
          </main>
          <TabBar />
        </div>
      </StuffProvider>
    </StuffGate>
  );
}
