import { ArrowUpRight, Database } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminStorageStats } from "./storage-content";

const formatBytes = (bytes?: number) => {
  const value = Number(bytes ?? 0);
  if (!value) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  const num = value / Math.pow(1024, i);
  return `${num.toFixed(num >= 10 || num % 1 === 0 ? 0 : 1)} ${units[i]}`;
};

export function StorageClusterCard({ stats, loading }: { stats: AdminStorageStats | null; loading?: boolean }) {
  const used = stats?.totalUsedBytes ?? 0;
  const limit = stats?.totalLimitBytes ?? 0;
  const percent = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  const available = Math.max(0, limit - used);
  const users = stats?.totalUsers ?? 0;

  return (
    <Card className="md:col-span-2 bg-card border-zinc-900 border-l-4 border-l-primary/50">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2 text-primary">
          <Database className="size-5 text-primary" />
          Main Storage Cluster
        </CardTitle>
        <CardDescription className="text-zinc-500">Global system storage status and allocation.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <p className="text-4xl font-black text-white">{loading ? "…" : formatBytes(used)}</p>
              <p className="text-sm font-medium text-zinc-500">
                Utilized of {loading ? "…" : formatBytes(limit)} Capacity
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{loading ? "…" : `${percent.toFixed(1)}%`}</p>
              <p className="text-xs font-black uppercase tracking-widest text-zinc-600">Usage rate</p>
            </div>
          </div>
          <div className="h-4 bg-zinc-900 rounded-full overflow-hidden flex border border-zinc-800">
            <div
              className="h-full bg-primary shadow-[0_0_15px_rgba(182,255,0,0.3)] transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
          <Metric label="Available" value={loading ? "…" : formatBytes(available)} />
          <Metric label="User Quota Total" value={loading ? "…" : formatBytes(limit)} />
          <Metric label="Users" value={loading ? "…" : `${users}`} />
          <div className="space-y-1">
            <p className="text-xs font-black text-zinc-500 uppercase tracking-widest">Daily Trend</p>
            <p className="text-xl font-bold text-primary flex items-center gap-1"><ArrowUpRight className="size-4" />+1.2%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-black text-zinc-500 uppercase tracking-widest">{label}</p>
      <p className="text-xl font-bold text-white">{value}</p>
    </div>
  );
}
