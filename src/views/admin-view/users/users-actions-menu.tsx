import { Ban, Lock, MoreHorizontal, Unlock, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { AdminUser } from "./index";

interface UserActionsMenuProps {
  user: AdminUser;
  onToggleBan: () => void;
  onToggleReadOnly: () => void;
  onDelete: () => void;
  disabled?: boolean;
}

export function UserActionsMenu({ user, onToggleBan, onToggleReadOnly, onDelete, disabled }: UserActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-zinc-500 hover:text-white hover:bg-zinc-800"
          disabled={disabled}
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-card border-zinc-800 text-zinc-300">
        <DropdownMenuLabel>Quick actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={onToggleReadOnly}
          className="focus:bg-zinc-900 focus:text-white cursor-pointer"
        >
          <UploadCloud className="size-4 mr-2" />
          {user.isReadOnly ? "Allow uploads" : "Set read-only"}
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-zinc-800" />
        <DropdownMenuItem
          onClick={onToggleBan}
          className={`cursor-pointer ${user.isBanned ? "text-primary focus:text-primary focus:bg-primary/5" : "text-red-500 focus:text-red-500 focus:bg-red-500/5"}`}
        >
          {user.isBanned ? (
            <>
              <Unlock className="size-4 mr-2" />
              Unban user
            </>
          ) : (
            <>
              <Ban className="size-4 mr-2" />
              Ban user
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-zinc-800" />
        <DropdownMenuItem
          onClick={onDelete}
          className="text-red-500 focus:text-red-500 focus:bg-red-500/5 cursor-pointer"
        >
          <Lock className="size-4 mr-2" />
          Soft delete user
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
