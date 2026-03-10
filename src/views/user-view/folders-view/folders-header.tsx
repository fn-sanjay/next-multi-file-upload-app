import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FoldersHeaderProps {
  onCreate: () => void;
}

export function FoldersHeader({ onCreate }: FoldersHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Folders</h1>
        <p className="text-muted-foreground mt-1">
          Manage and organize your projects in folders.
        </p>
      </div>
      <Button
        onClick={onCreate}
        className="bg-primary hover:bg-[#a6e600] text-black font-semibold h-11 px-6 rounded-xl shadow-[0_0_20px_rgba(191,255,0,0.2)]"
      >
        <Plus className="w-5 h-5 mr-2" />
        New Folder
      </Button>
    </div>
  );
}
