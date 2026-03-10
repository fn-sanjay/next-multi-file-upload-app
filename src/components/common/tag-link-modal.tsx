"use client";

import * as React from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { BRAND_COLORS, MAX_TAGS_PER_USER } from "@/lib/constants";

interface TagLinkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileId: string;
  mode?: "file" | "folder";
  existingTags: Array<{
    tagId?: string;
    tag?: {
      id?: string;
    };
  }>;
}

export function TagLinkModal({
  open,
  onOpenChange,
  fileId,
  mode = "file",
  existingTags,
}: TagLinkModalProps) {

  const [tags, setTags] = React.useState<
    Array<{
      id: string;
      name: string;
      color: string;
    }>
  >([]);

  const [newTagName, setNewTagName] = React.useState("");
  const [newTagColor, setNewTagColor] = React.useState(BRAND_COLORS[0]);

  const [attachedTags, setAttachedTags] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);
  const maxTagsReached = tags.length >= MAX_TAGS_PER_USER;

  /* load tags */

  React.useEffect(() => {
    if (!open) return;

    const loadTags = async () => {
      const res = await fetch("/api/user/tags");
      const data = await parseJsonResponse<{
        error?: string;
        tags?: Array<{ id: string; name: string; color: string }>;
      }>(res);

      if (!res.ok) {
        toast.error(data.error || "Failed to load tags");
        return;
      }

      setTags(data.tags || []);

      const selected = (existingTags || [])
        .map((t) => t.tagId || t.tag?.id)
        .filter((id): id is string => Boolean(id));
      setAttachedTags(selected);
    };

    loadTags();
  }, [open, existingTags]);

  /* attach tag */

  const attachTag = async (tagId: string) => {

    if (attachedTags.includes(tagId)) {
      toast.warning("Tag already attached");
      return;
    }

    const endpoint = mode === "folder" ? "/api/user/tags/folders" : "/api/user/tags/files";
    const body =
      mode === "folder"
        ? { folderId: fileId, tagId }
        : { fileId, tagId };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await parseJsonResponse<{ error?: string }>(res);

    if (!res.ok) {
      toast.error(data.error || "Failed to attach tag");
      return;
    }

    setAttachedTags((prev) => [...prev, tagId]);

    toast.success("Tag attached");
  };

  /* remove tag */

  const removeTag = async (tagId: string) => {

    const endpoint = mode === "folder" ? "/api/user/tags/folders" : "/api/user/tags/files";
    const body =
      mode === "folder"
        ? { folderId: fileId, tagId }
        : { fileId, tagId };

    const res = await fetch(endpoint, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      toast.error("Failed to remove tag");
      return;
    }

    setAttachedTags((prev) =>
      prev.filter((id) => id !== tagId)
    );

    toast.success("Tag removed");
  };

  /* create tag */

  const createTag = async () => {
    if (!newTagName.trim() || maxTagsReached) return;

    setLoading(true);

    const res = await fetch("/api/user/tags", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: newTagName,
        color: newTagColor,
      }),
    });

    const data = await parseJsonResponse<{
      error?: string;
      tag?: { id: string; name: string; color: string };
    }>(res);

    if (!res.ok) {
      toast.error(data.error || "Failed to create tag");
      setLoading(false);
      return;
    }

    const createdTag = data.tag;
    if (!createdTag?.id) {
      toast.error("Failed to create tag");
      setLoading(false);
      return;
    }

    setTags((prev) => [...prev, createdTag]);

    await attachTag(createdTag.id);

    setNewTagName("");
    setLoading(false);

    toast.success("Tag created");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0a0a0a] border border-primary/40 text-white">

        <DialogHeader>
          <DialogTitle className="uppercase font-black">
            Manage Tags
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">

          {/* TAG LIST */}

          <div className="flex flex-wrap gap-3">

            {tags.map((tag) => {

              const selected = attachedTags.includes(tag.id);

              return (
                <button
                  key={tag.id}
                  onClick={() =>
                    selected
                      ? removeTag(tag.id)
                      : attachTag(tag.id)
                  }
                  className={`px-4 py-2 text-xs font-bold rounded-xl border transition ${
                    selected ? "scale-105 ring-1 ring-white/30" : ""
                  }`}
                  style={{
                    borderColor: tag.color,
                    backgroundColor: `${tag.color}1A`,
                    color: tag.color,
                  }}
                >
                  {tag.name}
                </button>
              );
            })}

          </div>

          {/* CREATE TAG */}

          <div className="space-y-4 border-t border-white/10 pt-4">

            <Input
              placeholder="New tag name..."
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              className="bg-black border-white/10"
              disabled={maxTagsReached}
            />

            <div className="flex gap-3 flex-wrap">

              {BRAND_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setNewTagColor(c)}
                  className={`w-8 h-8 rounded-full border transition ${
                    newTagColor === c
                      ? "border-white scale-110"
                      : "border-white/10"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}

            </div>

            <Button
              onClick={createTag}
              disabled={loading || maxTagsReached}
              className="w-full bg-primary text-black font-bold"
            >
              {loading ? "Creating..." : "Create Tag"}
            </Button>

          </div>

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
