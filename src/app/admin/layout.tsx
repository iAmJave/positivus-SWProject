import { Suspense } from "react";
import type { Metadata } from "next";
import { SidebarProvider } from "@/context/SidebarContext";
import SidebarWrapper from "@/layout/SidebarWrapper";

export const metadata: Metadata = {
  title: "Positivus Admin",
  description: "Positivus Admin Dashboard",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading admin...</div>}>
      <div className="flex h-screen">
        <SidebarProvider>
          <SidebarWrapper>
            {children}
          </SidebarWrapper>
        </SidebarProvider>
      </div>
    </Suspense>
  );
}
