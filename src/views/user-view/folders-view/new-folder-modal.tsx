"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Folder, X } from "lucide-react";

import { BRAND_COLORS } from "@/lib/constants";

interface FolderTag {
  tag?: {
    id?: string;
    name?: string;
  };
}

interface CreatedFolder {
  id: string;
  name: string;
  tags?: FolderTag[];
  createdAt?: string;
  updatedAt?: string;
}

interface TagOption {
  id: string;
  name: string;
  color: string;
}

interface NewFolderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  parentId?: string | null;

  onCreated?: (folder: CreatedFolder) => void;
}

export function NewFolderModal({
  open,
  onOpenChange,
  parentId = null,
  onCreated,
}: NewFolderModalProps) {

  const [name, setName] = React.useState("");
  const [availableTags, setAvailableTags] = React.useState<TagOption[]>([]);
  const [selectedTagIds, setSelectedTagIds] = React.useState<string[]>([]);

  const [newTagName, setNewTagName] = React.useState("");
  const [newTagColor, setNewTagColor] = React.useState(BRAND_COLORS[0]);

  const [loadingTags, setLoadingTags] = React.useState(false);
  const [creatingTag, setCreatingTag] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;

    const loadTags = async () => {
      setLoadingTags(true);
      const res = await fetch("/api/user/tags");
      const data = await parseJsonResponse<{
        error?: string;
        tags?: TagOption[];
      }>(res);
      setLoadingTags(false);

      if (!res.ok) {
        toast.error(data.error || "Failed to load tags");
        return;
      }

      setAvailableTags(data.tags || []);
      setSelectedTagIds([]);
      setNewTagName("");
      setNewTagColor(BRAND_COLORS[0]);
      setName("");
    };

    loadTags();
  }, [open]);

  const toggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      setSelectedTagIds((prev) => prev.filter((id) => id !== tagId));
      return;
    }

    if (selectedTagIds.length >= 3) {
      toast.error("Maximum 3 tags per folder");
      return;
    }

    setSelectedTagIds((prev) => [...prev, tagId]);
  };

  const createTag = async () => {
    if (!newTagName.trim()) return;

    setCreatingTag(true);

    const res = await fetch("/api/user/tags", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: newTagName.trim(),
        color: newTagColor,
      }),
    });

    const data = await parseJsonResponse<{
      error?: string;
      tag?: TagOption;
    }>(res);

    setCreatingTag(false);

    if (!res.ok) {
      toast.error(data.error || "Failed to create tag");
      return;
    }

    const createdTag = data.tag;
    if (!createdTag?.id) {
      toast.error("Failed to create tag");
      return;
    }

    setAvailableTags((prev) => [...prev, createdTag]);
    setNewTagName("");

    if (selectedTagIds.length < 3) {
      setSelectedTagIds((prev) => [...prev, createdTag.id]);
    } else {
      toast.warning("Tag created, but max 3 selected");
    }

    toast.success("Tag created");
  };

  const handleCreate = async () => {
    if (!name.trim()) return;

    try {
      setLoading(true);

      const res = await fetch("/api/user/folders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          parentId,
          tagIds: selectedTagIds,
        }),
      });

      const data = await parseJsonResponse<{
        error?: string;
        folder?: CreatedFolder;
      }>(res);

      if (!res.ok) {
        throw new Error(data.error || "Failed to create folder");
      }

      if (data.folder) {
        onCreated?.(data.folder);
      }

      onOpenChange(false);
      toast.success("Folder created");

    } catch (error) {
      console.error("Create folder error:", error);
      toast.error("Failed to create folder");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-120 bg-[#0a0a0a] border-white/10 text-white rounded-3xl overflow-hidden p-0 gap-0">

        <div className="p-6 space-y-6">

          <DialogHeader className="space-y-3 px-0">
            <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Folder className="w-6 h-6 fill-current" />
              </div>
              New Folder
            </DialogTitle>

            <DialogDescription className="text-zinc-500 font-medium">
              Create a new folder to organize your files.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">

            {/* NAME */}
            <div className="space-y-3">
              <Label className="text-sm font-black uppercase tracking-[0.2em] text-zinc-500">
                Folder Name
              </Label>

              <Input
                placeholder="e.g. Design Assets"
                className="h-12 bg-white/5 border-white/10 rounded-xl font-bold"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* TAGS */}
            <div className="space-y-3">
              <Label className="text-sm font-black uppercase tracking-[0.2em] text-zinc-500">
                Tags ({selectedTagIds.length}/3)
              </Label>

              {selectedTagIds.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedTagIds.map((id) => {
                    const tag = availableTags.find((t) => t.id === id);
                    if (!tag) return null;
                    return (
                      <div
                        key={id}
                        className="flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold"
                        style={{
                          borderColor: tag.color,
                          backgroundColor: `${tag.color}33`,
                          color: tag.color,
                        }}
                      >
                        {tag.name}
                        <button
                          type="button"
                          onClick={() => toggleTag(tag.id)}
                          className="ml-1 rounded-full p-0.5 hover:bg-white/10"
                          aria-label={`Remove tag ${tag.name}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                {loadingTags && (
                  <p className="text-xs text-zinc-500">Loading tags...</p>
                )}

                {!loadingTags && availableTags.length === 0 && (
                  <p className="text-xs text-zinc-500">No tags found</p>
                )}

                {availableTags.map((tag) => {
                  const selected = selectedTagIds.includes(tag.id);

                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`px-4 py-2 text-xs font-bold rounded-xl border transition ${
                        selected ? "scale-105 ring-2 ring-white/40" : ""
                      }`}
                      style={{
                        borderColor: tag.color,
                        backgroundColor: selected ? tag.color : `${tag.color}1A`,
                        color: selected ? "#0a0a0a" : tag.color,
                      }}
                    >
                      {selected && <Check className="mr-2 inline h-3 w-3" />}
                      {tag.name}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-3 border-t border-white/10 pt-4">
                <Input
                  placeholder="New tag name..."
                  className="h-12 bg-white/5 border-white/10 rounded-xl font-bold"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                />

                <div className="flex gap-3 flex-wrap">
                  {BRAND_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewTagColor(color)}
                      className={`w-8 h-8 rounded-full border transition ${
                        newTagColor === color
                          ? "border-white scale-110"
                          : "border-white/10"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  disabled={!newTagName.trim() || creatingTag}
                  onClick={createTag}
                  className="w-full border-primary/30 bg-primary/10 hover:bg-primary/20"
                >
                  {creatingTag ? "Creating tag..." : "Create Tag"}
                </Button>
              </div>
            </div>

          </div>

        </div>

        {/* FOOTER */}
        <div className="p-6 bg-white/2 border-t border-white/5 flex items-center justify-end gap-3">

          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            disabled={!name.trim() || loading}
            onClick={handleCreate}
          >
            {loading ? "Creating..." : "Create Folder"}
          </Button>

        </div>

      </DialogContent>
    </Dialog>
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
