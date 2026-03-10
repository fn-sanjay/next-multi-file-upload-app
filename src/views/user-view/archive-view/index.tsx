"use client";

import * as React from "react";
import {
  AlertCircle,
  ArrowUpDown,
  Folder,
  MoreVertical,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { FileContextMenu } from "@/components/common/file-context-menu";
import { FileDetailsSheet } from "@/components/common/file-details-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ScrollArea } from "@/components/ui/scroll-area";
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

type TrashFolderItem = {
  id: string;
  kind: "folder";
  name: string;
  deletedAt?: string | null;
  items: number;
};

type TrashFileItem = {
  id: string;
  kind: "file";
  name: string;
  deletedAt?: string | null;
  size: string;
  mimeType?: string;
};

type TrashItem = TrashFolderItem | TrashFileItem;

type FoldersResponse = {
  error?: string;
  folders?: Array<{
    id: string;
    name: string;
    deletedAt?: string | null;
    _count?: {
      files?: number;
      children?: number;
    };
  }>;
};

type FilesResponse = {
  error?: string;
  files?: Array<{
    id: string;
    filename: string;
    deletedAt?: string | null;
    blob?: {
      size?: number;
      mimeType?: string;
    };
  }>;
};

const ITEMS_PER_PAGE = 10;

export default function ArchiveView() {
  const [items, setItems] = React.useState<TrashItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [tableLoading, setTableLoading] = React.useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const deferredSearch = React.useDeferredValue(search);
  const [page, setPage] = React.useState(1);
  const [selectedFileId, setSelectedFileId] = React.useState<string | null>(null);
  const [busyItemId, setBusyItemId] = React.useState<string | null>(null);
  const [emptyingTrash, setEmptyingTrash] = React.useState(false);

  const fetchTrashItems = React.useCallback(async (searchTerm: string) => {
    const params = new URLSearchParams({
      isArchived: "true",
      sort: "recent",
    });

    const normalizedSearch = searchTerm.trim();
    if (normalizedSearch) {
      params.set("search", normalizedSearch);
    }

    const [foldersRes, filesRes] = await Promise.all([
      fetchWithRefresh(`/api/user/folders?${params.toString()}`),
      fetchWithRefresh(`/api/user/files?${params.toString()}`),
    ]);

    const foldersData = await parseJsonResponse<FoldersResponse>(foldersRes);
    const filesData = await parseJsonResponse<FilesResponse>(filesRes);

    if (!foldersRes.ok || !filesRes.ok) {
      throw new Error(
        foldersData.error || filesData.error || "Failed to load trash",
      );
    }

    const folderItems: TrashFolderItem[] = (foldersData.folders || []).map(
      (folder) => ({
        id: folder.id,
        kind: "folder",
        name: folder.name,
        deletedAt: folder.deletedAt,
        items: (folder._count?.files ?? 0) + (folder._count?.children ?? 0),
      }),
    );

    const fileItems: TrashFileItem[] = (filesData.files || []).map((file) => ({
      id: file.id,
      kind: "file",
      name: file.filename,
      deletedAt: file.deletedAt,
      size: formatSize(file.blob?.size),
      mimeType: file.blob?.mimeType,
    }));

    return [...folderItems, ...fileItems].sort(
      (a, b) => parseSortTime(b.deletedAt) - parseSortTime(a.deletedAt),
    );
  }, []);

  const loadTrash = React.useCallback(async () => {
    try {
      if (hasLoadedOnce) {
        setTableLoading(true);
      } else {
        setLoading(true);
      }

      const trashItems = await fetchTrashItems(deferredSearch);
      setItems(trashItems);
      setPage(1);
      setHasLoadedOnce(true);
    } catch (error) {
      console.error("Trash fetch error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to load trash",
      );
    } finally {
      setLoading(false);
      setTableLoading(false);
    }
  }, [deferredSearch, fetchTrashItems, hasLoadedOnce]);

  React.useEffect(() => {
    void loadTrash();
  }, [loadTrash]);

  React.useEffect(() => {
    setPage(1);
  }, [search]);

  const restoreItem = async (item: TrashItem) => {
    try {
      setBusyItemId(item.id);

      const res =
        item.kind === "file"
          ? await fetch(`/api/user/files/${item.id}/trash`, { method: "DELETE" })
          : await fetch(`/api/user/folders/${item.id}/restore`, { method: "POST" });

      const data = await parseJsonResponse<{ error?: string }>(res);

      if (!res.ok) {
        throw new Error(data.error || "Failed to restore item");
      }

      setItems((current) => current.filter((entry) => entry.id !== item.id));
      toast.success(`${item.kind === "file" ? "File" : "Folder"} restored`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to restore item",
      );
    } finally {
      setBusyItemId(null);
    }
  };

  const deletePermanently = async (item: TrashItem) => {
    try {
      setBusyItemId(item.id);

      const res = await fetch(
        item.kind === "file"
          ? `/api/user/files/${item.id}`
          : `/api/user/folders/${item.id}`,
        { method: "DELETE" },
      );

      const data = await parseJsonResponse<{ error?: string }>(res);

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete item");
      }

      setItems((current) => current.filter((entry) => entry.id !== item.id));
      toast.success("Item permanently deleted");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete item",
      );
    } finally {
      setBusyItemId(null);
    }
  };

  const emptyTrash = async () => {
    if (emptyingTrash) return;

    try {
      setEmptyingTrash(true);

      const allItems = await fetchTrashItems("");

      if (allItems.length === 0) {
        toast.message("Trash is already empty");
        return;
      }

      const results = await Promise.all(
        allItems.map((item) =>
          fetch(
            item.kind === "file"
              ? `/api/user/files/${item.id}`
              : `/api/user/folders/${item.id}`,
            { method: "DELETE" },
          ),
        ),
      );

      const failed = results.filter((response) => !response.ok).length;

      if (failed > 0) {
        toast.error(`Failed to delete ${failed} item${failed === 1 ? "" : "s"}`);
      } else {
        toast.success("Trash emptied");
      }

      await loadTrash();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to empty trash",
      );
    } finally {
      setEmptyingTrash(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pagedItems = items.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );
  const visiblePages = getVisiblePages(currentPage, totalPages);

  React.useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  if (loading && !hasLoadedOnce) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500">
        Loading trash...
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden font-sans">
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-8 max-w-400 mx-auto pb-20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
                <Trash2 className="w-8 h-8 text-primary" />
                Trash
              </h1>
              <p className="text-muted-foreground font-medium">
                Restore deleted files and folders, or remove them permanently.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative max-w-md w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  placeholder="Search trash..."
                  className="h-11 pl-11 pr-4 bg-white/5 border-white/10 rounded-xl focus:ring-primary transition-all font-medium"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
              <Button
                variant="outline"
                className="border-rose-500/20 bg-rose-500/5 text-rose-500 hover:bg-rose-500/10 h-11 px-6 rounded-xl font-black"
                onClick={() => void emptyTrash()}
                disabled={emptyingTrash}
              >
                <Trash2 className="w-5 h-5 mr-2" />
                {emptyingTrash ? "Emptying..." : "Empty Trash"}
              </Button>
            </div>
          </div>

          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-4">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-amber-500">
                Auto-delete Policy
              </p>
              <p className="text-sm text-zinc-400 font-medium">
                Items in the trash are permanently deleted after 30 days.
              </p>
            </div>
          </div>

          <div
            id="trash-table"
            className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden shadow-2xl"
          >
            {tableLoading ? (
              <div className="border-b border-white/10 px-6 py-3 text-xs font-bold uppercase tracking-widest text-zinc-500">
                Updating results...
              </div>
            ) : null}

            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="hover:bg-transparent border-white/10 h-14">
                  <TableHead className="pl-6 w-[45%] font-black uppercase tracking-widest text-[10px] text-zinc-500">
                    <div className="flex items-center gap-2">
                      Name <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] text-zinc-500">
                    Trashed Date
                  </TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] text-zinc-500">
                    Size
                  </TableHead>
                  <TableHead className="text-right pr-6 font-black uppercase tracking-widest text-[10px] text-zinc-500">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!tableLoading && pagedItems.length === 0 ? (
                  <TableRow className="border-white/5">
                    <TableCell
                      colSpan={4}
                      className="py-16 text-center text-muted-foreground"
                    >
                      {deferredSearch.trim()
                        ? "No matching items found in trash."
                        : "Trash is empty."}
                    </TableCell>
                  </TableRow>
                ) : (
                  pagedItems.map((item) => {
                    const iconMeta =
                      item.kind === "folder"
                        ? {
                            icon: Folder,
                            iconColor: "text-zinc-500",
                            label: "Folder",
                          }
                        : getFileIconMeta(item.name, item.mimeType);

                    const rowBusy = busyItemId === item.id;

                    return (
                      <FileContextMenu
                        key={item.id}
                        id={item.id}
                        name={item.name}
                        type={item.kind}
                        fileType={iconMeta.label}
                        inTrash
                        refresh={loadTrash}
                        onViewDetails={
                          item.kind === "file"
                            ? () => setSelectedFileId(item.id)
                            : undefined
                        }
                        onRestore={() => restoreItem(item)}
                        onDeletePermanently={() => deletePermanently(item)}
                      >
                        <TableRow
                          className="group border-white/5 hover:bg-white/10 transition-all duration-300 cursor-pointer h-20"
                          onClick={() => {
                            if (item.kind === "file") {
                              setSelectedFileId(item.id);
                            }
                          }}
                        >
                          <TableCell className="pl-6">
                            <div className="flex items-center gap-4">
                              <div
                                className={`p-3 rounded-2xl bg-white/5 border border-white/5 group-hover:border-primary/30 group-hover:bg-primary/10 transition-all duration-300 ${iconMeta.iconColor} group-hover:text-primary`}
                              >
                                <iconMeta.icon
                                  className={`w-5 h-5 ${item.kind === "folder" ? "fill-current" : ""}`}
                                />
                              </div>
                              <div className="space-y-0.5">
                                <span className="font-bold text-sm text-white group-hover:text-primary transition-colors line-clamp-1">
                                  {item.name}
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block">
                                  {item.kind === "folder" ? "Folder" : iconMeta.label}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-medium text-zinc-400">
                              {formatDateTime(item.deletedAt)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-medium text-zinc-400">
                              {item.kind === "folder" ? `${item.items} items` : item.size}
                            </span>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                                title="Restore"
                                disabled={rowBusy}
                                onClick={(event) => {
                                  event.preventDefault();
                                  event.stopPropagation();
                                  void restoreItem(item);
                                }}
                              >
                                <RotateCcw className="w-5 h-5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 rounded-xl hover:bg-rose-500/10 hover:text-rose-500 transition-all"
                                title="Delete Permanently"
                                disabled={rowBusy}
                                onClick={(event) => {
                                  event.preventDefault();
                                  event.stopPropagation();
                                  void deletePermanently(item);
                                }}
                              >
                                <Trash2 className="w-5 h-5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 rounded-xl hover:bg-white/10 transition-all"
                                onClick={openContextMenuFromButton}
                              >
                                <MoreVertical className="w-5 h-5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      </FileContextMenu>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {items.length > 0 ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
                {Math.min(currentPage * ITEMS_PER_PAGE, items.length)} of{" "}
                {items.length} item{items.length === 1 ? "" : "s"}
              </p>

              {totalPages > 1 ? (
                <Pagination className="mx-0 w-auto justify-end">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#trash-table"
                        onClick={(event) => {
                          event.preventDefault();
                          setPage((current) => Math.max(1, current - 1));
                        }}
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : undefined
                        }
                      />
                    </PaginationItem>

                    {visiblePages.map((pageNumber) => (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          href="#trash-table"
                          isActive={pageNumber === currentPage}
                          onClick={(event) => {
                            event.preventDefault();
                            setPage(pageNumber);
                          }}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        href="#trash-table"
                        onClick={(event) => {
                          event.preventDefault();
                          setPage((current) => Math.min(totalPages, current + 1));
                        }}
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : undefined
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              ) : null}
            </div>
          ) : null}
        </div>
      </ScrollArea>

      <FileDetailsSheet
        open={Boolean(selectedFileId)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedFileId(null);
          }
        }}
        fileId={selectedFileId}
      />
    </div>
  );
}

function formatDateTime(value?: string | null) {
  if (!value) return "Unknown";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";

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
  if (!Number.isFinite(bytes) || bytes <= 0) return "-";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const power = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / Math.pow(1024, power);
  const decimals = value >= 100 || power === 0 ? 0 : 1;

  return `${value.toFixed(decimals)} ${units[power]}`;
}

function parseSortTime(value?: string | null) {
  if (!value) return 0;

  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
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

async function parseJsonResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) return {} as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    return {} as T;
  }
}
