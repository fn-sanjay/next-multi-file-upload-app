"use client";

import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileDetailsSheet } from "@/components/common/file-details-sheet";

import { FolderDetailHeader } from "./folder-detail-header";
import { FolderDetailToolbar } from "./folder-detail-toolbar";
import { SubfoldersSection } from "./subfolders-section";
import { FilesSection } from "./files-section";
import { TagLinkModal } from "@/components/common/tag-link-modal";

type ApiTag = {
  id?: string;
  name?: string;
  color?: string;
};

type ApiTagLink = {
  tagId?: string;
  tag?: ApiTag;
};

type ApiFile = {
  id: string;
  filename: string;
  createdAt?: string | null;
  mimeType?: string | null;
  previewUrl?: string | null;
  tags?: ApiTagLink[];
  blob?: {
    size?: number | string | null;
  } | null;
};

type ApiFolder = {
  id: string;
  name: string;
  tags?: ApiTagLink[];
  files?: ApiFile[];
  children?: ApiFolder[];
  createdAt?: string | null;
  updatedAt?: string | null;
};

type NormalizedFile = {
  id: string;
  name: string;
  size: string;
  created: string;
  mimeType?: string | null;
  previewUrl?: string | null;
  tags: Array<{
    id?: string;
    name?: string;
    color?: string;
  }>;
};

export default function FolderDetailView({ slug }: { slug: string }) {

  const [folder, setFolder] = useState<ApiFolder | null>(null);
  const [subfolders, setSubfolders] = useState<ApiFolder[]>([]);
  const [files, setFiles] = useState<NormalizedFile[]>([]);
  const [folderSizeBytes, setFolderSizeBytes] = useState(0);
  const [loading, setLoading] = useState(true);

  const [selectedFile, setSelectedFile] = useState<NormalizedFile | null>(null);

  const [tagModalOpen, setTagModalOpen] = useState(false);

  /* -------------------------------- */
  /* FETCH FOLDER CONTENT */
  /* -------------------------------- */

  const fetchFolderContent = async () => {
    try {
      setLoading(true);

      const folderId = slug;

      const folderRes = await fetch(`/api/user/folders/${folderId}`);
      const folderData = await folderRes.json();

      setFolder(folderData.folder);

      const [foldersRes, filesRes] = await Promise.all([
        fetch(`/api/user/folders?parentId=${folderId}`),
        fetch(`/api/user/files?folderId=${folderId}`),
      ]);

      const foldersData = await foldersRes.json();
      const filesData = await filesRes.json();

      setSubfolders(foldersData.folders || []);

      const filesList = filesData.files || [];

      const totalSize = filesList.reduce(
        (sum: number, file: ApiFile) => sum + Number(file?.blob?.size ?? 0),
        0,
      );

      setFolderSizeBytes(totalSize);

      const normalizedFiles = filesList.map((file: ApiFile) => ({
        id: file.id,
        name: file.filename,
        size: formatSize(file?.blob?.size),
        created: formatDateTime(file.createdAt),
        mimeType: file.mimeType,
        previewUrl: file.previewUrl,
        tags: ((file.tags || []) as ApiTagLink[])
          .map((entry) => ({
            id: entry?.tag?.id ?? entry?.tagId,
            name: entry?.tag?.name,
            color: entry?.tag?.color ?? "#9ca3af",
          }))
          .filter((tag) => Boolean(tag.name)),
      }));

      setFiles(normalizedFiles);

    } catch (err) {
      console.error("Folder load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFolderContent();
  }, [slug]);

  /* -------------------------------- */
  /* REMOVE FOLDER TAG */
  /* -------------------------------- */

  const handleRemoveTag = async (tagId: string) => {
    if (!folder) {
      console.warn("Tag remove skipped: folder not loaded yet.");
      return;
    }

    try {

      await fetch("/api/user/tags/folders", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          folderId: folder.id,
          tagId,
        }),
      });

      fetchFolderContent(); // refresh UI

    } catch (err) {
      console.error("Tag remove failed", err);
    }

  };

  /* -------------------------------- */
  /* FILE CLICK */
  /* -------------------------------- */

  const handleFileClick = (file: NormalizedFile) => {
    setSelectedFile(file);
  };

  /* -------------------------------- */
  /* LOADING */
  /* -------------------------------- */

  if (loading || !folder) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500">
        Loading folder...
      </div>
    );
  }

  /* normalize folder tags */

  const tags =
    folder?.tags
      ?.map((t: ApiTagLink) => ({
        id: t.tag?.id,
        name: t.tag?.name,
        color: t.tag?.color,
      }))
      .filter(
        (t): t is { id: string; name: string; color: string } =>
          !!t.id && !!t.name && !!t.color
      ) || [];

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden font-sans">

      <ScrollArea className="flex-1">

        <div className="p-6 space-y-10 max-w-350 mx-auto pb-20">

          <FolderDetailHeader
            folder={folder}
            folderSizeBytes={folderSizeBytes}
          />

          <FolderDetailToolbar
            tags={tags}
            folderId={folder.id}
            onAddTag={() => setTagModalOpen(true)}
            onRemoveTag={handleRemoveTag}
          />

          <SubfoldersSection
            parentId={slug}
            subfolders={subfolders}
            refresh={fetchFolderContent}
          />

          <FilesSection
            files={files}
            onSelectFile={handleFileClick}
          />

        </div>

      </ScrollArea>

      <FileDetailsSheet
        open={!!selectedFile}
        onOpenChange={() => setSelectedFile(null)}
        fileId={selectedFile?.id ?? null}
      />

      <TagLinkModal
        open={tagModalOpen}
        onOpenChange={(open) => {
          setTagModalOpen(open);

          if (!open) {
            fetchFolderContent(); // refresh tags after closing modal
          }
        }}
        fileId={folder.id} // using folder id here
        mode="folder"
        existingTags={folder.tags || []}
      />

    </div>
  );
}

/* -------------------------------- */
/* SIZE FORMAT */
/* -------------------------------- */

function formatSize(size?: number | string | null) {

  const bytes = Number(size ?? 0);

  if (!Number.isFinite(bytes) || bytes <= 0) return "-";

  const units = ["B", "KB", "MB", "GB", "TB"];

  const power = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );

  const value = bytes / Math.pow(1024, power);

  const decimals = value >= 100 || power === 0 ? 0 : 1;

  return `${value.toFixed(decimals)} ${units[power]}`;
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
