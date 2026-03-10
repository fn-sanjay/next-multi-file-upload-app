"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Clock,
  MoreVertical,
  Tag,
} from "lucide-react";
import { FileContextMenu } from "@/components/common/file-context-menu";
import { FileDetailsSheet } from "@/components/common/file-details-sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchWithRefresh } from "@/lib/client/auth-api";
import { getFileIconMeta } from "@/lib/file-icons";
import { openContextMenuFromButton } from "@/lib/open-context-menu";
import { UPLOADS_REFRESH_EVENT } from "@/lib/upload-events";

type ApiFile = {
  id: string;
  filename: string;
  createdAt: string;
  isFavorite?: boolean;
  blob?: {
    size?: number;
    mimeType?: string;
  } | null;
  tags?: Array<{
    tag?: {
      id?: string;
      name?: string;
      color?: string;
    } | null;
  }>;
};

type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type FilesResponse = {
  files?: ApiFile[];
  pagination?: PaginationMeta;
  error?: string;
};

const PAGE_SIZE = 10;

export function RecentFilesTable() {
  const [files, setFiles] = useState<ApiFile[]>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const loadFiles = useCallback(async (nextPage: number) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetchWithRefresh(
        `/api/user/files?page=${nextPage}&limit=${PAGE_SIZE}&sort=recent`,
      );
      const data = (await res.json()) as FilesResponse;

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch files");
      }

      setFiles(data.files || []);
      setPagination(data.pagination || null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch files";
      setError(message);
      setFiles([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFiles(page);
  }, [loadFiles, page]);

  useEffect(() => {
    const handleRefresh = () => {
      setPage(1);
      void loadFiles(1);
    };

    window.addEventListener(UPLOADS_REFRESH_EVENT, handleRefresh);
    return () => {
      window.removeEventListener(UPLOADS_REFRESH_EVENT, handleRefresh);
    };
  }, [loadFiles]);

  async function handleRowClick(fileId: string) {
    setSelectedFileId(fileId);
    setIsSheetOpen(true);

    try {
      await fetch("/api/user/recent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileId }),
      });
    } catch (err) {
      console.error("Failed to record recent access:", err);
    }
  }

  function handlePageChange(nextPage: number) {
    if (!pagination) return;
    if (nextPage < 1 || nextPage > pagination.totalPages || nextPage === page) {
      return;
    }

    setPage(nextPage);
  }

  const totalPages = pagination?.totalPages ?? 0;
  const visiblePages = getVisiblePages(page, totalPages);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5 text-chartreuse-500" />
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Recent Files</h2>
          <p className="text-sm text-muted-foreground">
            Your latest uploads appear first.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-white/5 bg-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="hover:bg-transparent border-white/5">
                <TableHead className="w-[35%]">Name</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="border-white/5">
                  <TableCell
                    colSpan={6}
                    className="py-12 text-center text-muted-foreground"
                  >
                    Loading files...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow className="border-white/5">
                  <TableCell colSpan={6} className="py-12 text-center">
                    <div className="space-y-3">
                      <p className="text-destructive">{error}</p>
                      <Button
                        variant="outline"
                        onClick={() => void loadFiles(page)}
                      >
                        Retry
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : files.length === 0 ? (
                <TableRow className="border-white/5">
                  <TableCell
                    colSpan={6}
                    className="py-12 text-center text-muted-foreground"
                  >
                    No files found.
                  </TableCell>
                </TableRow>
              ) : (
                files.map((file) => {
                  const iconMeta = getFileIconMeta(
                    file.filename,
                    file.blob?.mimeType,
                  );
                  const tags = (file.tags || [])
                    .map((entry) => ({
                      id: entry.tag?.id,
                      name: entry.tag?.name,
                      color: entry.tag?.color,
                    }))
                    .filter((tag) => Boolean(tag.name));

                  return (
                    <FileContextMenu
                      key={file.id}
                      type="file"
                      id={file.id}
                      name={file.filename}
                      fileType={iconMeta.label}
                      refresh={() => void loadFiles(page)}
                      onViewDetails={() => void handleRowClick(file.id)}
                    >
                      <TableRow
                        className="group border-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                        onClick={() => void handleRowClick(file.id)}
                      >
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg bg-background border border-white/5 ${iconMeta.iconColor}`}
                            >
                              <iconMeta.icon className="w-4 h-4" />
                            </div>
                            <span className="font-medium group-hover:text-chartreuse-500 transition-colors">
                              {file.filename}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {tags.length > 0 ? (
                              tags.map((tag) => (
                                <Badge
                                  key={tag.id ?? `${file.id}-${tag.name}`}
                                  variant="outline"
                                  className="text-[10px] font-bold border"
                                  style={{
                                    color: tag.color ?? undefined,
                                    borderColor: tag.color ?? undefined,
                                    backgroundColor: tag.color
                                      ? `${tag.color}1A`
                                      : undefined,
                                  }}
                                >
                                  <Tag className="w-2.5 h-2.5 mr-1" />
                                  {tag.name}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                No tags
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {iconMeta.label}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatSize(file.blob?.size)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(file.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-chartreuse-500/10 hover:text-chartreuse-500"
                            onClick={openContextMenuFromButton}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    </FileContextMenu>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {pagination && pagination.totalPages > 1 ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1}-
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} files
          </p>

          <Pagination className="mx-0 w-auto justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#recent-files"
                  onClick={(event) => {
                    event.preventDefault();
                    handlePageChange(page - 1);
                  }}
                  className={
                    page === 1 ? "pointer-events-none opacity-50" : undefined
                  }
                />
              </PaginationItem>

              {visiblePages.map((pageNumber) => (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    href="#recent-files"
                    isActive={pageNumber === page}
                    onClick={(event) => {
                      event.preventDefault();
                      handlePageChange(pageNumber);
                    }}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href="#recent-files"
                  onClick={(event) => {
                    event.preventDefault();
                    handlePageChange(page + 1);
                  }}
                  className={
                    page === pagination.totalPages
                      ? "pointer-events-none opacity-50"
                      : undefined
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      ) : null}

      <FileDetailsSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        fileId={selectedFileId}
      />
    </div>
  );
}

function getVisiblePages(currentPage: number, totalPages: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + 4);
  const adjustedStart = Math.max(1, end - 4);

  return Array.from(
    { length: end - adjustedStart + 1 },
    (_, index) => adjustedStart + index,
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatSize(size?: number) {
  const bytes = Number(size ?? 0);

  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "-";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  const power = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / Math.pow(1024, power);
  const decimals = value >= 100 || power === 0 ? 0 : 1;

  return `${value.toFixed(decimals)} ${units[power]}`;
}
