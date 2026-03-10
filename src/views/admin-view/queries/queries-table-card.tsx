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
import type { AdminQuery } from "./index";

interface QueriesTableCardProps {
  filteredQueries: AdminQuery[];
  setSelectedQuery: (query: AdminQuery) => void;
  loading?: boolean;
}

export function QueriesTableCard({
  filteredQueries,
  setSelectedQuery,
  loading,
}: QueriesTableCardProps) {
  return (
    <Card className="bg-card border-zinc-800 overflow-hidden shadow-2xl">
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-zinc-900/50 border-b border-zinc-800">
            <TableRow className="hover:bg-transparent border-zinc-800">
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 py-4 px-6">User</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 py-4 px-6">Subject</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 py-4 px-6">Message Preview</TableHead>
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
              : filteredQueries.map((q) => (
              <TableRow
                key={q.id}
                className="border-zinc-800 hover:bg-zinc-900/30 cursor-pointer transition-colors group"
                onClick={() => setSelectedQuery(q)}
              >
                <TableCell className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-black text-[10px]">
                      {(q.user.name || q.user.email || "?").charAt(0).toUpperCase()}
                    </div>
                    <span className="font-bold text-sm text-white group-hover:text-primary transition-colors">
                      {q.user.name || "Unnamed"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest border border-zinc-800 px-2 py-1 rounded-md">
                    {q.subject}
                  </span>
                </TableCell>
                <TableCell className="py-4 px-6 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
                  <span className="text-zinc-400 text-xs font-medium italic">
                    &quot;{q.message}&quot;
                  </span>
                </TableCell>
                <TableCell className="py-4 px-6 text-center">
                  <Badge
                    className={cn(
                      "font-black tracking-widest text-[8px] uppercase px-2 py-0 h-5",
                      q.status === "CLOSED"
                        ? "bg-primary/10 text-primary border-primary/20"
                        : "bg-blue-500/10 text-blue-500 border-blue-500/20",
                    )}
                  >
                    {q.status.toLowerCase()}
                  </Badge>
                </TableCell>
                <TableCell className="py-4 px-6 text-right text-zinc-500 font-medium text-[10px]">
                  {new Date(q.createdAt).toISOString().slice(0, 10)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredQueries.length === 0 ? (
          <div className="p-20 text-center space-y-4">
            <div className="size-16 rounded-2xl bg-zinc-900 border border-zinc-800 mx-auto flex items-center justify-center">
              <Clock className="size-8 text-zinc-700 opacity-30" />
            </div>
            <p className="text-zinc-600 font-bold uppercase tracking-widest text-xs">
              No client queries found
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
