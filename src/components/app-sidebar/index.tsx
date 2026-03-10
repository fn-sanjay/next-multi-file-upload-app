"use client";

import React from "react";
import { AppSidebarHeader } from "./app-sidebar-header";
import { AppSidebarContent } from "./app-sidebar-content";
import { AppSidebarFooter } from "./app-sidebar-footer";
import { Sidebar, SidebarHeader, SidebarRail } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { CloudUpload } from "lucide-react";
import { useUpload } from "@/components/providers/upload-provider";
import { useAuth } from "@/components/providers/auth-provider";

export const AppSidebar = ({
  ...props
}: React.ComponentProps<typeof Sidebar>) => {
  const { setIsModalOpen } = useUpload();
  const { isAdmin, user } = useAuth();
  const isReadOnly = Boolean(user?.isReadOnly);

  return (
    <Sidebar
      collapsible="icon"
      variant="inset"
      {...props}
      className="border-r border-zinc-800"
    >
      <SidebarHeader className="p-3 bg-black group-data-[collapsible=icon]:items-center">
        <AppSidebarHeader />

        {!isAdmin && !isReadOnly && (
          <div className="mt-4 w-full flex justify-center">
            <Button
              onClick={() => setIsModalOpen(true)}
              className="w-full bg-linear-to-r from-[#B6FF00] to-[#00D4C8] hover:from-[#22D3EE] hover:to-[#D946EF] text-black font-bold h-12 rounded-lg flex items-center justify-center gap-3 shadow-lg transition-all duration-500 group group-data-[collapsible=icon]:size-11 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:rounded-lg"
            >
              <CloudUpload className="size-5 transition-transform group-hover:scale-110" />
              <span className="group-data-[collapsible=icon]:hidden">
                Upload New
              </span>
            </Button>
          </div>
        )}
      </SidebarHeader>

      <AppSidebarContent />
      <AppSidebarFooter />

      <SidebarRail />
    </Sidebar>
  );
};
