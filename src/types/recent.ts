import type { LucideIcon } from "lucide-react";

export interface RecentActivityItem {
  id: string;
  name: string;
  type: string;
  action: string;
  time: string;
  user: string;
  icon: LucideIcon;
  iconColor: string;
}

export interface RecentActivityGroup {
  group: string;
  items: RecentActivityItem[];
}
