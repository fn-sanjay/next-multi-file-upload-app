"use client";

import { Button } from "@/components/ui/button";

interface StorageOverviewProps {
  totalLimitBytes: number;
  totalUsedBytes: number;
  usage: Record<
    string,
    {
      bytes: number;
      count: number;
    }
  >;
  loading?: boolean;
  onRequestStorage?: () => void;
}

export function StorageOverview({
  totalLimitBytes,
  totalUsedBytes,
  usage,
  loading,
  onRequestStorage,
}: StorageOverviewProps) {
  const segments = [
    { name: "Images", key: "images", color: "#a855f7" },
    { name: "Documents", key: "docs", color: "#06b6d4" },
    { name: "Videos", key: "video", color: "#d946ef" },
    { name: "Others", key: "others", color: "#bfff00" },
  ]
    .map((seg) => ({
      ...seg,
      bytes: usage?.[seg.key]?.bytes ?? 0,
      count: usage?.[seg.key]?.count ?? 0,
    }))
    .filter((seg) => seg.bytes > 0);

  const formatGB = (bytes: number) => (bytes / 1024 / 1024 / 1024).toFixed(1);
  const formatMB = (bytes: number) => (bytes / 1024 / 1024).toFixed(0);

  return (
    <div className="grid md:grid-cols-3 overflow-hidden rounded-2xl border border-zinc-800 bg-black/60 shadow-[0_25px_60px_rgba(0,0,0,0.6)]">

      {/* LEFT SIDE */}
      <div className="md:col-span-2 p-8 space-y-8 relative">

        <div className="absolute inset-0 pointer-events-none
        bg-[radial-gradient(circle_at_20%_10%,rgba(191,255,0,0.05),transparent_40%),
        radial-gradient(circle_at_80%_20%,rgba(6,182,212,0.05),transparent_45%)]"/>

        <div className="relative flex justify-between items-start">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-primary">
              Storage & Plans
            </p>

            <h2 className="text-3xl font-black text-white mt-2">
              Storage Usage
            </h2>

            <p className="text-zinc-500 text-sm">
              {loading
                ? "Loading..."
                : `You are using ${formatGB(totalUsedBytes)} GB of ${formatGB(
                    totalLimitBytes
                  )} GB`}
            </p>
          </div>

          <Button
            variant="link"
            className="text-primary text-xs font-black uppercase tracking-[0.2em]"
            onClick={onRequestStorage}
          >
            Request More Storage
          </Button>
        </div>

        {/* BIG PROGRESS BAR */}
        <div className="h-3 w-full bg-zinc-900 rounded-full overflow-hidden shadow-inner">
          <div className="flex h-full">
            {segments.map((type) => {
              const pct =
                totalLimitBytes > 0
                  ? (type.bytes / totalLimitBytes) * 100
                  : 0;

              return (
                <div
                  key={type.key}
                  style={{
                    width: `${pct}%`,
                    backgroundColor: type.color,
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* CATEGORY STATS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {segments.map((type) => (
            <div key={type.name} className="space-y-2">
              <div className="flex items-center gap-2">
                <div
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: type.color }}
                />
                <span className="text-xs font-bold text-zinc-300">
                  {type.name}
                </span>
              </div>

              <p className="text-2xl font-black text-white">
                {formatGB(type.bytes)}{" "}
                <span className="text-xs text-zinc-500">GB</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="p-8 border-l border-zinc-800 bg-zinc-950/80 flex flex-col justify-between gap-6">

        <div className="space-y-4">

          <div className="flex justify-between">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
              Storage
            </span>

            <span className="text-lg font-black text-white">
              {loading ? "..." : `${formatMB(totalUsedBytes)} MB`}
              <span className="text-[11px] text-zinc-500 font-semibold">
                {" "}
                / {loading ? "..." : `${formatMB(totalLimitBytes)} MB`}
              </span>
            </span>
          </div>

          {/* SMALL PROGRESS */}
          <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${
                  totalLimitBytes > 0
                    ? (totalUsedBytes / totalLimitBytes) * 100
                    : 0
                }%`,
                background:
                  "linear-gradient(to right,#a855f7,#06b6d4,#d946ef,#bfff00)",
              }}
            />
          </div>

          {/* LEGEND */}
          <div className="grid grid-cols-2 gap-y-2 text-[11px] text-zinc-500">
            {segments.map((type) => (
              <div key={type.name} className="flex items-center gap-2">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: type.color }}
                />

                <span>
                  {type.name} {formatMB(type.bytes)}MB
                </span>
              </div>
            ))}
          </div>
        </div>

        <Button
          size="lg"
          onClick={onRequestStorage}
          className="w-full bg-primary text-black hover:bg-primary/90 font-black uppercase tracking-[0.2em] rounded-full h-12"
        >
          Request Storage
        </Button>

      </div>
    </div>
  );
}