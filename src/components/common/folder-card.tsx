import { Folder, MoreVertical, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { openContextMenuFromButton } from "@/lib/open-context-menu";

interface FolderCardProps {
  name: string;
  itemCount: number;
  modifiedAt: string;
  tags?: string[];
  href?: string;
  className?: string;
  shared?: boolean;
  size?: string;
  modifiedInFooter?: boolean;
}

export function FolderCard({
  name,
  itemCount,
  modifiedAt,
  tags = [],
  href,
  className,
  shared,
  size,
  modifiedInFooter,
}: FolderCardProps) {
  const content = (
    <Card
      className={cn(
        "group h-full w-full min-h-56 p-6 transition-all duration-300 cursor-pointer border border-white/8 bg-white/5/60 hover:border-primary/40 hover:bg-white/10 relative overflow-hidden shadow-[0_15px_50px_rgba(0,0,0,0.25)]",
        className,
      )}
    >
      {/* Subtle Primary Glow on Hover */}
      <div className="absolute inset-0 bg-linear-to-br from-primary/12 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className="p-3 rounded-2xl bg-primary/12 text-primary group-hover:bg-primary group-hover:text-black transition-all duration-300 shadow-sm ring-1 ring-primary/20">
            <Folder className="w-6 h-6 fill-current" />
          </div>
          <button
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-white/5"
            onClick={openContextMenuFromButton}
            aria-label="Open actions"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <h3 className="font-bold text-lg truncate text-white group-hover:text-primary transition-colors">
            {name}
          </h3>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <span className="px-2 py-1 rounded-full bg-white/5 text-white">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>
            {size && (
              <span className="px-2 py-1 rounded-full bg-white/5 text-white/80">
                {size}
              </span>
            )}
            {!modifiedInFooter && modifiedAt && (
              <span className="px-2 py-1 rounded-full bg-white/5 text-[11px] font-semibold text-white/80">
                {modifiedAt}
              </span>
            )}
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-primary/10 hover:bg-primary/20 text-[11px] font-semibold text-primary border-primary/20 py-1 px-2.5 rounded-full"
                >
                  <Tag className="w-2.5 h-2.5 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {(shared || (modifiedInFooter && modifiedAt)) && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
              {modifiedInFooter && modifiedAt ? (
                <span className="text-[10px] font-black uppercase tracking-widest leading-none text-muted-foreground">
                  {modifiedAt}
                </span>
              ) : (
                <div />
              )}
              {shared ? (
                <div className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider border border-blue-500/20">
                  Shared
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full w-full">
        {content}
      </Link>
    );
  }

  return content;
}
