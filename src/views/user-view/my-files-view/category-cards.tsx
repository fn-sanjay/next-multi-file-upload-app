"use client";

import { Card } from "@/components/ui/card";
import {
  FileImage,
  Video,
  FileText,
  Box,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchWithRefresh } from "@/lib/client/auth-api";
import { UPLOADS_REFRESH_EVENT } from "@/lib/upload-events";

export function CategoryCards() {
  const [usage, setUsage] = useState({
    images: { bytes: 0, count: 0 },
    video: { bytes: 0, count: 0 },
    docs: { bytes: 0, count: 0 },
    others: { bytes: 0, count: 0 },
    trash: { bytes: 0, count: 0 },
  });

  const load = useCallback(async () => {
    try {
      const res = await fetchWithRefresh("/api/user/storage-usage");
      if (!res.ok) return;
      const data = await res.json();
      setUsage({
        images: data.usage?.images || { bytes: 0, count: 0 },
        video: data.usage?.video || { bytes: 0, count: 0 },
        docs: data.usage?.docs || { bytes: 0, count: 0 },
        others: data.usage?.others || { bytes: 0, count: 0 },
        trash: data.usage?.trash || { bytes: 0, count: 0 },
      });
    } catch (err) {
      console.error("category usage fetch failed", err);
    }
  }, []);

  useEffect(() => {
    void load();

    const handleRefresh = () => {
      void load();
    };

    window.addEventListener(UPLOADS_REFRESH_EVENT, handleRefresh);
    return () => {
      window.removeEventListener(UPLOADS_REFRESH_EVENT, handleRefresh);
    };
  }, [load]);

  const categories = useMemo(
    () => [
      {
        key: "images",
        title: "Images",
        icon: FileImage,
        data: usage.images,
        color: "from-yellow-500/20 to-yellow-600/20",
        iconColor: "text-yellow-500",
       
      },
      {
        key: "video",
        title: "Videos",
        icon: Video,
        data: usage.video,
        color: "from-blue-500/20 to-blue-600/20",
        iconColor: "text-blue-500",
       
      },
      {
        key: "docs",
        title: "Documents",
        icon: FileText,
        data: usage.docs,
        color: "from-orange-500/20 to-orange-600/20",
        iconColor: "text-orange-500",
       
      },
      {
        key: "others",
        title: "Others",
        icon: Box,
        data: usage.others,
        color: "from-purple-500/20 to-purple-600/20",
        iconColor: "text-purple-500",
        
      },
      {
        key: "trash",
        title: "Trash",
        icon: Trash2,
        data: usage.trash,
        color: "from-pink-500/20 to-pink-600/20",
        iconColor: "text-pink-500",
        
      },
    ],
    [usage],
  );

  const formatSize = (bytes: number) => {
    if (bytes <= 0) return "0 MB";
    const mb = bytes / 1024 / 1024;
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    return `${(mb / 1024).toFixed(1)} GB`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {categories.map((category) => (
        <Card
          key={category.title}
         
          className={`relative overflow-hidden group hover:border-chartreuse-500/50 transition-all duration-300 cursor-pointer border-white/5 bg-white/5 hover:bg-white/10`}
        >
          <div
            className={`absolute inset-0 bg-linear-to-br ${category.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
          />
          <div className="relative p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div
                className={`p-2 rounded-xl bg-background/50 backdrop-blur-sm border border-white/5 ${category.iconColor}`}
              >
                <category.icon className="w-6 h-6" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-primary">{category.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">
                  {category.data.count} files
                </span>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                <span className="text-xs text-muted-foreground">
                  {formatSize(category.data.bytes)}
                </span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
