"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import Uppy from "@uppy/core";
import type { UploadResult as UppyUploadResult } from "@uppy/core";
import { fetchCsrfToken, fetchWithRefresh } from "@/lib/client/auth-api";
import { toast } from "sonner";
import { UPLOADS_REFRESH_EVENT } from "@/lib/upload-events";

interface UploadFile {
  id: string;
  name: string;
  size: string;
  progress: number;
  status: "uploading" | "paused" | "error" | "complete";
  tags?: string[];
}

type UppyResponseBody = Record<string, unknown>;

interface UploadContextType {
  uppy: Uppy<UppyMeta, UppyResponseBody>;
  files: UploadFile[];
  totalProgress: number;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  isContactAdminOpen: boolean;
  setIsContactAdminOpen: (open: boolean) => void;
}

interface UppyMeta extends Record<string, unknown> {
  tags: string;
  tagIds?: string;
  folderId?: string | null;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

interface ApiErrorResponse {
  error?: string;
  details?: string;
}

type UploadInitResponse = ApiErrorResponse & {
  deduplicated?: boolean;
  uploadId?: string;
  chunkSize?: number;
  file?: { id: string };
};

type UploadCompleteResponse = ApiErrorResponse & {
  file?: { id: string };
};

type UppyCompleteResult = UppyUploadResult<UppyMeta, UppyResponseBody>;

// Hashing helper
async function computeHash(file: File | Blob): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function readJsonSafely<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export function UploadProvider({ children }: { children: React.ReactNode }) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [totalProgress, setTotalProgress] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isContactAdminOpen, setIsContactAdminOpen] = useState(false);

  const [uppy] = useState(() => {
    return new Uppy<UppyMeta, UppyResponseBody>({
      id: "cloud-vault",
      autoProceed: false,
      restrictions: {
        maxFileSize: 1024 * 1024 * 1024 * 5, // 5GB
      },
      meta: { tags: "", tagIds: "" },
    });
  });

  useEffect(() => {
    const handleUpload = async (fileIDs: string[]) => {
      const csrfToken = await fetchCsrfToken();

      for (const id of fileIDs) {
        const file = uppy.getFile(id);
        if (!file) {
          console.warn(`File with ID ${id} not found in Uppy instance.`);
          continue;
        }
        try {
          // 1. Hash
          if (!(file.data instanceof Blob)) {
            throw new Error(`File data is not available for ${file.name}`);
          }
          uppy.emit("preprocess-progress", file, {
            mode: "indeterminate",
            message: "Computing hash...",
          });
          const hash = await computeHash(file.data);
          uppy.emit("preprocess-complete", file);

          // 2. Init
          const initRes = await fetchWithRefresh("/api/user/uploads/init", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-csrf-token": csrfToken,
            },
            body: JSON.stringify({
              filename: file.name,
              size: file.size,
              hash,
              folderId: file.meta.folderId ?? null,
              relativePath: file.meta.relativePath || null,
            }),
          });

          const initData = await readJsonSafely<UploadInitResponse>(initRes);
          if (!initRes.ok) {
            throw new Error(
              initData?.error || `Init failed (HTTP ${initRes.status})`,
            );
          }
          if (!initData) {
            throw new Error("Init returned an empty response");
          }

          const attachTags = async (fileId: string) => {
            const tagIdsString = (file.meta?.tagIds ||
              uppy.getState().meta?.tagIds) as string;
            const selectedTagIds =
              typeof tagIdsString === "string"
                ? tagIdsString.split(",").filter(Boolean)
                : [];
            for (const tagId of selectedTagIds) {
              try {
                await fetchWithRefresh("/api/user/tags/files", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "x-csrf-token": csrfToken,
                  },
                  body: JSON.stringify({ fileId, tagId }),
                });
              } catch (e) {
                console.error("Failed to attach tag", tagId, "to file", fileId);
              }
            }
          };

          if (initData.deduplicated) {
            toast.info(
              "File already exists in this folder – using existing version.",
            );
            if (initData?.file?.id) {
              await attachTags(initData.file.id);
            }
            uppy.emit("upload-success", file, {
              status: 200,
              body: initData as UppyResponseBody,
            });
            continue;
          }

          const { uploadId, chunkSize } = initData;
          if (!uploadId || !chunkSize) {
            throw new Error("Init response is missing upload parameters");
          }

          // 3. Chunked Upload
          const totalChunks = Math.ceil((file.size || 0) / chunkSize);
          for (let i = 0; i < totalChunks; i++) {
            const start = i * chunkSize;
            const end = Math.min(start + chunkSize, file.size || 0);
            const chunk = (file.data as Blob).slice(start, end);

            const formData = new FormData();
            formData.append("uploadId", uploadId);
            formData.append("partNumber", (i + 1).toString());
            formData.append("chunk", chunk);

            const chunkRes = await fetchWithRefresh("/api/user/uploads/chunk", {
              method: "POST",
              headers: {
                "x-csrf-token": csrfToken,
              },
              body: formData,
            });

            if (!chunkRes.ok) {
              const errData = await readJsonSafely<ApiErrorResponse>(chunkRes);
              console.error("[UploadProvider] Chunk response error:", errData);
              throw new Error(
                errData?.error ||
                  `Chunk upload failed (HTTP ${chunkRes.status})`,
              );
            }

            // For upload-progress, we need to satisfy Uppy's internal type expectations
            uppy.emit("upload-progress", file, {
              bytesUploaded: end,
              bytesTotal: file.size || 0,
            } as unknown as never);
          }

          // 4. Complete
          const completeRes = await fetchWithRefresh(
            "/api/user/uploads/complete",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-csrf-token": csrfToken,
              },
              body: JSON.stringify({ uploadId }),
            },
          );

          const completeData =
            await readJsonSafely<UploadCompleteResponse>(completeRes);
          if (!completeRes.ok) {
            throw new Error(
              completeData?.error ||
                `Finalization failed (HTTP ${completeRes.status})`,
            );
          }
          if (!completeData) {
            throw new Error("Finalization returned an empty response");
          }

          if (completeData.file?.id) {
            await attachTags(completeData.file.id);
          }

          uppy.emit("upload-success", file, {
            status: 200,
            body: completeData as UppyResponseBody,
          });
        } catch (err) {
          uppy.emit("upload-error", file, err as Error);
          if (err instanceof Error && err.message) {
            toast.error(`Upload failed: ${err.message}`);
          } else {
            toast.error("An error occurred during upload.");
          }
        }
      }
    };

    uppy.addUploader(handleUpload);

    return () => {};
  }, [uppy]);

  useEffect(() => {
    const handleProgress = () => {
      const uppyFiles = uppy.getFiles();
      const updatedFiles: UploadFile[] = uppyFiles.map((f) => ({
        id: f.id,
        name: f.name,
        size: `${((f.size || 0) / (1024 * 1024)).toFixed(1)} MB`,
        progress: f.progress?.percentage || 0,
        status: f.progress?.uploadComplete
          ? "complete"
          : f.progress?.uploadStarted
            ? "uploading"
            : "paused",
        tags: (f.meta.tags as string)?.split(",").filter(Boolean) || [],
      }));
      setFiles(updatedFiles);
      setTotalProgress(uppy.getState().totalProgress || 0);
    };

    const handleComplete = (result: UppyCompleteResult) => {
      const successCount = result.successful?.length ?? 0;
      if (successCount > 0) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event(UPLOADS_REFRESH_EVENT));
        }
        toast.success(
          `Successfully uploaded ${successCount} file(s)`,
        );
        // Slight delay to let user see 100% complete before closing
        setTimeout(() => {
          setIsModalOpen(false);
          // Optional: clear the uppy state so it's fresh for next time
          uppy.cancelAll();
        }, 1500);
      }
    };

    uppy.on("upload-progress", handleProgress);
    uppy.on("file-removed", handleProgress);
    uppy.on("upload-success", handleProgress);
    uppy.on("file-added", handleProgress);
    uppy.on("complete", handleComplete);

    return () => {
      uppy.off("upload-progress", handleProgress);
      uppy.off("file-removed", handleProgress);
      uppy.off("upload-success", handleProgress);
      uppy.off("file-added", handleProgress);
      uppy.off("complete", handleComplete);
    };
  }, [uppy]);

  return (
    <UploadContext.Provider
      value={{
        uppy,
        files,
        totalProgress,
        isModalOpen,
        setIsModalOpen,
        isContactAdminOpen,
        setIsContactAdminOpen,
      }}
    >
      {children}
    </UploadContext.Provider>
  );
}

export const useUpload = () => {
  const context = useContext(UploadContext);
  if (!context) {
    throw new Error("useUpload must be used within an UploadProvider");
  }
  return context;
};
