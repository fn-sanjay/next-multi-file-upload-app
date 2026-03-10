import { HardDrive } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { UserActionsMenu } from "./users-actions-menu";
import type { AdminUser } from "./index";
import { Skeleton } from "@/components/ui/skeleton";

const formatBytes = (bytesString?: string) => {
  const bytes = Number(bytesString ?? 0);
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(value >= 10 || value % 1 === 0 ? 0 : 1)} ${units[i]}`;
};

interface UsersTableProps {
  users: AdminUser[];
  loading?: boolean;
  onToggleBan: (user: AdminUser) => void;
  onToggleReadOnly: (user: AdminUser) => void;
  onDeleteUser: (user: AdminUser) => void;
  deletingId?: string | null;
}

export function UsersTable({ users, loading, onToggleBan, onToggleReadOnly, onDeleteUser, deletingId }: UsersTableProps) {
  return (
    <Card className="bg-card border-zinc-900 overflow-hidden">
      <Table>
        <TableHeader className="bg-zinc-900/50">
          <TableRow className="hover:bg-transparent border-zinc-800">
            <TableHead className="text-zinc-400 uppercase text-[10px] font-black tracking-widest py-4">User</TableHead>
            <TableHead className="text-zinc-400 uppercase text-[10px] font-black tracking-widest py-4">Access</TableHead>
            <TableHead className="text-zinc-400 uppercase text-[10px] font-black tracking-widest py-4">Storage Usage</TableHead>
            <TableHead className="text-zinc-400 uppercase text-[10px] font-black tracking-widest py-4">Joined</TableHead>
            <TableHead className="text-right text-zinc-400 uppercase text-[10px] font-black tracking-widest py-4">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading
            ? Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={`skeleton-${idx}`} className="border-zinc-900">
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4"><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell className="py-4"><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell className="py-4"><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell className="py-4 text-right"><Skeleton className="h-8 w-10 ml-auto" /></TableCell>
                </TableRow>
              ))
            : users.length === 0 ? (
              <TableRow className="border-zinc-900">
                <TableCell colSpan={5} className="py-6 text-center text-zinc-500">
                  No users found.
                </TableCell>
              </TableRow>
            ) : users.map((user) => {
                const displayName = user.name || "Unnamed";
                const accessBadge = user.isBanned
                  ? { label: "Banned", className: "bg-red-500/10 text-red-400 border-red-500/30" }
                  : user.isReadOnly
                    ? { label: "Read-only", className: "bg-amber-500/10 text-amber-300 border-amber-500/30" }
                    : { label: "Active", className: "bg-primary/10 text-primary border-primary/20" };

                return (
                  <TableRow key={user.id} className="border-zinc-900 hover:bg-zinc-900/30">
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-10 border border-zinc-800">
                          <AvatarImage src={""} />
                          <AvatarFallback className="bg-zinc-800 text-white font-bold">
                            {displayName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-bold text-white text-sm">{displayName}</span>
                          <span className="text-xs text-zinc-500">{user.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge variant="secondary" className={accessBadge.className}>
                        {accessBadge.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        <HardDrive className="size-3 text-zinc-500" />
                        <span className="text-sm text-zinc-300 font-medium">
                          {formatBytes(user.storageUsed)} / {formatBytes(user.storageQuota)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-sm text-zinc-500">
                      {new Date(user.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="py-4 text-right">
                      <UserActionsMenu
                        user={user}
                        onToggleBan={() => onToggleBan(user)}
                        onToggleReadOnly={() => onToggleReadOnly(user)}
                        onDelete={() => onDeleteUser(user)}
                        disabled={deletingId === user.id}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
        </TableBody>
      </Table>
    </Card>
  );
}
