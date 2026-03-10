import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Folder, MoreVertical, Star, Tag as TagIcon } from "lucide-react";
import { openContextMenuFromButton } from "@/lib/open-context-menu";
import { cn } from "@/lib/utils";

type FavoriteFolderCardProps = {
  item: {
    id: string;
    name: string;
    items: number;
    modifiedDate: string;
    modifiedTime: string;
    tags?: string[];
    isFavorite: boolean;
  };
  onRemoveFavorite: () => void;
};

export function FavoriteFolderCard({
  item,
  onRemoveFavorite,
}: FavoriteFolderCardProps) {
  return (
    <Card className="group h-full min-h-56 p-5 border border-white/8 bg-white/5 hover:border-primary/50 hover:bg-white/10 transition-all duration-300 relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-primary/8 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10 flex items-start justify-between">
        <div className="p-3 rounded-2xl bg-primary/12 text-primary shadow-sm ring-1 ring-primary/20">
          <Folder className="w-6 h-6 fill-current" />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-md text-primary hover:bg-primary/10"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onRemoveFavorite();
          }}
          aria-label="Remove from favorites"
        >
          <Star
            className={cn(
              "w-4 h-4",
              item.isFavorite ? "fill-primary text-primary" : "fill-transparent text-primary",
            )}
          />
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        <h3 className="text-lg font-bold text-white truncate group-hover:text-primary">
          {item.name}
        </h3>

        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="bg-primary/10 border-primary/20 text-primary text-[11px] font-semibold px-2.5 py-1 rounded-full"
              >
                <TagIcon className="w-3 h-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-white/80">
          <div className="flex items-center gap-2">
            <span className="font-semibold">
              {item.items} {item.items === 1 ? "item" : "items"}
            </span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span className="font-semibold">{item.modifiedTime}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10"
            onClick={openContextMenuFromButton}
            aria-label="Open actions"
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>

        <div className="text-[11px] font-semibold text-white/60">
          {item.modifiedDate}
        </div>
      </div>
    </Card>
  );
}
