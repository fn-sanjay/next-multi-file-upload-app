import { FileContextMenu } from "@/components/common/file-context-menu";
import { FolderCard } from "@/components/common/folder-card";
import type { FolderItem } from "@/types";

interface FoldersGridProps {
  folders: FolderItem[];
  currentFolderId?: string | null;
  refresh?: () => void;
}

export function FoldersGrid({
  folders,
  currentFolderId,
  refresh,
}: FoldersGridProps) {

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">

      {folders.map((folder) => (

        <FileContextMenu
          key={folder.id}
          id={folder.id}
          name={folder.name}
          type="folder"
          currentFolderId={currentFolderId}
          refresh={refresh}
        >
          <div className="h-full">
            <FolderCard
              name={folder.name}
              itemCount={folder.items}
              modifiedAt={folder.modified}
              tags={folder.tags}
              shared={folder.shared}
              modifiedInFooter
              href={`/folders/${folder.slug || folder.id}`}
            />
          </div>

        </FileContextMenu>

      ))}

    </div>
  );
}