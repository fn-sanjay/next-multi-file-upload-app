import {
  LayoutGrid,
  FolderOpen,
  Star,
  Users,
  Clock,
  Trash2,
  Tag,
  Gauge,
  UserCog,
  Database,
  ScrollText,
  HardDrive,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";
import { ROUTES } from "@/routes";

export interface NavigationItem {
  title: string;
  url: string;
  icon: LucideIcon;
  badge?: number | string;
}

export const SIDEBAR_NAV: NavigationItem[] = [
  {
    title: "My Files",
    url: ROUTES.pages.myFiles,
    icon: LayoutGrid,
  },
  {
    title: "Folders",
    url: ROUTES.pages.folders,
    icon: FolderOpen,
  },
  {
    title: "Favorites",
    url: ROUTES.pages.favorites,
    icon: Star,
  },
  {
    title: "Tags",
    url: ROUTES.pages.tags,
    icon: Tag,
  },
  {
    title: "Trash",
    url: ROUTES.pages.archive,
    icon: Trash2,
  },
];

export const ADMIN_NAV: NavigationItem[] = [
  {
    title: "User Control",
    url: ROUTES.admin.users,
    icon: UserCog,
  },
  {
    title: "Storage Control",
    url: ROUTES.admin.storage,
    icon: HardDrive,
  },
  {
    title: "Storage Requests",
    url: ROUTES.admin.storageRequests,
    icon: Database,
  },
  {
    title: "Client Queries",
    url: ROUTES.admin.queries,
    icon: MessageSquare,
  },
];
