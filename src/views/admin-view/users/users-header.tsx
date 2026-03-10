import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface UsersHeaderProps {
  search: string;
  setSearch: (value: string) => void;
}

export function UsersHeader({ search, setSearch }: UsersHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">User Management</h1>
        <p className="text-zinc-500 font-medium">Manage user accounts, permissions, and status.</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" /><Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-zinc-900 border-zinc-800 focus:ring-primary h-11" /></div>
      </div>
    </div>
  );
}
