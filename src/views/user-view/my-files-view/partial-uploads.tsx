import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  CloudUpload,
  Pause,
  Play,
  X,
  AlertCircle,
  CheckCircle2,
  Tag,
} from "lucide-react";
import { useUpload } from "@/components/providers/upload-provider";
import { Badge } from "@/components/ui/badge";

export function PartialUploads() {
  const { files, uppy } = useUpload();

  if (files.length === 0) {
    return null; // Don't show the section if no uploads
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CloudUpload className="w-5 h-5 text-chartreuse-500" />
          <h2 className="text-xl font-semibold tracking-tight">
            Ongoing Uploads
          </h2>
        </div>
       
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((upload) => (
          <Card
            key={upload.id}
            className="p-4 bg-white/5 border-white/5 hover:border-chartreuse-500/30 transition-all duration-300 text-white"
          >
            <div className="flex items-start justify-between mb-3 border-b border-white/5 pb-3">
              <div className="flex items-center gap-3 overflow-hidden">
                <div
                  className={`p-2 rounded-lg ${
                    upload.status === "error"
                      ? "bg-destructive/10 text-destructive"
                      : upload.status === "complete"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-chartreuse-500/10 text-chartreuse-500"
                  }`}
                >
                  {upload.status === "error" ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : upload.status === "complete" ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <CloudUpload
                      className={`w-4 h-4 ${upload.status === "uploading" ? "animate-bounce" : ""}`}
                    />
                  )}
                </div>
                <div className="overflow-hidden">
                  <h3
                    className="text-sm font-medium truncate"
                    title={upload.name}
                  >
                    {upload.name}
                  </h3>
                  <p className="text-[10px] text-white/60 uppercase tracking-wider">
                    {upload.size}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {upload.status === "paused" ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => uppy.upload()}
                    className="h-7 w-7 text-chartreuse-500 hover:bg-chartreuse-500/10"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </Button>
                ) : upload.status === "uploading" ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => uppy.pauseAll()}
                    className="h-7 w-7 text-zinc-400 hover:bg-white/10"
                  >
                    <Pause className="w-3.5 h-3.5 fill-current" />
                  </Button>
                ) : null}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => uppy.removeFile(upload.id)}
                  className="h-7 w-7 text-destructive hover:bg-destructive/10"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {/* Tags Display */}
              {upload.tags && upload.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {upload.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-white/5 text-[9px] h-4 px-1.5 font-medium border-none text-white/70"
                    >
                      <Tag className="w-2 h-2 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold">
                  <span
                    className={
                      upload.status === "error"
                        ? "text-destructive"
                        : upload.status === "complete"
                          ? "text-emerald-500 uppercase"
                          : "text-chartreuse-500 uppercase"
                    }
                  >
                    {upload.status}
                  </span>
                  <span className="text-white/70">
                    {upload.progress}%
                  </span>
                </div>
                <Progress value={upload.progress} className="h-1 bg-white/5" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
