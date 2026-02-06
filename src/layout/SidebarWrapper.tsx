"use client";

import React from "react";
import AppSidebar from "@/layout/AppSidebar";
import AppHeader from "@/layout/AppHeader";
import { useSidebar } from "@/context/SidebarContext";
import Backdrop from "./Backdrop";

export default function SidebarWrapper({ children }: { children: React.ReactNode}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <>
      <AppSidebar/>
      <Backdrop />
      <div className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}>
        <AppHeader/>
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:px-14 py-10">{children}</div>
      </div>
    </>
  );
}

