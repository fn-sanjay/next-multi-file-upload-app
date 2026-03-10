"use client";

import { useEffect, useMemo, useState } from "react";
import { QueriesContent } from "./queries-content";
import { fetchWithRefresh } from "@/lib/client/auth-api";
import { toast } from "sonner";

export type AdminQuery = {
  id: string;
  subject: string;
  message: string;
  status: "OPEN" | "CLOSED";
  createdAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
};

export default function QueriesView() {
  const [queries, setQueries] = useState<AdminQuery[]>([]);
  const [selectedQuery, setSelectedQuery] = useState<AdminQuery | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const loadQueries = async () => {
    try {
      setLoading(true);
      const res = await fetchWithRefresh("/api/admin/client-queries");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to load queries");
      }
      const data = await res.json();
      setQueries(data.queries || []);
    } catch (err: any) {
      toast.error(err?.message || "Unable to fetch queries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueries();
  }, []);

  const filteredQueries = useMemo(
    () =>
      queries.filter(
        (q) =>
          (q.user.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.subject.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [queries, searchQuery],
  );

  const handleReply = async (closeAfter = true) => {
    if (!selectedQuery || !replyText.trim()) return;
    try {
      setActioningId(selectedQuery.id);
      const res = await fetchWithRefresh(`/api/admin/client-queries/${selectedQuery.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: replyText.trim(), close: closeAfter }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send reply");
      }
      await res.json();
      toast.success("Reply sent to user");
      setReplyText("");
      setSelectedQuery(null);
      await loadQueries();
    } catch (err: any) {
      toast.error(err?.message || "Reply failed");
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 bg-black text-white custom-scrollbar h-full overflow-y-auto">
      <QueriesContent
        filteredQueries={filteredQueries}
        selectedQuery={selectedQuery}
        searchQuery={searchQuery}
        replyText={replyText}
        setSearchQuery={setSearchQuery}
        setSelectedQuery={setSelectedQuery}
        setReplyText={setReplyText}
        onReply={handleReply}
        loading={loading}
        actioningId={actioningId}
      />
    </div>
  );
}
