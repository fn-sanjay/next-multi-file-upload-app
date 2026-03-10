"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TagsHeader } from "./tags-header";
import { TagsSidebar } from "./tags-sidebar";
import { TaggedItemsGrid } from "./tagged-items-grid";
import type { TaggedContentItem } from "@/types";
import { fetchWithRefresh } from "@/lib/client/auth-api";
import { FileDetailsSheet } from "@/components/common/file-details-sheet";
import { getFileIconMeta } from "@/lib/file-icons";
import { toast } from "sonner";

const getErrorMessage = (err: unknown, fallback: string) =>
  err instanceof Error ? err.message : fallback;

interface Tag {
  id: string;
  name: string;
  color: string;
  count?: number;
}

interface ApiTag {
  id: string;
  name: string;
  color: string;
}

interface ApiTagRef {
  tag?: {
    id?: string;
    name?: string;
  };
}

interface ApiFileItem {
  id: string;
  filename: string;
  tags?: ApiTagRef[];
  blob?: {
    size?: number;
  };
  createdAt: string;
}

interface ApiFolderItem {
  id: string;
  name: string;
  tags?: ApiTagRef[];
  createdAt: string;
}

type SelectedFile = {
  id: string;
  name: string;
  type: string;
  size: string;
  modified: string;
  tags?: string[];
  icon: ReturnType<typeof getFileIconMeta>["icon"];
  iconColor: string;
};

export default function TagsView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const [tags, setTags] = useState<Tag[]>([]);
  const [taggedItems, setTaggedItems] = useState<TaggedContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Tags
  const fetchTags = async () => {
    try {
      const res = await fetchWithRefresh("/api/user/tags");
      if (res.ok) {
        const data = (await res.json()) as { tags?: ApiTag[] };
        // Since we don't have count from API directly, we might need a workaround or just set to 0
        setTags((data.tags || []).map((t) => ({ ...t, count: 0 })));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const [filesRes, foldersRes] = await Promise.all([
        fetchWithRefresh(`/api/user/files`),
        fetchWithRefresh(`/api/user/folders`),
      ]);

      const items: TaggedContentItem[] = [];
      const counts: Record<string, number> = {};
      const bump = (id?: string | null, name?: string | null) => {
        const key = id || name;
        if (!key) return;
        counts[key] = (counts[key] || 0) + 1;
      };

      if (filesRes.ok) {
        const filesData = (await filesRes.json()) as { files?: ApiFileItem[] };
        const files: TaggedContentItem[] = (filesData.files || []).map(
          (f) => ({
            id: f.id,
            name: f.filename,
            type: "file",
            tag: f.tags?.[0]?.tag?.name || "Uncategorized",
            tagId: f.tags?.[0]?.tag?.id,
            size: f.blob?.size
              ? `${(f.blob.size / 1024 / 1024).toFixed(2)} MB`
              : "Unknown size",
            date: new Date(f.createdAt).toLocaleDateString(),
          }),
        );
        (filesData.files || []).forEach((f) =>
          bump(f.tags?.[0]?.tag?.id, f.tags?.[0]?.tag?.name),
        );
        items.push(...files);
      }

      if (foldersRes.ok) {
        const foldersData = (await foldersRes.json()) as {
          folders?: ApiFolderItem[];
        };
        const folders: TaggedContentItem[] = (foldersData.folders || []).map(
          (f) => ({
            id: f.id,
            name: f.name,
            type: "folder",
            tag: f.tags?.[0]?.tag?.name || "Uncategorized",
            tagId: f.tags?.[0]?.tag?.id,
            items: 0, // Mock count
            date: new Date(f.createdAt).toLocaleDateString(),
          }),
        );
        (foldersData.folders || []).forEach((f) =>
          bump(f.tags?.[0]?.tag?.id, f.tags?.[0]?.tag?.name),
        );
        items.push(...folders);
      }

      setTaggedItems(items);
      // update tag counts
      setTags((prev) =>
        prev.map((tag) => ({
          ...tag,
          count: counts[tag.id] ?? counts[tag.name] ?? 0,
        })),
      );
    } catch (e) {
      console.error("Failed to fetch categorized items", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch items based on selected tag
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const filteredTags = useMemo(() => {
    return tags.filter((tag) =>
      tag.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery, tags]);

  const selectedTagName = useMemo(
    () =>
      selectedTagId
        ? tags.find((t) => t.id === selectedTagId)?.name || null
        : null,
    [selectedTagId, tags],
  );

  const filteredItems = useMemo(() => {
    if (!selectedTagId && !selectedTagName) return taggedItems;
    return taggedItems.filter(
      (item) =>
        (selectedTagId && item.tagId === selectedTagId) ||
        (!item.tagId && selectedTagName && item.tag === selectedTagName),
    );
  }, [taggedItems, selectedTagId, selectedTagName]);

  const handleFileClick = (item: TaggedContentItem) => {
    if (item.type !== "file") return;

    const iconMeta = getFileIconMeta(item.name);
    setSelectedFile({
      id: item.id,
      name: item.name,
      type: iconMeta.label,
      size: item.size || "Unknown size",
      modified: item.date,
      tags: [item.tag],
      icon: iconMeta.icon,
      iconColor: iconMeta.iconColor,
    });
    setIsSheetOpen(true);
  };

  const handleDeleteTag = async (tagId: string) => {
    try {
      const res = await fetchWithRefresh(`/api/user/tags/${tagId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await parseJsonResponse<{ error?: string }>(res);
        throw new Error(data.error || "Failed to delete tag");
      }
      if (selectedTagId === tagId) {
        setSelectedTagId(null);
      }
      await fetchTags();
      await fetchItems();
      toast.success("Tag deleted successfully");
    } catch (err: unknown) {
      console.error(err);
      toast.error(getErrorMessage(err, "Failed to delete tag"));
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden font-sans">
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-8 max-w-400 mx-auto pb-20">
          <TagsHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            tagCount={tags.length}
            onTagCreated={fetchTags}
          />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <TagsSidebar
              tags={filteredTags}
              selectedTagId={selectedTagId}
              totalItems={selectedTagId ? filteredItems.length : taggedItems.length}
              onSelectTag={setSelectedTagId}
              onDeleteTag={handleDeleteTag}
            />
            <TaggedItemsGrid
              selectedTagName={selectedTagName}
              items={isLoading ? [] : filteredItems}
              onFileClick={handleFileClick}
            />
          </div>
        </div>
      </ScrollArea>

      <FileDetailsSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        fileId={selectedFile?.id ?? null}
      />
    </div>
  );
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
