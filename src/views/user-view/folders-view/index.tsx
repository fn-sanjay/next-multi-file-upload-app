"use client";

import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

import { NewFolderModal } from "./new-folder-modal";
import { FoldersHeader } from "./folders-header";
import { FoldersGrid } from "./folders-grid";
import type { FolderItem } from "@/types";

interface ApiFolderTag {
  tag?: {
    name?: string;
  };
}

interface ApiFolder {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
  tags?: ApiFolderTag[];
  _count?: {
    files?: number;
    children?: number;
  };
}

function toFolderItem(folder: ApiFolder): FolderItem {
  const modifiedAt = folder.updatedAt || folder.createdAt;
  const fileCount = folder._count?.files ?? 0;
  const childCount = folder._count?.children ?? 0;
  return {
    id: folder.id,
    slug: folder.id,
    name: folder.name,
    items: fileCount + childCount,
    size: "-",
    modified: formatFolderTime(modifiedAt),
    shared: false,
    tags: (folder.tags || [])
      .map((t) => t.tag?.name)
      .filter((name): name is string => Boolean(name)),
  };
}

export default function FoldersView() {

  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);

  // current folder navigation (root = null)
  const currentFolderId = null;

  /* ----------------------------- */
  /* FETCH FOLDERS */
  /* ----------------------------- */

  const fetchFolders = async () => {
    try {
      setLoading(true);
      // Only list root-level folders on the main page
      const res = await fetch("/api/user/folders?parentId=null");

      if (!res.ok) {
        throw new Error("Failed to fetch folders");
      }

      const data = (await res.json()) as { folders?: ApiFolder[] };
      setFolders((data.folders || []).map(toFolderItem));
    } catch (error) {
      console.error("Folders fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------- */
  /* INITIAL LOAD */
  /* ----------------------------- */

  useEffect(() => {
    fetchFolders();
  }, []);

  /* ----------------------------- */
  /* CREATE CALLBACK */
  /* ----------------------------- */

  const handleCreated = (folder: ApiFolder) => {
    setFolders((prev) => [toFolderItem(folder), ...prev]);
  };

  /* ----------------------------- */
  /* LOADING STATE */
  /* ----------------------------- */

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500">
        Loading folders...
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden font-sans">

      <ScrollArea className="flex-1">

        <div className="p-6 space-y-8 max-w-400 mx-auto pb-20">

          {/* HEADER */}
          <FoldersHeader onCreate={() => setCreateOpen(true)} />

          {/* CREATE FOLDER MODAL */}
          <NewFolderModal
            open={createOpen}
            onOpenChange={setCreateOpen}
            parentId={currentFolderId}
            onCreated={handleCreated}
          />

          {/* GRID */}
          <FoldersGrid folders={folders} />

        </div>

      </ScrollArea>

    </div>
  );
}

function formatFolderTime(value?: string) {
  if (!value) return "Unknown";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
