"use client";

import { useState } from "react";
import { Loader2, Download, ShieldCheck } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface DownloadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileId: string;
  filename: string;
}

export function DownloadModal({
  open,
  onOpenChange,
  fileId,
  filename,
}: DownloadModalProps) {

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const generateLink = async () => {

    try {
      setLoading(true);
      setProgress(10);

      // fake progress animation
      const timer = setInterval(() => {
        setProgress((p) => {
          if (p >= 90) return p;
          return p + 10;
        });
      }, 200);

      const res = await fetch(`/api/user/files/${fileId}/download`);
      const data = await res.json();

      clearInterval(timer);

      setDownloadUrl(data.url);
      setProgress(100);

    } catch (err) {
      console.error(err);
      alert("Failed to generate download link");
    } finally {
      setLoading(false);
    }
  };

  const startDownload = () => {
    if (!downloadUrl) return;

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0a0a0a] border border-primary/40 text-white">

        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase tracking-wide">
            Secure Download
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">

          {/* INITIAL STATE */}
          {!loading && !downloadUrl && (
            <div className="flex flex-col items-center gap-4 py-6">

              <ShieldCheck className="w-10 h-10 text-primary" />

              <p className="text-sm text-zinc-400 text-center">
                Your file will be delivered via a secure temporary link.
              </p>

              <Button
                onClick={generateLink}
                className="bg-primary text-black font-bold hover:bg-primary/80"
              >
                Generate Secure Link
              </Button>

            </div>
          )}

          {/* LOADING STATE */}
          {loading && (
            <div className="flex flex-col items-center gap-6 py-10">

              <Loader2 className="w-10 h-10 animate-spin text-primary" />

              <p className="text-sm text-zinc-400">
                Generating secure link...
              </p>

              {/* Progress bar */}
              <div className="w-full space-y-2">

                <Progress value={progress} className="bg-zinc-800" />

               

              </div>

            </div>
          )}

          {/* READY */}
          {!loading && downloadUrl && (
            <div className="flex flex-col items-center gap-4 py-6">

              <ShieldCheck className="w-10 h-10 text-primary" />

              <p className="text-sm text-zinc-400 text-center">
                Your secure download link is ready.
              </p>

              <Button
                onClick={startDownload}
                className="bg-primary text-black font-bold hover:bg-primary/80"
              >
                <Download className="w-4 h-4 mr-2" />
                Download File
              </Button>

            </div>
          )}

        </div>

      </DialogContent>
    </Dialog>
  );
}