"use client";

import { useEffect, useState } from "react";
import Dashboard from "@uppy/react/dashboard";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

import { useUpload } from "@/components/providers/upload-provider";
import { fetchWithRefresh } from "@/lib/client/auth-api";

import { Plus, Tag, Upload, X } from "lucide-react";
import { BRAND_COLORS, MAX_TAGS_PER_USER } from "@/lib/constants";

import "@uppy/core/css/style.css";
import "@uppy/dashboard/css/style.css";

interface TagType {
  id: string;
  name: string;
  color: string;
}



export function UploadModal() {
  const { uppy, isModalOpen, setIsModalOpen } = useUpload();

  const [tags, setTags] = useState<TagType[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [color, setColor] = useState(BRAND_COLORS[0]);

  const [files, setFiles] = useState(() => uppy.getFiles());
  const maxTagsReached = tags.length >= MAX_TAGS_PER_USER;

  /* ---------------- fetch tags ---------------- */

  const fetchTags = async () => {
    try {
      const res = await fetchWithRefresh("/api/user/tags");

      if (res.ok) {
        const data = await res.json();
        setTags(data.tags || []);
      }
    } catch (err) {
      console.error("tag fetch failed", err);
    }
  };

  useEffect(() => {
    if (isModalOpen) fetchTags();
  }, [isModalOpen]);

  /* ---------------- sync files ---------------- */

  useEffect(() => {
    const sync = () => setFiles(uppy.getFiles());

    uppy.on("file-added", sync);
    uppy.on("file-removed", sync);
    uppy.on("complete", sync);

    sync();

    return () => {
      uppy.off("file-added", sync);
      uppy.off("file-removed", sync);
      uppy.off("complete", sync);
    };
  }, [uppy]);

  useEffect(() => {
    const tagIds = selectedTags.join(",");
    uppy.setMeta({ tagIds, tags: "" });
    uppy.getFiles().forEach((file) => {
      uppy.setFileMeta(file.id, { tagIds, tags: "" });
    });
  }, [selectedTags, files, uppy]);

  /* ---------------- toggle tag ---------------- */

  const toggleTag = (id: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(id)) {
        return prev.filter((t) => t !== id);
      }

      if (prev.length >= 3) return prev;

      return [...prev, id];
    });
  };

  /* ---------------- create tag ---------------- */

  const createTag = async () => {
    if (!tagInput.trim() || maxTagsReached) return;

    try {
      const res = await fetchWithRefresh("/api/user/tags", {
        method: "POST",
        body: JSON.stringify({
          name: tagInput.trim(),
          color,
        }),
      });

      if (res.ok) {
        const data = await res.json();

        const newTag = data.tag;

        setTags((prev) => [...prev, newTag]);
        setTagInput("");

        if (selectedTags.length < 3) {
          setSelectedTags((prev) => [...prev, newTag.id]);
        }
      }
    } catch (err) {
      console.error("create tag failed", err);
    }
  };

  /* ---------------- upload ---------------- */

  const startUpload = async () => {
    if (!files.length) return;

    setIsModalOpen(false);
    await uppy.upload();
  };

  /* ---------------- UI ---------------- */

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent className="w-275 max-w-[min(98vw,1800px)] border-none bg-transparent p-0 shadow-none">

        <div className="flex max-h-[80vh] flex-col overflow-hidden rounded-3xl border border-white/10 bg-black/90 backdrop-blur-xl">

          <DialogTitle className="sr-only">Upload Files</DialogTitle>

          {/* HEADER */}

          <div className="flex items-start justify-between border-b border-white/5 px-8 py-5">

            <div>
              <h2 className="text-xl font-semibold text-white">
                Upload Files
              </h2>

              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                BULK UPLOAD DOCUMENTS, IMAGES, AND MORE
              </p>
            </div>

            

          </div>

          <ScrollArea className="flex-1 max-h-[60vh] pr-2">

            <div className="space-y-6 px-8 py-6">

              {/* TAGS */}

              {files.length > 0 && (
                <div className="rounded-xl border border-white/10 bg-white/3 p-6">

                  <div className="mb-5 flex items-center gap-2 text-sm text-muted-foreground">
                    <Tag className="h-4 w-4" />
                    APPLY TAGS (MAX 3)
                  </div>

                  {/* Selected tags */}

                  <div className="mb-4 flex flex-wrap gap-2">

                    {selectedTags.map((id) => {
                      const tag = tags.find((t) => t.id === id);
                      if (!tag) return null;

                      return (
                        <Badge
                          key={id}
                          style={{
                            backgroundColor: `${tag.color}25`,
                            color: tag.color,
                          }}
                          className="gap-1"
                        >
                          {tag.name}

                          <button onClick={() => toggleTag(tag.id)}>
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      );
                    })}

                  </div>

                  {/* Tag input */}

                  <div className="relative">

                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Create new tag..."
                      className="bg-black/40 border-white/10 text-white pr-20"
                      disabled={maxTagsReached}
                    />

                    <button
                      onClick={createTag}
                      disabled={maxTagsReached}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md border border-primary/40 bg-primary/10 px-3 py-1 text-xs text-primary hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4" />
                    </button>

                  </div>

                  {/* Color picker */}

                  <div className="mt-5 flex items-center gap-3">

                    <span className="text-xs text-muted-foreground">
                      Color:
                    </span>

                    <div className="flex gap-2">
                      {BRAND_COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() => setColor(c)}
                          className={`h-6 w-6 rounded-full border-2 ${
                            color === c
                              ? "border-white"
                              : "border-transparent"
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>

                  </div>

                  {/* Suggested tags */}

                  {tags.length > 0 && (
                    <div className="mt-6">

                      <p className="mb-2 text-xs text-muted-foreground">
                        Suggested Tags
                      </p>

                      <div className="flex flex-wrap gap-2">

                        {tags.map((tag) => {
                          const selected = selectedTags.includes(tag.id);

                          return (
                            <button
                              key={tag.id}
                              onClick={() => toggleTag(tag.id)}
                              disabled={!selected && selectedTags.length >= 3}
                              className={`rounded-full border px-3 py-1 text-xs transition
                              ${
                                selected
                                  ? "bg-white/10"
                                  : "hover:bg-white/5"
                              }`}
                              style={{
                                borderColor: `${tag.color}60`,
                                color: tag.color,
                              }}
                            >
                              {tag.name}
                            </button>
                          );
                        })}

                      </div>

                    </div>
                  )}

                </div>
              )}

              {/* Upload area */}

              <div className="rounded-xl border border-white/10 bg-primary/10 p-4">

                <Dashboard
                  uppy={uppy}
                  width="100%"
                  height={360}
                  className="uppy-dashboard"
                  theme="dark"
                  proudlyDisplayPoweredByUppy={false}
                  hideUploadButton
                  fileManagerSelectionType="both"
                  note="Drop files or folders here or browse files"
                />

              </div>

            </div>

          </ScrollArea>

          {/* FOOTER */}

          <div className="flex items-center border-t border-white/5 px-10 py-4">

            <Button
              disabled={!files.length}
              onClick={startUpload}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary text-black hover:bg-primary/90"
            >
              <Upload className="h-4 w-4" />
              Upload Files
            </Button>

          </div>

        </div>

        <style jsx global>{`
          .uppy-dashboard .uppy-DashboardItem-name,
          .uppy-dashboard .uppy-DashboardItem-fileInfo,
          .uppy-dashboard .uppy-DashboardItem-status,
          .uppy-dashboard .uppy-DashboardItem-progressInfo,
          .uppy-dashboard .uppy-StatusBar,
          .uppy-dashboard .uppy-StatusBar-statusPrimary,
          .uppy-dashboard .uppy-StatusBar-statusSecondary {
            color: #e5e7eb !important;
          }
        `}</style>

      </DialogContent>
    </Dialog>
  );
}
