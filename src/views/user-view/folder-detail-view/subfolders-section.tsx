"use client";

import { useState } from "react";
import { FolderCard } from "@/components/common/folder-card";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileContextMenu } from "@/components/common/file-context-menu";
import { NewFolderModal } from "@/views/user-view/folders-view/new-folder-modal";

interface SubfoldersSectionProps {
  subfolders: Array<{
    id: string;
    slug?: string;
    name: string;
    createdAt?: string | null;
    updatedAt?: string | null;
    tags?: Array<{ tag?: { name?: string } }>;
    _count?: {
      files?: number;
      children?: number;
    };
    items?: number;
    modified?: string;
    size?: string;
  }>;
  parentId: string;
  refresh: () => void;
}

export function SubfoldersSection({
  subfolders,
  parentId,
  refresh,
}: SubfoldersSectionProps) {

  const [open, setOpen] = useState(false);

  const handleCreated = () => {
    refresh();
  };

  return (
    <section className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">
          Subfolders
        </h2>

        <Button
          variant="ghost"
          onClick={() => setOpen(true)}
          className="text-xs font-black text-primary hover:bg-primary/10 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Folder
        </Button>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">

        {subfolders.map((folder) => {
          const itemCount =
            folder.items ??
            (folder._count?.files ?? 0) + (folder._count?.children ?? 0);
          const tags = (folder.tags || [])
            .map((t) => t.tag?.name)
            .filter((name): name is string => Boolean(name));
          const modifiedAt =
            folder.modified ??
            formatFolderTime(folder.updatedAt || folder.createdAt);

          return (
          <FileContextMenu
            key={folder.id}
            id={folder.id}
            name={folder.name}
            type="folder"
            currentFolderId={folder.id}
            refresh={refresh}
          >
            <div className="h-full">
              <FolderCard
                name={folder.name}
                itemCount={itemCount}
                size={folder.size ?? ""}
                modifiedAt={modifiedAt}
                tags={tags}
                href={`/folders/${folder.slug || folder.id}`}
              />
            </div>
          </FileContextMenu>
          );
        })}

        {/* CREATE CARD */}
        <Card
          onClick={() => setOpen(true)}
          className="flex items-center justify-center border-dashed border-2 border-white/5 hover:border-primary/30 transition-all cursor-pointer group bg-transparent min-h-40"
        >
          <div className="text-center space-y-2">
            <div className="p-3 rounded-full bg-white/5 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all inline-block">
              <Plus className="w-6 h-6" />
            </div>

            <p className="text-xs font-bold text-muted-foreground group-hover:text-white transition-colors">
              New Folder
            </p>
          </div>
        </Card>

      </div>

      {/* MODAL */}
      <NewFolderModal
        open={open}
        onOpenChange={setOpen}
        parentId={parentId}
        onCreated={handleCreated}
      />

    </section>
  );
}

function formatFolderTime(value?: string | null) {
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
