"use client";

import {
  Calendar,
  FileText,
  Folder,
  HardDrive,
} from "lucide-react";

interface FolderDetailHeaderProps {
  folder: {
    id: string;
    name: string;
    files?: Array<{ id?: string }>;
    children?: Array<{ id?: string }>;
    updatedAt?: string | null;
  };
  folderSizeBytes: number;
}

export function FolderDetailHeader({
  folder,
  folderSizeBytes,
}: FolderDetailHeaderProps) {
  const files = folder.files?.length || 0;
  const subfolders = folder.children?.length || 0;

  const folderSize = formatSize(folderSizeBytes);

  const modified = folder.updatedAt
    ? new Date(folder.updatedAt).toLocaleDateString()
    : "recently";

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

      {/* LEFT SIDE */}

      <div className="flex items-start gap-5">

        <div className="p-4 rounded-3xl bg-primary/10 border border-primary/20 shadow-[0_0_20px_rgba(191,255,0,0.2)]">
          <Folder className="w-10 h-10 text-primary fill-current" />
        </div>

        <div className="space-y-2">

          <h1 className="text-4xl font-black tracking-tight text-white">
            {folder.name}
          </h1>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground font-medium">

            <div className="flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              {files} files
            </div>

            <div className="flex items-center gap-1.5">
              <Folder className="w-4 h-4" />
              {subfolders} subfolders
            </div>

            <div className="flex items-center gap-1.5 text-primary">
              <HardDrive className="w-4 h-4" />
              <span className="font-semibold">{folderSize}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Modified {modified}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

/* -------------------------- */
/* HELPERS */
/* -------------------------- */

function formatSize(size?: number | null) {
  const bytes = Number(size ?? 0);

  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];

  const power = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );

  const value = bytes / Math.pow(1024, power);

  const decimals = value >= 100 || power === 0 ? 0 : 1;

  return `${value.toFixed(decimals)} ${units[power]}`;
}
