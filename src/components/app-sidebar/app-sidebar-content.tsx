"use client";

import React from "react";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SIDEBAR_NAV, ADMIN_NAV } from "./nav-items";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";

export const AppSidebarContent = () => {
  const pathname = usePathname();
  const { isAdmin } = useAuth();
  const [favoriteCount, setFavoriteCount] = React.useState<number | null>(null);

  const navItems = isAdmin ? ADMIN_NAV : SIDEBAR_NAV;

  React.useEffect(() => {
    if (isAdmin) return;

    const loadFavoriteCount = async () => {
      try {
        const [filesRes, foldersRes] = await Promise.all([
          fetch("/api/user/files?isFavorite=true&page=1&limit=1"),
          fetch("/api/user/folders?isFavorite=true"),
        ]);

        const filesData = await filesRes.json();
        const foldersData = await foldersRes.json();

        const filesTotal =
          filesData?.pagination?.total ??
          (Array.isArray(filesData?.files) ? filesData.files.length : 0);

        const foldersTotal = Array.isArray(foldersData?.folders)
          ? foldersData.folders.length
          : 0;

        setFavoriteCount(filesTotal + foldersTotal);
      } catch (err) {
        console.error("Failed to load favorites count", err);
      }
    };

    loadFavoriteCount();
  }, [isAdmin]);

  return (
    <SidebarContent className="custom-scrollbar">
      <SidebarGroup>
        <SidebarGroupLabel className="text-zinc-600 font-black text-[10px] uppercase tracking-[0.2em] mb-2 px-4 group-data-[collapsible=icon]:hidden">
          {isAdmin ? "Management Console" : "General Access"}
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu className="items-center group-data-[collapsible=icon]:p-0">
            {navItems.map((item) => {
              const badge =
                item.title === "Favorites"
                  ? null // hide favorites badge entirely
                  : item.badge;

              return (
              <SidebarMenuItem key={item.title} className="w-full">
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.url}
                  tooltip={item.title}
                  className="hover:bg-primary/10 hover:text-primary text-zinc-400 data-[active=true]:bg-primary/20 data-[active=true]:text-white h-11 px-3 rounded-lg flex items-center gap-3 transition-all duration-300 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
                >
                  <Link
                    href={item.url}
                    className="flex items-center gap-3 w-full"
                  >
                    <item.icon className="size-5 shrink-0" />
                    <span className="font-medium text-sm transition-opacity duration-300 group-data-[collapsible=icon]:hidden">
                      {item.title}
                    </span>
                    {badge !== undefined && badge !== null && (
                      <span className="ml-auto bg-primary text-black text-[10px] font-bold px-1.5 py-0.5 rounded-md ring-2 ring-black group-data-[collapsible=icon]:hidden">
                        {badge}
                      </span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
};
