"use client";

import React from "react";
import { Search, Command as CommandIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SearchModal } from "./search-modal";
import { useSearchShortcut } from "@/hooks/use-search-shortcut";

export const HeaderSearch = () => {
  const { isOpen, setIsOpen } = useSearchShortcut();

  return (
    <>
      <div
        className="flex-1 max-w-md hidden sm:block cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        <div className="relative group pointer-events-none">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500 group-hover:text-primary transition-colors" />
          <Input
            placeholder="Search files, folders..."
            className="w-full bg-zinc-900 border-zinc-800 pl-10 h-10 rounded-lg text-sm transition-all group-hover:border-primary/50 group-hover:ring-1 group-hover:ring-primary/10"
            readOnly
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded border border-zinc-800 bg-card/50 text-[10px] text-zinc-600 font-mono">
            <CommandIcon className="size-2.5" />
            <span>K</span>
          </div>
        </div>
      </div>

      <SearchModal isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  );
};
