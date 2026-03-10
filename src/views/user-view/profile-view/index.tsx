"use client";

import { HardDrive, ShieldCheck, User } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileHeader } from "./profile-header";
import { ProfileTabContent } from "./profile-tab-content";
import { useEffect, useState } from "react";
import { fetchWithRefresh } from "@/lib/client/auth-api";

export default function ProfileView() {
  const [storage, setStorage] = useState<{
    totalLimitBytes: number;
    totalUsedBytes: number;
    usage: Record<string, { bytes: number; count: number }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchWithRefresh("/api/user/storage-usage");
        if (!res.ok) return;
        const data = await res.json();
        setStorage({
          totalLimitBytes: data.totalLimitBytes ?? 0,
          totalUsedBytes: data.totalUsedBytes ?? 0,
          usage: data.usage ?? {},
        });
      } catch (err) {
        console.error("storage fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full bg-black overflow-hidden">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-5xl mx-auto p-8 space-y-10 pb-20">
          <ProfileHeader />

          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="bg-zinc-900/50 p-1 rounded-xl border border-zinc-800">
              <TabsTrigger
                value="overview"
                className="rounded-lg px-6 data-[state=active]:bg-zinc-800 data-[state=active]:text-white"
              >
                <User className="size-4 mr-2" />
                Personal Info
              </TabsTrigger>
            </TabsList>

            <ProfileTabContent storage={storage} loading={loading} />
          </Tabs>
        </div>
      </div>
    </div>
  );
}
