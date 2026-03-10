"use client";

import { useEffect, useMemo, useState } from "react";
import { StorageRequestsContent } from "./storage-requests-content";
import { fetchWithRefresh } from "@/lib/client/auth-api";
import { toast } from "sonner";

export type AdminStorageRequest = {
  id: string;
  userId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  requestedQuota: string;
  createdAt: string;
  approvedAt?: string | null;
  user: {
    id: string;
    email: string;
    name: string | null;
    storageQuota: string;
  };
};

export default function StorageRequestsView() {
  const [requests, setRequests] = useState<AdminStorageRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<AdminStorageRequest | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await fetchWithRefresh("/api/admin/storage-requests");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to load requests");
      }
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (err: any) {
      toast.error(err?.message || "Unable to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const filteredRequests = useMemo(
    () =>
      requests.filter(
        (req) =>
          (req.user.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          req.user.email.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [requests, searchQuery],
  );

  const updateRequestStatus = (id: string, status: AdminStorageRequest["status"]) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status, approvedAt: new Date().toISOString() } : r)),
    );
    if (selectedRequest?.id === id) {
      setSelectedRequest((prev) => (prev ? { ...prev, status } : prev));
    }
  };

  const handleAction = async (id: string, action: "APPROVE" | "REJECT") => {
    try {
      setActioningId(id);
      const res = await fetchWithRefresh(`/api/admin/storage-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to process request");
      }
      await res.json();
      await loadRequests();
      toast.success(action === "APPROVE" ? "Storage approved" : "Request rejected");
    } catch (err: any) {
      toast.error(err?.message || "Action failed");
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 bg-black text-white custom-scrollbar h-full overflow-y-auto">
      <StorageRequestsContent
        filteredRequests={filteredRequests}
        selectedRequest={selectedRequest}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setSelectedRequest={setSelectedRequest}
        onApprove={(id) => handleAction(id, "APPROVE")}
        onReject={(id) => handleAction(id, "REJECT")}
        loading={loading}
        actioningId={actioningId}
      />
    </div>
  );
}
