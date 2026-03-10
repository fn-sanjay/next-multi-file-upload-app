import { Filter, MessageSquare, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface QueriesHeaderProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}

export function QueriesHeader({ searchQuery, setSearchQuery }: QueriesHeaderProps) {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight text-white uppercase italic flex items-center gap-3">
            <MessageSquare className="size-8 text-primary" />
            Client Queries
          </h2>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">
            Review and respond to general user support messages and inquiries
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-600" />
          <Input placeholder="Search by user or subject..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-zinc-900/50 border-zinc-800 pl-10 h-11 focus:ring-primary rounded-xl" />
        </div>
        <Button variant="outline" className="border-zinc-800 bg-zinc-900/50 text-zinc-400 gap-2 font-bold uppercase tracking-widest text-[10px] rounded-xl h-11">
          <Filter className="size-4" />Filter
        </Button>
      </div>
    </>
  );
}
