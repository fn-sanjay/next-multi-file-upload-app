import { StorageRequestsHeader } from "./storage-requests-header";
import { StorageRequestsTableCard } from "./storage-requests-table-card";
import { StorageRequestsDetailSheet } from "./storage-requests-detail-sheet";
import type { AdminStorageRequest } from "./index";

interface StorageRequestsContentProps {
  filteredRequests: AdminStorageRequest[];
  selectedRequest: AdminStorageRequest | null;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  setSelectedRequest: (request: AdminStorageRequest | null) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  loading?: boolean;
  actioningId?: string | null;
}

export function StorageRequestsContent(props: StorageRequestsContentProps) {
  const {
    filteredRequests,
    selectedRequest,
    searchQuery,
    setSearchQuery,
    setSelectedRequest,
    onApprove,
    onReject,
    loading,
    actioningId,
  } = props;

  return (
    <>
      <StorageRequestsHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <StorageRequestsTableCard
        filteredRequests={filteredRequests}
        setSelectedRequest={setSelectedRequest}
        loading={loading}
      />
      <StorageRequestsDetailSheet
        selectedRequest={selectedRequest}
        setSelectedRequest={setSelectedRequest}
        onApprove={onApprove}
        onReject={onReject}
        actioningId={actioningId}
      />
    </>
  );
}
