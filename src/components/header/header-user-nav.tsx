"use client";

import { User, LogOut } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";

export const HeaderUserNav = () => {
  const { user, signOut, isAdmin } = useAuth();

  if (!user) return null;
  const avatarUrl = user.profileImage || user.avatar || undefined;

  return (
    <div className="flex items-center gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-9 w-9 rounded-full p-0 transition-all hover:ring-2 hover:ring-primary/50"
          >
            <Avatar className="h-9 w-9 border border-zinc-800">
              <AvatarImage key={avatarUrl} src={avatarUrl} alt={user.name} />
              <AvatarFallback className="bg-zinc-900 text-zinc-400">
                {user.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-56 bg-card border-zinc-800 text-zinc-400"
          align="end"
          forceMount
        >
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-bold text-white leading-none">
                {user.name}
              </p>
              <p className="text-xs text-zinc-500 leading-none">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-zinc-800" />
          {!isAdmin && (
            <DropdownMenuGroup>
              <Link href="/profile">
                <DropdownMenuItem className="focus:bg-zinc-900 focus:text-white cursor-pointer gap-2">
                  <User className="size-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
          )}
          <DropdownMenuSeparator className="bg-zinc-800" />
          <DropdownMenuItem
            onClick={() => signOut()}
            className="focus:bg-red-500/10 focus:text-red-500 cursor-pointer gap-2"
          >
            <LogOut className="size-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
