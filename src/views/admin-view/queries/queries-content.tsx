import { QueriesHeader } from "./queries-header";
import { QueriesTableCard } from "./queries-table-card";
import { QueriesDetailSheet } from "./queries-detail-sheet";
import type { AdminQuery } from "./index";

interface QueriesContentProps {
  filteredQueries: AdminQuery[];
  selectedQuery: AdminQuery | null;
  searchQuery: string;
  replyText: string;
  setSearchQuery: (value: string) => void;
  setSelectedQuery: (query: AdminQuery | null) => void;
  setReplyText: (value: string) => void;
  onReply: (closeAfter?: boolean) => void;
  loading?: boolean;
  actioningId?: string | null;
}

export function QueriesContent(props: QueriesContentProps) {
  const { filteredQueries, selectedQuery, searchQuery, replyText, setSearchQuery, setSelectedQuery, setReplyText, onReply, loading, actioningId } = props;

  return (
    <>
      <QueriesHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <QueriesTableCard filteredQueries={filteredQueries} setSelectedQuery={setSelectedQuery} loading={loading} />
      <QueriesDetailSheet selectedQuery={selectedQuery} replyText={replyText} setSelectedQuery={setSelectedQuery} setReplyText={setReplyText} onReply={onReply} actioningId={actioningId} />
    </>
  );
}
