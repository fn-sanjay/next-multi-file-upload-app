"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "@/components/ui/breadcrumb";
import { fetchWithRefresh } from "@/lib/client/auth-api";

export const HeaderBreadcrumbs = () => {
  const pathname = usePathname();
  const paths = pathname.split("/").filter((path) => path);
  const [folderName, setFolderName] = useState<string | null>(null);

  // resolve folder id -> name for folders detail route
  useEffect(() => {
    const loadFolderName = async () => {
      if (paths[0] !== "folders" || !paths[1]) {
        setFolderName(null);
        return;
      }
      try {
        const res = await fetchWithRefresh(`/api/user/folders/${paths[1]}`);
        if (!res.ok) return;
        const data = await res.json();
        setFolderName(data.folder?.name ?? null);
      } catch (err) {
        console.error("breadcrumb folder fetch failed", err);
      }
    };
    loadFolderName();
  }, [paths]);

  const segments = useMemo(() => {
    if (paths.length <= 3) return paths;
    // Keep first and last two, collapse middle
    return [paths[0], "...", paths[paths.length - 2], paths[paths.length - 1]];
  }, [paths]);

  return (
    <Breadcrumb className="hidden md:flex">
      <BreadcrumbList>
        {segments.map((path, index) => {
          const isEllipsis = path === "...";
          const href = `/${paths.slice(0, index + 1).join("/")}`;
          const isLast = index === segments.length - 1;

          const rawLabel =
            paths[0] === "folders" &&
            path === paths[paths.length - 1] &&
            folderName
              ? folderName
              : path;

          const label = rawLabel
            .split("-")
            .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
            .join(" ");

          if (isEllipsis) {
            return (
              <React.Fragment key={`ellipsis-${index}`}>
                <BreadcrumbSeparator className="text-zinc-700" />
                <BreadcrumbItem>
                  <BreadcrumbEllipsis className="text-zinc-500" />
                </BreadcrumbItem>
              </React.Fragment>
            );
          }

          return (
            <React.Fragment key={`${path}-${index}`}>
              <BreadcrumbSeparator className="text-zinc-700" />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="text-white font-bold tracking-tight">
                    {label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    href={href}
                    className="text-zinc-500 hover:text-white transition-colors"
                  >
                    {label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
