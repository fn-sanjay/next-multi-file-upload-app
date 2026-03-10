import { useState } from "react";
import { Plus, Search, Tag as TagIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BRAND_COLORS, MAX_TAGS_PER_USER } from "@/lib/constants";
import { fetchWithRefresh } from "@/lib/client/auth-api";

const getErrorMessage = (err: unknown, fallback: string) =>
  err instanceof Error ? err.message : fallback;

interface TagsHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  tagCount: number;
  onTagCreated?: () => void;
}

export function TagsHeader({
  searchQuery,
  onSearchChange,
  tagCount,
  onTagCreated,
}: TagsHeaderProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(BRAND_COLORS[0]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const maxTagsReached = tagCount >= MAX_TAGS_PER_USER;

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      setError("Tag name is required");
      return;
    }
    if (maxTagsReached) {
      setError(`Maximum ${MAX_TAGS_PER_USER} tags reached`);
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const res = await fetchWithRefresh("/api/user/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newTagName.trim(),
          color: newTagColor,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create tag");
      }

      setIsDialogOpen(false);
      setNewTagName("");
      setNewTagColor(BRAND_COLORS[0]);
      onTagCreated?.();
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Failed to create tag"));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tags</h1>
        <p className="text-muted-foreground mt-1">
          Organize and filter your content using custom tags.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tags..."
            className="pl-10 bg-white/5 border-white/10 h-11 focus-visible:ring-primary/50"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              disabled={maxTagsReached}
              className="bg-primary hover:bg-[#a6e600] text-black font-semibold h-11 px-6 rounded-xl shadow-[0_0_20px_rgba(191,255,0,0.2)] whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Tag
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-106.25 bg-zinc-950 border-white/10 text-foreground">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <TagIcon className="w-6 h-6 text-primary" />
                Create New Tag
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-6 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Tag Name
                </label>
                <Input
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="e.g. Project Alpha"
                  className="bg-white/5 border-white/10 h-12 focus-visible:ring-primary/50"
                  maxLength={50}
                  disabled={maxTagsReached}
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-muted-foreground">
                  Color
                </label>
                <div className="flex flex-wrap gap-3">
                  {BRAND_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewTagColor(color)}
                      className={`w-10 h-10 rounded-full transition-all duration-200 ${
                        newTagColor === color
                          ? "ring-2 ring-primary ring-offset-2 ring-offset-zinc-950 scale-110 shadow-lg shadow-primary/20"
                          : "opacity-50 hover:opacity-100 hover:scale-105"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-sm mt-2">{error}</div>
              )}

              <div className="flex justify-end pt-4 border-t border-white/10">
                <Button
                  onClick={handleCreateTag}
                  disabled={isCreating || !newTagName.trim() || maxTagsReached}
                  className="w-full bg-primary hover:bg-[#a6e600] text-black font-bold h-12 rounded-xl"
                >
                  {isCreating ? "Creating..." : "Create Tag"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
