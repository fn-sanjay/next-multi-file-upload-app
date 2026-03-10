"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { FileContextMenu } from "@/components/common/file-context-menu";
import { FolderCard } from "@/components/common/folder-card";
import { Button } from "@/components/ui/button";
import { fetchWithRefresh } from "@/lib/client/auth-api";
import { ROUTES } from "@/routes";
import { UPLOADS_REFRESH_EVENT } from "@/lib/upload-events";

type ApiFolder = {
  id: string;
  name: string;
  createdAt?: string;
  tags?: Array<{
    tag?: {
      name?: string;
    };
  }>;
  _count?: {
    files?: number;
    children?: number;
  };
};

type FoldersResponse = {
  folders?: ApiFolder[];
  error?: string;
};

export function RecentFolders() {
  const [folders, setFolders] = useState<ApiFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFolders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetchWithRefresh("/api/user/folders?sort=recent&limit=5");
      const data = (await res.json()) as FoldersResponse;

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch folders");
      }

      setFolders(data.folders || []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch folders";
      setError(message);
      setFolders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFolders();
  }, [loadFolders]);

  useEffect(() => {
    const handleRefresh = () => {
      void loadFolders();
    };

    window.addEventListener(UPLOADS_REFRESH_EVENT, handleRefresh);
    return () => {
      window.removeEventListener(UPLOADS_REFRESH_EVENT, handleRefresh);
    };
  }, [loadFolders]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">Recent Folders</h2>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-primary hover:text-primary/80 hover:bg-primary/10"
        >
          <Link href={ROUTES.pages.folders}>
            View All
            <ChevronRight className="ml-1 w-4 h-4" />
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }, (_, index) => (
            <div
              key={index}
              className="min-h-52 rounded-xl border border-white/5 bg-white/5 animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-6 text-sm text-destructive">
          {error}
        </div>
      ) : folders.length === 0 ? (
        <div className="rounded-xl border border-white/5 bg-white/5 px-4 py-10 text-center text-muted-foreground">
          No folders yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {folders.map((folder) => {
            const itemCount =
              (folder._count?.files ?? 0) + (folder._count?.children ?? 0);
            const tags = (folder.tags || [])
              .map((entry) => entry.tag?.name)
              .filter((name): name is string => Boolean(name));

            return (
              <FileContextMenu
                key={folder.id}
                id={folder.id}
                name={folder.name}
                type="folder"
                refresh={() => void loadFolders()}
              >
                <div className="h-full">
                  <FolderCard
                    name={folder.name}
                    itemCount={itemCount}
                    modifiedAt={formatRelativeTime(folder.createdAt)}
                    tags={tags}
                    modifiedInFooter
                    href={`/folders/${folder.id}`}
                  />
                </div>
              </FileContextMenu>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatRelativeTime(value?: string) {
  if (!value) return "UNKNOWN";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "UNKNOWN";
  }

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));

  if (diffMinutes < 60) {
    return `${diffMinutes} MIN${diffMinutes === 1 ? "" : "S"} AGO`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} HOUR${diffHours === 1 ? "" : "S"} AGO`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays} DAY${diffDays === 1 ? "" : "S"} AGO`;
  }

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 5) {
    return `${diffWeeks} WEEK${diffWeeks === 1 ? "" : "S"} AGO`;
  }

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    return `${diffMonths} MONTH${diffMonths === 1 ? "" : "S"} AGO`;
  }

  const diffYears = Math.floor(diffDays / 365);
  return `${diffYears} YEAR${diffYears === 1 ? "" : "S"} AGO`;
}
