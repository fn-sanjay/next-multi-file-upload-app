"use client";

import React from "react";
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { StorageCard } from "./storage-bar";
import { Button } from "../ui/button";
import { ArrowUpCircle } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { StorageRequestModal } from "./storage-request-modal";
import { useState } from "react";

export const AppSidebarFooter = () => {
  const { state } = useSidebar();
  const { isAdmin } = useAuth();
  const [requestOpen, setRequestOpen] = useState(false);
  const isCollapsed = state === "collapsed";

  return (
    <SidebarFooter className="p-0 border-t border-zinc-800/10 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:p-0">
      {!isAdmin && <StorageCard />}

      {!isAdmin && (
        <div className="p-4 w-full flex flex-col gap-2 group-data-[collapsible=icon]:px-0">
          {isCollapsed ? (
            <SidebarMenu className="items-center">
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Request Storage"
                  onClick={() => setRequestOpen(true)}
                  className="text-primary hover:text-black hover:bg-primary justify-center size-9 rounded-lg"
                >
                  <ArrowUpCircle className="size-5 shrink-0 transition-all" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          ) : (
            <Button
              onClick={() => setRequestOpen(true)}
              variant="outline"
              className="w-full h-10 rounded-lg border-primary/20 bg-transparent text-primary text-sm font-bold hover:bg-primary hover:text-black transition-all duration-300 active:scale-[0.98] animate-in fade-in"
            >
              Request Storage
            </Button>
          )}
        </div>
      )}
      <StorageRequestModal open={requestOpen} onOpenChange={setRequestOpen} />
    </SidebarFooter>
  );
};
