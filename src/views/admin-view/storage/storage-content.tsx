import { useEffect, useState } from "react";
import { toast } from "sonner";
import { fetchWithRefresh } from "@/lib/client/auth-api";
import { StorageHeader } from "./storage-header";
import { StorageClusterCard } from "./storage-cluster-card";
import { StorageDistributionCard } from "./storage-distribution-card";
import { StorageNodesCard } from "./storage-nodes-card";

export type AdminStorageStats = {
  totalUsers: number;
  totalLimitBytes: number;
  totalUsedBytes: number;
  usage: {
    images: { bytes: number; count: number };
    docs: { bytes: number; count: number };
    video: { bytes: number; count: number };
    audio: { bytes: number; count: number };
    others: { bytes: number; count: number };
    trash: { bytes: number; count: number };
  };
  users: {
    id: string;
    name: string | null;
    email: string;
    storageQuota: string;
    usedBytes: number;
    usedCount: number;
    trashBytes: number;
  }[];
};

export function StorageContent() {
  const [stats, setStats] = useState<AdminStorageStats | null>(null);
  const [loading, setLoading] = useState(false);

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await fetchWithRefresh("/api/admin/storage-stats");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to load storage stats");
      }
      const data = await res.json();
      setStats({
        ...data,
        totalLimitBytes: Number(data.totalLimitBytes ?? 0),
        totalUsedBytes: Number(data.totalUsedBytes ?? 0),
      });
    } catch (err: any) {
      toast.error(err?.message || "Unable to fetch storage stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <>
      <StorageHeader />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StorageClusterCard stats={stats} loading={loading} />
        <StorageDistributionCard usage={stats?.usage} loading={loading} />
      </div>
      <div className="grid grid-cols-1 gap-6">
        <StorageNodesCard users={stats?.users} loading={loading} fullWidth />
      </div>
    </>
  );
}
