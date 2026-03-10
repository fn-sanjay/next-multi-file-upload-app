import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function StorageHeader() {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Storage Control</h1>
        <p className="text-zinc-500 font-medium">Configure global quotas and monitor drive health.</p>
      </div>
      <Button className="bg-primary text-black hover:bg-primary/90 font-bold h-11 px-6 rounded-xl">
        <Plus className="size-4 mr-2" />
        Add Storage Node
      </Button>
    </div>
  );
}
