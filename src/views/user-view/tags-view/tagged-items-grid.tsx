import { FolderCard } from "@/components/common/folder-card";
import { Tag } from "lucide-react";
import type { TaggedContentItem } from "@/types";
import { FileContextMenu } from "@/components/common/file-context-menu";
import { FileItemCard } from "@/components/common/file-item-card";

interface TaggedItemsGridProps {
  selectedTagName: string | null;
  items: TaggedContentItem[];
  onFileClick: (item: TaggedContentItem) => void;
}

export function TaggedItemsGrid({
  selectedTagName,
  items,
  onFileClick,
}: TaggedItemsGridProps) {
  return (
    <div className="lg:col-span-3 space-y-6">

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">
          {selectedTagName
            ? `Items tagged "${selectedTagName}"`
            : "Recent Activity"}
        </h2>

        <div className="text-sm text-muted-foreground">
          Showing {items.length} items
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {items.map((item) => {

          /* ---------------- FOLDER ---------------- */

          if (item.type === "folder") {
            return (
              <FileContextMenu
                key={item.id}
                id={item.id}
                name={item.name}
                type="folder"
              >
                <div className="h-full">
                  <FolderCard
                    name={item.name}
                    itemCount={item.items || 0}
                    modifiedAt={item.date}
                    tags={[item.tag]}
                    shared={item.tag?.toLowerCase() === "shared"}
                    className="h-full"
                  />
                </div>
              </FileContextMenu>
            );
          }

          /* ---------------- FILE ---------------- */

          return (
            <FileContextMenu
              key={item.id}
              id={item.id}
              name={item.name}
              type="file"
              onViewDetails={() => onFileClick(item)}
            >
              <div className="h-full">
                <FileItemCard
                  fileId={item.id}
                  fileName={item.name}
                  size={item.size || "Unknown size"}
                  modified={item.date}
                  tags={[item.tag]}
                  showFavorite={false}
                  onClick={() => onFileClick(item)}
                />
              </div>
            </FileContextMenu>
          );
        })}
      </div>

      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
          <div className="p-4 rounded-full bg-white/5 mb-4">
            <Tag className="w-8 h-8 text-muted-foreground" />
          </div>

          <h3 className="text-lg font-bold">No items found</h3>

          <p className="text-muted-foreground">
            Try selecting a different tag or search term.
          </p>
        </div>
      )}

    </div>
  );
}