"use client";

import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { HeaderBreadcrumbs } from "./header-breadcrumbs";
import { HeaderSearch } from "./header-search";
import { HeaderUserNav } from "./header-user-nav";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useUpload } from "@/components/providers/upload-provider";
import { useAuth } from "@/components/providers/auth-provider";

export const Header = () => {
  const { setIsModalOpen } = useUpload();
  const { isAdmin, user } = useAuth();
  const isReadOnly = Boolean(user?.isReadOnly);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 px-4 border-b border-zinc-800 bg-black sticky top-0 z-30">
      {/* Left: Sidebar Trigger & Breadcrumbs */}
      <div className="flex items-center gap-2 overflow-hidden">
        <SidebarTrigger className="text-zinc-400 hover:text-white transition-colors" />
        <div className="h-4 w-px bg-zinc-800 mx-2 shrink-0" />
        <HeaderBreadcrumbs />
      </div>

      {/* Center: Search (users only) */}
      {!isAdmin && <HeaderSearch />}

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-4">
        {!isAdmin && !isReadOnly && (
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-[#a6e600] text-black font-bold h-9 px-4 rounded-lg hidden md:flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Upload Files
          </Button>
        )}
        <HeaderUserNav />
      </div>
    </header>
  );
};
