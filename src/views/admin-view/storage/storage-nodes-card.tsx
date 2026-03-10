import { Server } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AdminStorageStats } from "./storage-content";

const formatBytes = (bytes?: number) => {
  const value = Number(bytes ?? 0);
  if (!value) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  const num = value / Math.pow(1024, i);
  return `${num.toFixed(num >= 10 || num % 1 === 0 ? 0 : 1)} ${units[i]}`;
};

export function StorageNodesCard({ users, loading, fullWidth }: { users?: AdminStorageStats["users"]; loading?: boolean; fullWidth?: boolean }) {
  const topUsers = (users ?? []).slice().sort((a, b) => b.usedBytes - a.usedBytes).slice(0, 4);
  return (
    <Card className={cn("bg-card border-zinc-900", fullWidth && "md:col-span-2 text-primary")}>
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Server className="size-5 text-primary" />
          Top Consumers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading
            ? Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="h-14 rounded-xl bg-zinc-900/30 border border-zinc-800 animate-pulse" />
              ))
            : topUsers.map((user) => {
                const quota = Number(user.storageQuota ?? 0);
                const percent = quota > 0 ? Math.min(100, (user.usedBytes / quota) * 100) : 0;
                return (
                  <div key={user.id} className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/30 border border-zinc-800">
                    <div>
                      <p className="font-bold text-white text-sm">{user.name || "Unnamed"}</p>
                      <p className="text-xs text-zinc-500">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xs font-black text-zinc-600 uppercase">Usage</p>
                        <p className="font-bold text-zinc-300">
                          {formatBytes(user.usedBytes)} / {formatBytes(quota)}
                        </p>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                          {percent.toFixed(1)}%
                        </p>
                      </div>
                      <Badge variant="outline" className={percent > 85 ? "text-orange-500 border-orange-500/20" : "text-primary border-primary/20"}>
                        {user.usedCount} files
                      </Badge>
                    </div>
                  </div>
                );
              })}
        </div>
      </CardContent>
    </Card>
  );
}
