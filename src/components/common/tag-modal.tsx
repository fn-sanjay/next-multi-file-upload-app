"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { BRAND_COLORS, MAX_TAGS_PER_USER } from "@/lib/constants";

interface TagModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileId: string;
}

export function TagModal({
  open,
  onOpenChange,
  fileId,
}: TagModalProps) {
  const [name, setName] = React.useState("");
  const [color, setColor] = React.useState(BRAND_COLORS[0]);
  const [loading, setLoading] = React.useState(false);
  const [tagCount, setTagCount] = React.useState(0);
  const maxTagsReached = tagCount >= MAX_TAGS_PER_USER;

  React.useEffect(() => {
    if (!open) return;

    const loadTagCount = async () => {
      try {
        const res = await fetch("/api/user/tags");
        const data = await res.json();
        setTagCount((data.tags || []).length);
      } catch (err) {
        console.error("Failed to fetch tags:", err);
      }
    };

    loadTagCount();
  }, [open]);

  const createTag = async () => {
    if (!name.trim() || maxTagsReached) return;

    try {
      setLoading(true);

      const res = await fetch("/api/user/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          color,
          fileId,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create tag");
      }

      setName("");
      setTagCount((prev) => prev + 1);
      onOpenChange(false);

    } catch (err) {
      console.error("Tag creation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0a0a0a] border border-primary/40 text-white">

        <DialogHeader>
          <DialogTitle className="text-lg font-black uppercase italic">
            Create Tag
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">

          {/* TAG NAME */}
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-zinc-500">
              Tag Name
            </p>

            <Input
              placeholder="work, json, design..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-black border-white/10"
            />
          </div>

          {/* COLOR PICKER */}
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-widest text-zinc-500">
              Color
            </p>

            <div className="flex flex-wrap gap-3">

              {BRAND_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border transition-all ${
                    color === c
                      ? "scale-110 border-white"
                      : "border-white/10"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}

            </div>
          </div>

          {/* ACTION */}
          <Button
            onClick={createTag}
            disabled={loading || maxTagsReached}
            className="w-full bg-primary text-black hover:bg-primary/80 font-bold"
          >
            {loading ? "Creating..." : "Create Tag"}
          </Button>

        </div>
      </DialogContent>
    </Dialog>
  );
}
