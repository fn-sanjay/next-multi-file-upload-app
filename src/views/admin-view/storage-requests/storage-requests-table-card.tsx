import { Clock } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AdminStorageRequest } from "./index";

interface StorageRequestsTableCardProps {
  filteredRequests: AdminStorageRequest[];
  setSelectedRequest: (request: AdminStorageRequest) => void;
  loading?: boolean;
}

export function StorageRequestsTableCard({
  filteredRequests,
  setSelectedRequest,
  loading,
}: StorageRequestsTableCardProps) {
  const formatBytes = (bytes: string) => {
    const value = Number(bytes);
    if (!value) return "0 B";
    const units = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
    const num = value / Math.pow(1024, i);
    return `${num.toFixed(num >= 10 || num % 1 === 0 ? 0 : 1)} ${units[i]}`;
  };

  return (
    <Card className="bg-card border-zinc-800 overflow-hidden shadow-2xl">
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-zinc-900/50 border-b border-zinc-800">
            <TableRow className="hover:bg-transparent border-zinc-800">
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 py-4 px-6">User</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 py-4 px-6">Subject</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 py-4 px-6 text-center">AmountRequested</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 py-4 px-6 text-center">Status</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 py-4 px-6 text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={`s-${idx}`} className="border-zinc-800">
                    <TableCell className="py-4 px-6" colSpan={5}>
                      <div className="h-4 bg-zinc-900 rounded animate-pulse w-3/4" />
                    </TableCell>
                  </TableRow>
                ))
              : filteredRequests.map((req) => {
                  const initial = (req.user.name || req.user.email || "?").charAt(0).toUpperCase();
                  return (
                    <TableRow
                      key={req.id}
                      className="border-zinc-800 hover:bg-zinc-900/30 cursor-pointer transition-colors group"
                      onClick={() => setSelectedRequest(req)}
                    >
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs">
                            {initial}
                          </div>
                          <span className="font-bold text-sm text-white group-hover:text-primary transition-colors">
                            {req.user.name || "Unnamed"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <span className="text-zinc-400 text-sm font-medium">{req.user.email}</span>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-center">
                        <Badge className="bg-primary/10 text-primary border-primary/20 font-black px-2 py-0 h-6">
                          {formatBytes(req.requestedQuota)}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-center">
                        <Badge
                          className={cn(
                            "font-black tracking-widest text-[8px] uppercase px-2 py-0 h-5",
                            req.status === "APPROVED"
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                              : req.status === "REJECTED"
                                ? "bg-red-500/10 text-red-500 border-red-500/20"
                                : "bg-orange-500/10 text-orange-500 border-orange-500/20",
                          )}
                        >
                          {req.status.toLowerCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-right text-zinc-500 font-medium text-xs">
                        {new Date(req.createdAt).toISOString().slice(0, 10)}
                      </TableCell>
                    </TableRow>
                  );
                })}
          </TableBody>
        </Table>

        {!loading && filteredRequests.length === 0 ? (
          <div className="p-20 text-center space-y-4">
            <div className="size-16 rounded-2xl bg-zinc-900 border border-zinc-800 mx-auto flex items-center justify-center">
              <Clock className="size-8 text-zinc-700 opacity-30" />
            </div>
            <p className="text-zinc-600 font-bold uppercase tracking-widest text-xs">
              No storage requests found
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
