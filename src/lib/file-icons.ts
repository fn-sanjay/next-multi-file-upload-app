import type { LucideIcon } from "lucide-react";
import {
  File,
  FileArchive,
  FileAudio2,
  FileCode2,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideoCamera,
  Presentation,
} from "lucide-react";

export interface FileIconMeta {
  icon: LucideIcon;
  iconColor: string;
  label: string;
}

function getExtension(fileName: string) {
  const parts = fileName.toLowerCase().split(".");
  return parts.length > 1 ? parts.pop() || "" : "";
}

export function getFileIconMeta(fileName: string, fileType?: string): FileIconMeta {
  const ext = getExtension(fileName);
  const normalizedType = (fileType || "").toLowerCase();

  if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "tif", "tiff", "heic", "fig", "psd", "ai"].includes(ext) || normalizedType.includes("image")) {
    return { icon: FileImage, iconColor: "text-blue-500", label: "Image" };
  }

  if (["mp4", "mov", "avi", "mkv", "webm", "m4v", "wmv", "flv"].includes(ext) || normalizedType.includes("video")) {
    return { icon: FileVideoCamera, iconColor: "text-violet-500", label: "Video" };
  }

  if (["mp3", "wav", "aac", "flac", "ogg", "m4a"].includes(ext) || normalizedType.includes("audio") || normalizedType.includes("music")) {
    return { icon: FileAudio2, iconColor: "text-emerald-500", label: "Audio" };
  }

  if (["ppt", "pptx", "key"].includes(ext) || normalizedType.includes("presentation")) {
    return { icon: Presentation, iconColor: "text-orange-500", label: "Presentation" };
  }

  if (["xls", "xlsx", "csv", "tsv", "ods"].includes(ext) || normalizedType.includes("spreadsheet")) {
    return { icon: FileSpreadsheet, iconColor: "text-green-500", label: "Spreadsheet" };
  }

  if (["zip", "rar", "7z", "tar", "gz", "bz2"].includes(ext) || normalizedType.includes("archive")) {
    return { icon: FileArchive, iconColor: "text-amber-500", label: "Archive" };
  }

  if (["js", "ts", "tsx", "jsx", "json", "html", "css", "scss", "md", "yml", "yaml", "xml", "py", "java", "go", "rs", "c", "cpp", "sh"].includes(ext) || normalizedType.includes("code")) {
    return { icon: FileCode2, iconColor: "text-cyan-500", label: "Code" };
  }

  if (["pdf", "doc", "docx", "txt", "rtf", "odt"].includes(ext) || normalizedType.includes("document")) {
    return { icon: FileText, iconColor: "text-orange-500", label: "Document" };
  }

  return { icon: File, iconColor: "text-zinc-400", label: "File" };
}
