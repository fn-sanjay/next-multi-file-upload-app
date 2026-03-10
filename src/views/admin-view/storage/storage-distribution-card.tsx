import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, XAxis, YAxis, Cell } from "recharts";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import type { AdminStorageStats } from "./storage-content";

const COLORS = {
  Images: "#B6FF00",
  Videos: "#00D4C8",
  Docs: "#a855f7",
  Audio: "#22d3ee",
  Others: "#d946ef",
  Trash: "#ef4444",
};

const formatData = (usage?: AdminStorageStats["usage"]) => {
  const u = usage ?? {
    images: { bytes: 0, count: 0 },
    docs: { bytes: 0, count: 0 },
    video: { bytes: 0, count: 0 },
    audio: { bytes: 0, count: 0 },
    others: { bytes: 0, count: 0 },
    trash: { bytes: 0, count: 0 },
  };
  return [
    { name: "Images", value: u.images.bytes },
    { name: "Videos", value: u.video.bytes },
    { name: "Docs", value: u.docs.bytes },
    { name: "Audio", value: u.audio.bytes },
    { name: "Others", value: u.others.bytes },
    { name: "Trash", value: u.trash.bytes },
  ].map((d) => ({ ...d, display: bytesToMB(d.value) }));
};

const bytesToMB = (b: number) => (b / (1024 ** 2)).toFixed(1);

export function StorageDistributionCard({ usage, loading }: { usage?: AdminStorageStats["usage"]; loading?: boolean }) {
  const data = formatData(usage);
  return (
    <Card className="bg-card border-zinc-900">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-primary">Data Distribution</CardTitle>
        <CardDescription className="text-zinc-500">By file category.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{ value: { label: "MB", color: "#b6ff00" } }}
          className="h-55 w-full"
        >
          <BarChart data={data} layout="vertical" style={{ background: "transparent" }}>
            <XAxis type="number" hide />
            <YAxis
              dataKey="name"
              type="category"
              stroke="#52525b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={80}
            />
            <ChartTooltip
              cursor={false}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const item = payload[0];
                const name = item?.payload?.name;
                const value = item?.payload?.display;
                return (
                  <div className="rounded-md border border-primary/40 bg-zinc-950/95 px-3 py-2 text-xs text-primary shadow-lg">
                    <div className="font-bold">{name}</div>
                    <div className="text-white">{value} MB</div>
                  </div>
                );
              }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} background={{ fill: "transparent" }} animationDuration={900} >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={(COLORS as any)[entry.name] ?? "#a1a1aa"} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
        <div className="space-y-3 mt-4">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full" style={{ backgroundColor: (COLORS as any)[item.name] ?? "#a1a1aa" }} />
                <span className="text-xs font-medium text-zinc-400">{item.name}</span>
              </div>
              <span className="text-xs font-bold text-white">
                {loading ? "…" : `${item.display} MB`}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
