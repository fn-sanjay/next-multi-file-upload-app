"use client";

import * as React from "react";
import {
  ArrowUpDown,
  LayoutGrid,
  List,
  Search,
  Star,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileContextMenu } from "@/components/common/file-context-menu";
import { FileDetailsSheet } from "@/components/common/file-details-sheet";
import { FileItemCard } from "@/components/common/file-item-card";
import { toast } from "sonner";
import { FavoriteFolderCard } from "./favorite-folder-card";

type FavoriteFolderItem = {
  id: string;
  kind: "folder";
  name: string;
  items: number;
  size: string;
  modified: string;
  modifiedDate: string;
  modifiedTime: string;
  slug: string;
  shared?: boolean;
  isFavorite: boolean;
  sortTime: number;
  tags?: string[];
};

type FavoriteFileItem = {
  id: string;
  kind: "file";
  name: string;
  size: string;
  modified: string;
  fileType?: string;
  tags?: string[];
  isFavorite: boolean;
  sortTime: number;
};

type FavoriteItem = FavoriteFolderItem | FavoriteFileItem;

export default function FavoritesView() {
  const [favorites, setFavorites] = React.useState<FavoriteItem[]>([]);
  const [selectedFileId, setSelectedFileId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");

  const fetchFavorites = React.useCallback(async () => {
    try {
      setLoading(true);

      const [foldersRes, filesRes] = await Promise.all([
        fetch("/api/user/folders?isFavorite=true"),
        fetch("/api/user/files?isFavorite=true"),
      ]);

      const foldersData = await parseJsonResponse<{
        error?: string;
        folders?: Array<{
          id: string;
          name: string;
          createdAt?: string;
          updatedAt?: string;
          tags?: Array<{ tag?: { name?: string } }>;
          _count?: { files?: number; children?: number };
        }>;
      }>(foldersRes);

      const filesData = await parseJsonResponse<{
        error?: string;
        files?: Array<{
          id: string;
          filename: string;
          createdAt?: string;
          blob?: { size?: number; extension?: string };
          tags?: Array<{ tag?: { name?: string } }>;
        }>;
      }>(filesRes);

      if (!foldersRes.ok || !filesRes.ok) {
        toast.error(
          foldersData.error || filesData.error || "Failed to load favorites",
        );
        return;
      }

      const folderItems: FavoriteFolderItem[] = (foldersData.folders || []).map(
        (folder) => {
          const modifiedSource = folder.updatedAt || folder.createdAt;
          const { full, date, time } = formatDateParts(modifiedSource);
          return {
            id: folder.id,
            kind: "folder",
            name: folder.name,
            items: (folder._count?.files ?? 0) + (folder._count?.children ?? 0),
            size: "-",
            modified: full,
            modifiedDate: date,
            modifiedTime: time,
            slug: folder.id,
            tags: (folder.tags || [])
              .map((t) => t.tag?.name)
              .filter((name): name is string => Boolean(name)),
            isFavorite: true,
            sortTime: parseSortTime(modifiedSource),
          };
        },
      );

      const fileItems: FavoriteFileItem[] = (filesData.files || []).map(
        (file) => {
          const { full } = formatDateParts(file.createdAt);
          return {
            id: file.id,
            kind: "file",
            name: file.filename,
            size: formatSize(file.blob?.size),
            modified: full,
            fileType: file.blob?.extension?.toUpperCase(),
            tags: (file.tags || [])
              .map((t) => t.tag?.name)
              .filter((name): name is string => Boolean(name)),
            isFavorite: true,
            sortTime: parseSortTime(file.createdAt),
          };
        },
      );

      setFavorites(
        [...folderItems, ...fileItems].sort(
          (a, b) => b.sortTime - a.sortTime,
        ),
      );
    } catch (error) {
      console.error("Favorites fetch error:", error);
      toast.error("Failed to load favorites");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const removeFavorite = async (item: FavoriteItem) => {
    const endpoint =
      item.kind === "file"
        ? `/api/user/files/${item.id}/favorite`
        : `/api/user/folders/${item.id}/favorite`;

    const res = await fetch(endpoint, { method: "DELETE" });
    const data = await parseJsonResponse<{ error?: string }>(res);

    if (!res.ok) {
      toast.error(data.error || "Failed to remove favorite");
      return;
    }

    setFavorites((current) => current.filter((entry) => entry.id !== item.id));
    toast.success("Removed from favorites");
  };

  const handleFileClick = (item: FavoriteFileItem) => {
    setSelectedFileId(item.id);
  };

  const visibleFavorites = favorites.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500">
        Loading favorites...
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden font-sans">
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-8 max-w-400 mx-auto pb-20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
                <Star className="w-8 h-8 text-primary fill-primary" />
                Favorites
              </h1>
              <p className="text-muted-foreground font-medium">
                Quickly access your most important and frequently used files.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative max-w-md w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  placeholder="Search favorites..."
                  className="h-11 pl-11 pr-4 bg-white/5 border-white/10 rounded-xl focus:ring-primary transition-all font-medium"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
              <div className="p-1 bg-white/5 border border-white/10 rounded-xl flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-lg bg-primary/10 text-primary"
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-lg text-muted-foreground hover:bg-white/10"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">
                Starred Items
              </h2>
            </div>
            <Button
              variant="ghost"
              className="text-xs font-black text-muted-foreground hover:text-white flex items-center gap-2"
            >
              Recently Added <ArrowUpDown className="w-3 h-3" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {visibleFavorites.map((item) => {
              if (item.kind === "folder") {
                return (
                  <FileContextMenu
                    key={item.id}
                    id={item.id}
                    name={item.name}
                    type="folder"
                    onRename={() => console.log("Rename:", item.name)}
                    onDownload={() => console.log("Download:", item.name)}
                    onCopyLink={() => console.log("Copy link:", item.name)}
                    onShare={() => console.log("Share:", item.name)}
                    onAddToFavorites={() => removeFavorite(item)}
                    favoriteLabel="Remove from Favorites"
                  onMoveToArchive={() => console.log("Archive:", item.name)}
                  onMoveToTrash={() => console.log("Trash:", item.name)}
                  refresh={fetchFavorites}
                >
                    <FavoriteFolderCard
                      item={item}
                      onRemoveFavorite={() => removeFavorite(item)}
                    />
                  </FileContextMenu>
                );
              }

              return (
                <FileContextMenu
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  type="file"
                  onViewDetails={() => handleFileClick(item)}
                  onRename={() => console.log("Rename:", item.name)}
                  onDownload={() => console.log("Download:", item.name)}
                  onCopyLink={() => console.log("Copy link:", item.name)}
                  onShare={() => console.log("Share:", item.name)}
                  onAddToFavorites={() => removeFavorite(item)}
                  favoriteLabel="Remove from Favorites"
                  onMoveToArchive={() => console.log("Archive:", item.name)}
                  onMoveToTrash={() => console.log("Trash:", item.name)}
                  refresh={fetchFavorites}
                >
                  <div className="h-full">
                    <FileItemCard
                      fileId={item.id}
                      fileName={item.name}
                      fileType={item.fileType}
                      size={item.size}
                      modified={item.modified}
                      tags={item.tags}
                      isFavorite={item.isFavorite}
                      onToggleFavorite={() => removeFavorite(item)}
                      onClick={() => handleFileClick(item)}
                    />
                  </div>
                </FileContextMenu>
              );
            })}
          </div>
        </div>
      </ScrollArea>

      <FileDetailsSheet
        open={Boolean(selectedFileId)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedFileId(null);
          }
        }}
        fileId={selectedFileId}
      />
    </div>
  );
}

function formatDateParts(value?: string) {
  if (!value) return { full: "Unknown", date: "Unknown", time: "" };

  const dateObj = new Date(value);
  if (Number.isNaN(dateObj.getTime())) return { full: "Unknown", date: "Unknown", time: "" };

  return {
    full: dateObj.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }),
    date: dateObj.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    time: dateObj.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }),
  };
}

function formatSize(size?: number) {
  const bytes = Number(size ?? 0);
  if (!Number.isFinite(bytes) || bytes <= 0) return "-";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const power = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / Math.pow(1024, power);
  const decimals = value >= 100 || power === 0 ? 0 : 1;

  return `${value.toFixed(decimals)} ${units[power]}`;
}

function parseSortTime(value?: string) {
  if (!value) return 0;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

async function parseJsonResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) return {} as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    return {} as T;
  }
}
