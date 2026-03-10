"use client";

import { X, Plus, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FolderDetailToolbarProps {
  tags: {
    id: string;
    name: string;
    color: string;
  }[];
  folderId: string;
  onAddTag: () => void;
  onRemoveTag: (tagId: string) => void;
}

export function FolderDetailToolbar({
  tags,
  onAddTag,
  onRemoveTag,
}: FolderDetailToolbarProps) {

  return (
    <div className="flex flex-wrap items-center gap-3">

      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">

        <Tag className="w-4 h-4" />

        Tags ({tags.length} / 3)

      </div>

      {tags.map((tag) => (

        <div
          key={tag.id}
          className="group flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl border transition-all duration-200 hover:scale-105"
          style={{
            borderColor: tag.color,
            backgroundColor: `${tag.color}1A`,
            color: tag.color,
          }}
        >

          {tag.name}

          <button
            onClick={() => onRemoveTag(tag.id)}
            className="transition"
          >
            <X className="w-3 h-3" />
          </button>

        </div>

      ))}

      <Button
        onClick={onAddTag}
        variant="outline"
        className="h-9 border-dashed border-white/10 bg-white/5 hover:bg-white/10 text-zinc-400 rounded-xl px-3 text-xs font-bold gap-2"
      >
        <Plus className="w-3 h-3" />
        Add
      </Button>

    </div>
  );
}