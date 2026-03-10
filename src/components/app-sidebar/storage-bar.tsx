"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { HardDrive } from "lucide-react";
import {
  useSidebar,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { fetchWithRefresh } from "@/lib/client/auth-api";
import { UPLOADS_REFRESH_EVENT } from "@/lib/upload-events";

export const StorageCard = () => {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const [usage, setUsage] = useState({
    images: 0,
    docs: 0,
    video: 0,
    others: 0,
    trash: 0,
  });
  const [totalLimitMb, setTotalLimitMb] = useState(10240); // default 10GB in MB

  const loadUsage = useCallback(async () => {
    try {
      const res = await fetchWithRefresh("/api/user/storage-usage");
      if (!res.ok) return;
      const data = await res.json();
      const toMb = (bytes: number) => bytes / 1024 / 1024;
      setUsage({
        images: toMb(data.usage?.images?.bytes ?? 0),
        docs: toMb(data.usage?.docs?.bytes ?? 0),
        video: toMb(data.usage?.video?.bytes ?? 0),
        others: toMb(data.usage?.others?.bytes ?? 0),
        trash: toMb(data.usage?.trash?.bytes ?? 0),
      });
      if (data.totalLimitBytes) {
        setTotalLimitMb(toMb(data.totalLimitBytes));
      }
    } catch (err) {
      console.error("storage usage fetch failed", err);
    }
  }, []);

  useEffect(() => {
    void loadUsage();

    const handleRefresh = () => {
      void loadUsage();
    };

    window.addEventListener(UPLOADS_REFRESH_EVENT, handleRefresh);
    return () => {
      window.removeEventListener(UPLOADS_REFRESH_EVENT, handleRefresh);
    };
  }, [loadUsage]);

  const totalUsed = useMemo(
    () => Object.values(usage).reduce((acc, curr) => acc + curr, 0),
    [usage],
  );

  const totalPercent = Math.min((totalUsed / totalLimitMb) * 100, 100);

  const categories = [
    { name: "Images", color: "#a855f7", value: usage.images },
    { name: "Docs", color: "#06b6d4", value: usage.docs },
    { name: "Video", color: "#d946ef", value: usage.video },
    { name: "Others", color: "#bfff00", value: usage.others }, // Primary color
  ];

  if (isCollapsed) {
    return (
      <SidebarMenu className="items-center p-0">
        <SidebarMenuItem>
          <SidebarMenuButton
            tooltip={`Storage: ${totalUsed.toFixed(0)} MB / ${totalLimitMb.toFixed(0)} MB`}
            className="justify-center size-9"
          >
            <HardDrive className="size-5 shrink-0 text-zinc-400" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <Link
      href="/profile"
      className="block outline-none ring-offset-black focus-visible:ring-1 focus-visible:ring-primary rounded-lg transition-all active:scale-[0.98]"
    >
      <div className="mx-4 mb-4 rounded-lg group-data-[collapsible=icon]:hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-zinc-400 text-xs font-semibold tracking-wide uppercase">
            Storage
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-white text-sm font-bold">
              {totalUsed.toFixed(0)} MB
            </span>
            <span className="text-zinc-500 text-[10px]">
              / {totalLimitMb.toFixed(0)} MB
            </span>
          </div>
        </div>

        {/* Smooth Premium Gradient Bar */}
        <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden relative mb-3 shadow-inner">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${totalPercent}%`,
              background: `linear-gradient(
                to right,
                #a855f7,
                #06b6d4,
                #d946ef,
                #bfff00
              )`,
              boxShadow: `
                0 0 10px rgba(191,255,0,0.3),
                0 0 15px rgba(6,182,212,0.2)
              `,
            }}
          />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-y-2 gap-x-2">
          {categories.map((cat) => (
            <div key={cat.name} className="flex items-center gap-1.5">
              <div
                className="size-1.5 rounded-full shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-zinc-400 text-[9px] font-medium truncate">
                {cat.name} {cat.value.toFixed(0)}MB
              </span>
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
};
