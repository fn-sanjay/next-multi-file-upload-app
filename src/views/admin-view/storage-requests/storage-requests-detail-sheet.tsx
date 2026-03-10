import { CheckCircle2, HardDrive, XCircle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AdminStorageRequest } from "./index";

const formatBytes = (bytesString: string) => {
  const bytes = Number(bytesString);
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(value >= 10 || value % 1 === 0 ? 0 : 1)} ${units[i]}`;
};

interface StorageRequestsDetailSheetProps {
  selectedRequest: AdminStorageRequest | null;
  setSelectedRequest: (request: AdminStorageRequest | null) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  actioningId?: string | null;
}

export function StorageRequestsDetailSheet({
  selectedRequest,
  setSelectedRequest,
  onApprove,
  onReject,
  actioningId,
}: StorageRequestsDetailSheetProps) {
  return (
    <Sheet
      open={!!selectedRequest}
      onOpenChange={(open) => !open && setSelectedRequest(null)}
    >
      <SheetContent className="bg-card border-zinc-800 sm:max-w-md p-0 overflow-hidden">
        {selectedRequest ? (
          <div className="h-full flex flex-col">
            <SheetHeader className="p-6 bg-zinc-900/50 border-b border-zinc-800">
              <div className="flex items-center gap-4 mb-2">
                <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <HardDrive className="size-6 text-primary" />
                </div>
                <div>
                  <SheetTitle className="text-xl font-bold text-white">
                    Request Detail
                  </SheetTitle>
                  <SheetDescription className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                    ID: {selectedRequest.id}
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <div className="flex-1 p-6 space-y-8 custom-scrollbar overflow-y-auto">
              <RequestedBy request={selectedRequest} />
              <StorageDetails request={selectedRequest} />
              {selectedRequest.status === "PENDING" ? (
                <ActionButtons
                  request={selectedRequest}
                  onApprove={onApprove}
                  onReject={onReject}
                  actioningId={actioningId}
                />
              ) : (
                <RepliedView status={selectedRequest.status} />
              )}
            </div>

            <SheetFooter className="p-6 border-t border-zinc-800 bg-zinc-900/20">
              <Button
                variant="ghost"
                className="w-full text-zinc-500 font-bold uppercase tracking-widest text-[10px]"
                onClick={() => setSelectedRequest(null)}
              >
                Close Details
              </Button>
            </SheetFooter>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function RequestedBy({ request }: { request: AdminStorageRequest }) {
  return (
    <div className="space-y-2">
      <Label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
        Requested By
      </Label>
      <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center gap-3">
        <div className="size-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold">
          {(request.user.name || request.user.email)?.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-bold text-white">{request.user.name || "Unnamed"}</p>
          <p className="text-xs text-zinc-500">{request.user.email}</p>
        </div>
      </div>
    </div>
  );
}

function StorageDetails({ request }: { request: AdminStorageRequest }) {
  return (
    <div className="space-y-2">
      <Label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
        Storage Details
      </Label>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
          <p className="text-xs text-zinc-500 font-black uppercase tracking-widest mb-1">
            Requested
          </p>
          <p className="text-2xl font-black text-primary">{formatBytes(request.requestedQuota)}</p>
        </div>
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
          <p className="text-xs text-zinc-500 font-black uppercase tracking-widest mb-1">
            Current quota
          </p>
          <p className="text-lg font-black text-white">{formatBytes(request.user.storageQuota)}</p>
        </div>
      </div>
    </div>
  );
}

function RepliedView({ status }: { status: AdminStorageRequest["status"] }) {
  return (
    <div className="space-y-2">
      <Label
        className={cn(
          "text-[10px] font-black uppercase tracking-widest",
          status === "APPROVED" ? "text-emerald-500" : "text-red-400",
        )}
      >
        {status === "APPROVED" ? "Approved" : "Rejected"}
      </Label>
      <div
        className={cn(
          "p-4 rounded-xl border text-sm leading-relaxed",
          status === "APPROVED"
            ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-200"
            : "bg-red-500/5 border-red-500/20 text-red-200",
        )}
      >
        {status === "APPROVED" ? "Storage increased." : "Request denied."}
      </div>
      {status === "APPROVED" ? (
        <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
          <CheckCircle2 className="size-3" />
          Approved
        </div>
      ) : (
        <div className="flex items-center gap-2 text-[10px] font-bold text-red-400 uppercase tracking-widest">
          <XCircle className="size-3" />
          Rejected
        </div>
      )}
    </div>
  );
}

function ActionButtons({
  request,
  onApprove,
  onReject,
  actioningId,
}: {
  request: AdminStorageRequest;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  actioningId?: string | null;
}) {
  const disabled = request.status !== "PENDING" || actioningId === request.id;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={() => onApprove(request.id)}
          disabled={disabled}
          className="bg-primary text-black font-black uppercase tracking-widest text-xs h-12 rounded-xl disabled:opacity-50"
        >
          {actioningId === request.id ? "Working..." : "Approve"}
        </Button>
        <Button
          variant="outline"
          onClick={() => onReject(request.id)}
          disabled={disabled}
          className="border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-500/10 font-black uppercase tracking-widest text-xs h-12 rounded-xl disabled:opacity-50"
        >
          Reject
        </Button>
      </div>
    </div>
  );
}

function Label({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-2 ml-1",
        className,
      )}
    >
      {children}
    </p>
  );
}
