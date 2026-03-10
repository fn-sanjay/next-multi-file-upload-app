"use client";

import * as React from "react";
import { toast } from "sonner";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import {
  Plus,
  Info,
  Tag,
  ExternalLink,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DownloadModal } from "@/components/common/downlaod-modal";
import { TagLinkModal } from "@/components/common/tag-link-modal";

type FileTagLink = {
  tag: {
    id: string;
    name: string;
    color: string;
  };
};

type FileBlob = {
  size?: number;
  mimeType?: string;
  extension?: string;
};

type FileDetails = {
  id: string;
  filename: string;
  createdAt?: string;
  updatedAt?: string;
  blob?: FileBlob | null;
  tags?: FileTagLink[];
};

interface FileDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileId: string | null;
}

export function FileDetailsSheet({
  open,
  onOpenChange,
  fileId,
}: FileDetailsSheetProps) {

  const [downloadOpen, setDownloadOpen] = React.useState(false);
  const [file, setFile] = React.useState<FileDetails | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [tagModalOpen, setTagModalOpen] = React.useState(false);

  /* ------------------------ */
  /* FETCH FILE DETAILS */
  /* ------------------------ */

  const loadFile = async () => {
    if (!fileId) return;

    try {
      setLoading(true);

      const res = await fetch(`/api/user/files/${fileId}`);
      const data = await res.json();

      setFile(data.file);

      const previewRes = await fetch(`/api/user/files/${fileId}/preview`);
      const previewData = await previewRes.json();

      setPreviewUrl(previewData.previewUrl);

    } catch (err) {
      console.error("Failed to fetch file:", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (!open || !fileId) return;
    loadFile();
  }, [open, fileId]);

  /* ------------------------ */
  /* REMOVE TAG */
  /* ------------------------ */

  const removeTag = async (tagId: string) => {

    const previous = file;

    setFile((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        tags: (prev.tags || []).filter((t) => t.tag.id !== tagId),
      };
    });

    try {
      if (!file) {
        throw new Error("File not loaded");
      }
      const res = await fetch("/api/user/tags/files", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileId: file.id,
          tagId,
        }),
      });

      if (!res.ok) {
        throw new Error();
      }

      toast.success("Tag removed");

    } catch {

      setFile(previous);

      toast.error("Failed to remove tag");
    }
  };

  if (!file) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="bg-[#0a0a0a] text-white">
          <SheetHeader>
            <SheetTitle className="sr-only">File details</SheetTitle>
          </SheetHeader>
          <div className="p-10 text-center text-zinc-500">
            {loading ? "Loading file..." : "No file selected"}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  /* ------------------------ */
  /* FILE DATA */
  /* ------------------------ */

  const size = formatSize(file?.blob?.size);
  const created = formatDate(file?.createdAt);
  const modified = formatDate(file?.updatedAt || file?.createdAt);

  const tags =
    file?.tags?.map((t) => ({
      id: t.tag.id,
      name: t.tag.name,
      color: t.tag.color,
    })) || [];

  const isImage = file?.blob?.mimeType?.startsWith("image");
  const isVideo = file?.blob?.mimeType?.startsWith("video");
  const isPdf = file?.blob?.mimeType === "application/pdf";

  const openInBrowser = () => {
    if (!previewUrl) return;
    window.open(previewUrl, "_blank");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>

      <SheetContent className="w-full sm:max-w-md bg-[#0a0a0a] border-l border-r border-primary/50 p-0 overflow-hidden font-sans">

        <div className="absolute inset-y-0 left-0 w-1 bg-primary shadow-[0_0_20px_rgba(191,255,0,0.5)]" />
        <div className="absolute inset-y-0 right-0 w-1 bg-primary shadow-[0_0_20px_rgba(191,255,0,0.5)]" />

        <ScrollArea className="h-full">

          <div className="p-8 space-y-10 pb-20">

            {/* HEADER */}

            <SheetHeader className="text-left space-y-8">

              <SheetHeader className="px-8 pt-8 pb-4 text-left">
                <SheetTitle className="text-2xl font-black tracking-tight text-white uppercase italic">
                  File Details
                </SheetTitle>
              </SheetHeader>

              {/* PREVIEW */}

              <div className="rounded-2xl overflow-hidden border border-white/5 bg-black">

                {previewUrl ? (

                  isImage ? (
                    <img src={previewUrl} className="w-full" />
                  ) : isVideo ? (
                    <video src={previewUrl} controls className="w-full" />
                  ) : (
                    <iframe src={previewUrl} className="w-full h-96" />
                  )

                ) : (
                  <div className="p-16 text-center text-zinc-500">
                    Loading preview...
                  </div>
                )}

              </div>

              {previewUrl && (
                <Button
                  variant="outline"
                  className="w-full border-white/10 bg-white/5 hover:bg-white/10"
                  onClick={openInBrowser}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in Browser
                </Button>
              )}

              <Button
                variant="outline"
                className="w-full border-primary bg-primary/10 hover:bg-primary/20"
                onClick={() => setDownloadOpen(true)}
              >
                Download File
              </Button>

              <div className="text-center">
                <h2 className="text-lg font-bold text-white">
                  {file.filename}
                </h2>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">
                  {file?.blob?.extension}
                </p>
              </div>

            </SheetHeader>

            {/* INFO */}

            <section className="space-y-6 pt-2">
              <SectionTitle icon={Info} label="Information" />

              <div className="space-y-4">
                <InfoRow label="Size" value={size} />
                <InfoRow label="Created" value={created} />
                <InfoRow label="Modified" value={modified} />
                <InfoRow label="Owner" value="You" />
              </div>
            </section>

            <Separator className="bg-white/5" />

            {/* TAGS */}

            <section className="space-y-6 pt-2">

              <SectionTitle icon={Tag} label={`Tags (${tags.length} / 3)`} />

              <div className="flex flex-wrap items-center gap-3">

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
                      onClick={() => removeTag(tag.id)}
                      className="transition"
                    >
                      <X className="w-3 h-3" />
                    </button>

                  </div>

                ))}

                <Button
                  onClick={() => setTagModalOpen(true)}
                  variant="outline"
                  className="h-10 border-dashed border-white/10 bg-white/5 hover:bg-white/10 text-zinc-400 rounded-xl px-4 text-xs font-bold gap-2"
                >
                  <Plus className="w-3 h-3" />
                  Add
                </Button>

              </div>

            </section>

            <DownloadModal
              open={downloadOpen}
              onOpenChange={setDownloadOpen}
              fileId={file.id}
              filename={file.filename}
            />

            <TagLinkModal
              open={tagModalOpen}
              onOpenChange={(open) => {
                setTagModalOpen(open);

                if (!open) {
                  loadFile(); // refresh tags instantly
                }
              }}
              fileId={file.id}
              existingTags={file.tags ?? []}
            />

          </div>

        </ScrollArea>

      </SheetContent>
    </Sheet>
  );
}

/* ------------------------- */
/* HELPERS */
/* ------------------------- */

function formatDate(date?: string) {
  if (!date) return "-";

  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";

  return d.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatSize(bytes?: number) {
  if (!bytes) return "-";

  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

function SectionTitle({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
        <Icon className="w-3.5 h-3.5 text-primary" />
      </div>
      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
        {label}
      </h3>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-zinc-500">{label}</span>
      <span className="text-sm font-bold text-white">{value}</span>
    </div>
  );
}
