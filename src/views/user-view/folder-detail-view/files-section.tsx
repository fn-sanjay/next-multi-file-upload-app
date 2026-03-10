"use client";

import { MoreVertical } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileContextMenu } from "@/components/common/file-context-menu";
import { openContextMenuFromButton } from "@/lib/open-context-menu";

interface FilesSectionProps {
  files: Array<{
    id?: string;
    name?: string;
    size?: string;
    created?: string;
    tags?: Array<{
      id?: string;
      name?: string;
      color?: string;
    }>;
  }>;
  onSelectFile: (file: {
    id?: string;
    name?: string;
    size?: string;
    created?: string;
    tags?: Array<{
      id?: string;
      name?: string;
      color?: string;
    }>;
  }) => void;
}

function getFileLabel(name?: string) {
  if (!name) return "FILE";

  if (!name.includes(".")) return "FILE";

  return name.split(".").pop()?.toUpperCase() || "FILE";
}

export function FilesSection({ files, onSelectFile }: FilesSectionProps) {
  return (
    <section className="space-y-6">
      {/* HEADER */}

      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">
            Files
          </h2>

          <span className="text-xs font-bold text-white/30">
            {files.length} items
          </span>
        </div>
      </div>

      {/* GRID */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
        {files.map((file) => {
          const label = getFileLabel(file?.name ?? "");

          return (
            <FileContextMenu
              key={file.id}
              id={file.id}
              name={file.name ?? "Untitled"}
              type="file"
              currentFolderId={null}
              onViewDetails={() => onSelectFile(file)}
            >
              <Card
                className="group overflow-hidden hover:border-primary/30 transition-all duration-300 cursor-pointer border-white/5 bg-white/5 hover:bg-white/10"
                onClick={() => onSelectFile(file)}
              >
                {/* PREVIEW */}

                <div className="relative h-40 bg-black flex items-center justify-center overflow-hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 z-20 h-8 w-8 rounded-lg bg-black/30 text-zinc-300 hover:bg-black/50 hover:text-white"
                    onClick={openContextMenuFromButton}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>

                  <div className="text-4xl font-black uppercase tracking-widest text-primary opacity-70">
                    {label}
                  </div>
                </div>

                {/* FILE INFO */}

                <div className="p-4 space-y-3">
                  <div className="space-y-1">
                    <h3 className="font-bold truncate text-sm text-white group-hover:text-primary transition-colors">
                      {file.name ?? "Untitled"}
                    </h3>

                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      <span>{file.size ?? "-"}</span>

                      <span className="w-1 h-1 rounded-full bg-white/20" />

                      <span>Created {file.created ?? "-"}</span>
                    </div>
                  </div>

                  {/* TAGS */}

                  <div className="flex flex-wrap gap-1.5">
                    {file.tags?.map((tag, index: number) => (
                      <span
                        key={`${file.id}-${tag.id ?? tag.name}-${index}`}
                        className="text-[10px] font-black tracking-widest uppercase"
                        style={{ color: tag.color }}
                      >
                        #{tag.name}
                      </span>
                    ))}
                    {(!file.tags || file.tags.length === 0) && (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                        No Tags
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            </FileContextMenu>
          );
        })}
      </div>
    </section>
  );
}
