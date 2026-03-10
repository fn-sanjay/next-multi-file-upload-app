"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, FileText, Folder, Tag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchWithRefresh } from "@/lib/client/auth-api";
import { useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SearchModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

type SearchFile = { id: string; filename: string; folderId: string | null };
type SearchFolder = { id: string; name: string };
type SearchTag = { id: string; name: string };
type SearchSection = "files" | "folders" | "tags";
type SearchItem = SearchFile | SearchFolder | SearchTag;

export const SearchModal = ({ isOpen, setIsOpen }: SearchModalProps) => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{
    files: SearchFile[];
    folders: SearchFolder[];
    tags: SearchTag[];
  }>({ files: [], folders: [], tags: [] });
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (!query.trim()) {
        setResults({ files: [], folders: [], tags: [] });
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const res = await fetchWithRefresh(
          `/api/user/search?q=${encodeURIComponent(query.trim())}`,
        );
        if (!res.ok) {
          setIsLoading(false);
          return;
        }
        const data = (await res.json()) as {
          files?: Array<{
            id?: string;
            filename?: string;
            folderId?: string | null;
          }>;
          folders?: SearchFolder[];
          tags?: SearchTag[];
        };
        setResults({
          files:
            (data.files || []).map((f) => ({
              id: f.id,
              filename: f.filename,
              folderId: f.folderId ?? null,
            })) || [],
          folders: data.folders || [],
          tags: data.tags || [],
        });
      } catch (error) {
        console.error("search failed", error);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [query]);

  const handleSelect = (section: SearchSection, item: SearchItem) => {
    setIsOpen(false);

    if (section === "files") {
      const file = item as SearchFile;
      const folderPath = file.folderId ? `/folders/${file.folderId}` : "/my-files";
      router.push(`${folderPath}?fileId=${file.id}`);
      return;
    }

    if (section === "folders") {
      const folder = item as SearchFolder;
      router.push(`/folders/${folder.id}`);
      return;
    }

    if (section === "tags") {
      const tag = item as SearchTag;
      router.push(`/tags?tagId=${tag.id}`);
    }
  };

  const flatResults = useMemo(() => {
    const list: Array<{ section: SearchSection; label: string; item: SearchItem }> = [];
    (results.files || []).forEach((file) =>
      list.push({ section: "files", label: file.filename, item: file }),
    );
    (results.folders || []).forEach((folder) =>
      list.push({ section: "folders", label: folder.name, item: folder }),
    );
    (results.tags || []).forEach((tag) =>
      list.push({ section: "tags", label: tag.name, item: tag }),
    );
    return list;
  }, [results]);

  useEffect(() => {
    setActiveIndex(0);
  }, [flatResults.length]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (flatResults.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % flatResults.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) =>
          prev === 0 ? flatResults.length - 1 : prev - 1,
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        const target = flatResults[activeIndex];
        if (target) handleSelect(target.section, target.item);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [flatResults, activeIndex, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        showCloseButton={false}
        className="max-w-2xl bg-card border-zinc-800 p-0 overflow-hidden gap-0"
      >
        <DialogTitle className="sr-only">Search Files and Folders</DialogTitle>
        <DialogHeader className="p-4 border-b border-zinc-800 flex flex-row items-center gap-3">
          <Search className="size-5 text-primary shrink-0" />
          <Input
            placeholder="Search keywords, files, or folders..."
            className="flex-1 bg-transparent border-none text-lg focus-visible:ring-0 p-0 h-auto text-white placeholder:text-zinc-600"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {isLoading && (
            <div className="h-4 w-4 rounded-full border-2 border-primary/60 border-t-transparent animate-spin" />
          )}
          <kbd className="hidden sm:flex h-6 items-center gap-1 px-1.5 rounded border border-zinc-800 bg-zinc-900 text-[10px] text-zinc-500 font-mono pointer-events-none shrink-0">
            ESC
          </kbd>
        </DialogHeader>

        <ScrollArea className="p-2 max-h-[60vh]">
          {query.trim().length === 0 && (
            <div className="px-3 py-6 text-center text-sm text-zinc-500">
              Start typing to search files, folders, or tags.
            </div>
          )}

          {query.trim().length > 0 && (
            <div className="space-y-4">
              {(["files", "folders", "tags"] as SearchSection[]).map((section) => {
                const sectionItems: Record<SearchSection, SearchItem[]> = {
                  files: results.files,
                  folders: results.folders,
                  tags: results.tags,
                };
                const list = sectionItems[section];
                if (!list || list.length === 0) return null;
                return (
                  <div key={section} className="px-3 py-2">
                    <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-2">
                      {section}
                    </h3>
                    <div className="space-y-1">
                      {list.map((item) => (
                        <Button
                          key={item.id}
                          variant="ghost"
                          className={`w-full h-auto flex items-center justify-between p-3 rounded-lg transition-all group border-none ${
                            flatResults[activeIndex]?.item.id === item.id
                              ? "bg-primary/10 text-white"
                              : "hover:bg-primary/5 hover:text-white"
                          }`}
                          onClick={() => handleSelect(section, item)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-zinc-900 group-hover:bg-primary/10 transition-colors">
                              {section === "files" && (
                                <FileText className="size-4 text-primary group-hover:scale-110 transition-transform" />
                              )}
                              {section === "folders" && (
                                <Folder className="size-4 text-primary group-hover:scale-110 transition-transform" />
                              )}
                              {section === "tags" && (
                                <Tag className="size-4 text-primary group-hover:scale-110 transition-transform" />
                              )}
                            </div>
                            <div className="text-left">
                              <p className="text-sm font-bold text-zinc-200 group-hover:text-primary transition-colors">
                                {"filename" in item ? item.filename : item.name}
                              </p>
                              <p className="text-[10px] text-zinc-500 uppercase font-black tracking-wider group-hover:text-zinc-400 transition-colors">
                                {section === "files"
                                  ? "File"
                                  : section === "folders"
                                    ? "Folder"
                                    : "Tag"}
                              </p>
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                );
              })}

              {results.files.length === 0 &&
                results.folders.length === 0 &&
                results.tags.length === 0 &&
                !isLoading && (
                  <div className="px-3 py-6 text-center text-sm text-zinc-500">
                    No results found.
                  </div>
                )}
            </div>
          )}
          {isLoading && (
            <div className="px-3 py-6 text-center text-sm text-zinc-500">
              Searching...
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
