import { Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
export interface TagItem {
  id: string;
  name: string;
  color: string;
  count?: number;
}

interface TagsSidebarProps {
  tags: TagItem[];
  selectedTagId: string | null;
  totalItems: number;
  onSelectTag: (tagId: string | null) => void;
  onDeleteTag: (tagId: string) => void;
}

export function TagsSidebar({
  tags,
  selectedTagId,
  totalItems,
  onSelectTag,
  onDeleteTag,
}: TagsSidebarProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        All Tags
      </h2>
      <div className="flex flex-col gap-2">
        <div
          role="button"
          tabIndex={0}
          onClick={() => onSelectTag(null)}
          onKeyDown={(e) => e.key === "Enter" && onSelectTag(null)}
          className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 cursor-pointer ${
            selectedTagId === null
              ? "bg-primary/10 text-primary ring-1 ring-primary/30"
              : "bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground"
          }`}
        >
          <div className="flex items-center gap-3">
            <Tag className="w-4 h-4" />
            <span className="font-medium">All Items</span>
          </div>
          <Badge variant="secondary" className="bg-primary text-black font-bold">
            {totalItems}
          </Badge>
        </div>

        {tags.map((tag) => (
          <div
            key={tag.id}
            role="button"
            tabIndex={0}
            onClick={() => onSelectTag(tag.id)}
            onKeyDown={(e) => e.key === "Enter" && onSelectTag(tag.id)}
            className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 cursor-pointer ${
              selectedTagId === tag.id
                ? "ring-1 ring-primary/30 bg-primary/10 text-primary"
                : "bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: tag.color }}
              />
              <span className="font-medium">{tag.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-primary text-black font-bold">
                {tag.count ?? 0}
              </Badge>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-md text-zinc-500 hover:text-rose-400 hover:bg-white/10 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteTag(tag.id);
                }}
                aria-label="Delete tag"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
