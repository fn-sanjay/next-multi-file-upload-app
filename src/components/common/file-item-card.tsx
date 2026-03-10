"use client";

import { MoreVertical, Play, Star } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { openContextMenuFromButton } from "@/lib/open-context-menu";
import { cn } from "@/lib/utils";
import { getFileIconMeta } from "@/lib/file-icons";

interface FileItemCardProps {
  fileId: string;
  fileName: string;
  fileType?: string;
  mimeType?: string;
  size: string;
  modified: string;
  previewUrl?: string;
  tags?: string[];
  onClick?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  showFavorite?: boolean;
  topRight?: ReactNode;
  className?: string;
}

export function FileItemCard({
  fileId,
  fileName,
  fileType,
  mimeType,
  size,
  modified,
  previewUrl,
  tags = [],
  onClick,
  isFavorite,
  onToggleFavorite,
  showFavorite = true,
  topRight,
  className,
}: FileItemCardProps) {

  const { label } = getFileIconMeta(fileName, fileType);

  const isImage = mimeType?.startsWith("image");
  const isVideo = mimeType?.startsWith("video");
  const isPdf = mimeType === "application/pdf";

  const previewText = fileName.includes(".")
    ? (fileName.split(".").pop() || label).toUpperCase()
    : label.toUpperCase();

  return (
    <Card
      className={cn(
        "group overflow-hidden hover:border-primary/30 transition-all duration-300 cursor-pointer border-white/5 bg-white/5 hover:bg-white/10 h-full",
        className
      )}
      onClick={onClick}
    >
      {topRight && <div className="absolute top-4 left-4 z-20">{topRight}</div>}

      {showFavorite && (
        <div className="absolute top-4 right-14 z-20">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg bg-black/30 text-primary hover:bg-black/50"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onToggleFavorite?.();
            }}
          >
            <Star
              className={cn(
                "w-4 h-4",
                isFavorite ? "fill-primary text-primary" : "fill-transparent text-primary"
              )}
            />
          </Button>
        </div>
      )}

      {/* Preview Area */}
      <div className="relative h-40 bg-black flex items-center justify-center overflow-hidden">

        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-20 h-8 w-8 rounded-lg bg-black/30 text-zinc-300 hover:bg-black/50 hover:text-white"
          onClick={openContextMenuFromButton}
        >
          <MoreVertical className="w-4 h-4" />
        </Button>

        {/* IMAGE */}
        {isImage && previewUrl && (
          <img
            src={previewUrl}
            alt={fileName}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        )}

        {/* VIDEO */}
        {isVideo && previewUrl && (
          <video
            src={previewUrl}
            className="absolute inset-0 w-full h-full object-cover"
            muted
          />
        )}

        {/* PDF */}
        {isPdf && previewUrl && (
          <iframe
            src={previewUrl}
            className="absolute inset-0 w-full h-full"
          />
        )}

        {/* Fallback */}
        {!isImage && !isVideo && !isPdf && (
          <div className="text-4xl font-black opacity-55 uppercase tracking-wide text-primary">
            {previewText}
          </div>
        )}

        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="p-3 rounded-full bg-white/10 border border-white/20">
              <Play className="w-5 h-5 fill-white text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Bottom */}
      <div className="p-4 space-y-3">
        <div className="space-y-1">
          <h3 className="font-bold truncate text-sm text-white group-hover:text-primary transition-colors">
            {fileName}
          </h3>

          <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
            <span>{size}</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>{modified}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-black tracking-widest text-primary uppercase opacity-70 group-hover:opacity-100"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}