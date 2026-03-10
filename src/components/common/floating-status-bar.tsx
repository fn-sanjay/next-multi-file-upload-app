"use client";

import React from "react";
import { useUpload } from "@/components/providers/upload-provider";
import { Progress } from "@/components/ui/progress";
import {
  CloudUpload,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FloatingStatusBar() {
  const { files, totalProgress, setIsModalOpen } = useUpload();
  const [isExpanded, setIsExpanded] = React.useState(false);

  const activeUploads = files.filter((f) => f.status === "uploading");
  const completedUploads = files.filter((f) => f.status === "complete");

  if (files.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 font-sans">
      <div className="bg-card border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2 rounded-lg",
                totalProgress === 100
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-primary/10 text-primary",
              )}
            >
              {totalProgress === 100 ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <CloudUpload className="w-4 h-4 animate-pulse" />
              )}
            </div>
            <div>
              <p className="text-sm font-bold">
                {totalProgress === 100
                  ? "Uploads Complete"
                  : "Uploading Files..."}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">
                {completedUploads.length} of {files.length} done
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 text-zinc-400 hover:text-white"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Progress Bar (Global) */}
        <div className="px-4 py-3 bg-zinc-900/50">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1.5">
            <span className="text-zinc-500">Overall Progress</span>
            <span className="text-primary">{totalProgress}%</span>
          </div>
          <Progress value={totalProgress} className="h-1 bg-white/5" />
        </div>

        {/* Expanded View */}
        {isExpanded && (
          <div className="max-h-60 overflow-y-auto p-2 space-y-1 custom-scrollbar bg-black/40">
            {files.map((file) => (
              <div
                key={file.id}
                className="p-2 rounded-xl bg-white/5 flex items-center justify-between group"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div
                    className={cn(
                      "p-1.5 rounded-md",
                      file.status === "complete"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-white/10 text-white/40",
                    )}
                  >
                    {file.status === "complete" ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <CloudUpload className="w-3 h-3" />
                    )}
                  </div>
                  <span className="text-xs font-medium truncate max-w-35">
                    {file.name}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground">
                  {file.progress}%
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Footer/Action */}
        <div className="p-3 bg-zinc-900/30 flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10"
          >
            View Details in Modal
          </Button>
        </div>
      </div>
    </div>
  );
}
