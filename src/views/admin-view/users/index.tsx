"use client";

import { useEffect, useState } from "react";
import { UsersHeader } from "./users-header";
import { UsersTable } from "./users-table";
import { fetchWithRefresh } from "@/lib/client/auth-api";
import { toast } from "sonner";

export type AdminUser = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  storageUsed: string;
  storageQuota: string;
  isReadOnly: boolean;
  isBanned: boolean;
  createdAt: string;
  lastLoginAt?: string | null;
};

export default function AdminUsersView() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadUsers = async (query = "") => {
    try {
      setLoading(true);
      const res = await fetchWithRefresh(`/api/admin/users${query ? `?search=${encodeURIComponent(query)}` : ""}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to fetch users");
      }
      const data = await res.json();
      const filtered = (data.users || []).filter(
        (u: AdminUser) => u.role?.toLowerCase() !== "admin",
      );
      setUsers(filtered);
    } catch (err: any) {
      toast.error(err?.message || "Unable to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers(search.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const handleUserUpdate = async (id: string, payload: Partial<Pick<AdminUser, "isBanned" | "isReadOnly">>) => {
    try {
      const res = await fetchWithRefresh(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update user");
      }

      const data = await res.json();
      const updated = data.user;

      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, ...updated } : u)),
      );

      toast.success("User updated");
    } catch (err: any) {
      toast.error(err?.message || "Update failed");
    }
  };

  const toggleBan = (user: AdminUser) =>
    handleUserUpdate(user.id, { isBanned: !user.isBanned });

  const toggleReadOnly = (user: AdminUser) =>
    handleUserUpdate(user.id, { isReadOnly: !user.isReadOnly });

  const deleteUser = async (user: AdminUser) => {
    const confirmed = window.confirm(`Soft delete ${user.email}? They will be banned and hidden.`);
    if (!confirmed) return;
    try {
      setDeletingId(user.id);
      const res = await fetchWithRefresh(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete user");
      }
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      toast.success("User removed");
    } catch (err: any) {
      toast.error(err?.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8 bg-black">
      <UsersHeader search={search} setSearch={setSearch} />
      <UsersTable
        users={users}
        loading={loading}
        onToggleBan={toggleBan}
        onToggleReadOnly={toggleReadOnly}
        onDeleteUser={deleteUser}
        deletingId={deletingId}
      />
    </div>
  );
}
