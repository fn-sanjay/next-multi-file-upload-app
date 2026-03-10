import { HardDrive, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface StorageRequestsHeaderProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}

export function StorageRequestsHeader({ searchQuery, setSearchQuery }: StorageRequestsHeaderProps) {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight text-white uppercase italic flex items-center gap-3">
            <HardDrive className="size-8 text-primary" />
          Storage Requests
          </h2>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">
            Manage user storage expansion requests and approvals

          </p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-600" />
          <Input placeholder="Search by user or subject..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-zinc-900/50 border-zinc-800 pl-10 h-11 focus:ring-primary rounded-xl" />
          </div>
      </div>
    </>
  );
}
