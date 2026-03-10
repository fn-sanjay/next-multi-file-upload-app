import {
  ArrowUpRight,
  CheckCircle2,
  MessageSquare,
  MoreHorizontal,
  Reply,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { AdminQuery } from "./index";

interface QueriesDetailSheetProps {
  selectedQuery: AdminQuery | null;
  replyText: string;
  setSelectedQuery: (query: AdminQuery | null) => void;
  setReplyText: (value: string) => void;
  onReply: (closeAfter?: boolean) => void;
  actioningId?: string | null;
}

export function QueriesDetailSheet({
  selectedQuery,
  replyText,
  setSelectedQuery,
  setReplyText,
  onReply,
  actioningId,
}: QueriesDetailSheetProps) {
  return (
    <Sheet
      open={!!selectedQuery}
      onOpenChange={(open) => !open && setSelectedQuery(null)}
    >
      <SheetContent className="bg-card border-zinc-800 sm:max-w-md p-0 overflow-hidden shadow-2xl">
        {selectedQuery ? (
          <div className="h-full flex flex-col">
            <SheetHeader className="p-6 bg-zinc-900/50 border-b border-zinc-800">
              <div className="flex items-center gap-4 mb-2">
                <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform">
                  <MessageSquare className="size-6 text-primary" />
                </div>
                <div>
                  <SheetTitle className="text-xl font-black text-white uppercase italic tracking-tight">
                    Query Preview
                  </SheetTitle>
                  <SheetDescription className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                    Reference: #{selectedQuery.id}
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <div className="flex-1 p-6 space-y-8 custom-scrollbar overflow-y-auto">
              <FromUser query={selectedQuery} />
              <UserMessage message={selectedQuery.message} />

              {selectedQuery.status === "CLOSED" ? (
                <SentReply />
              ) : (
                <DraftReply
                  replyText={replyText}
                  setReplyText={setReplyText}
                  onReply={onReply}
                  actioning={actioningId === selectedQuery.id}
                />
              )}
            </div>

            <SheetFooter className="p-6 border-t border-zinc-800 bg-black/40">
              <p className="text-[9px] text-zinc-700 font-bold uppercase text-center w-full">
                Secure Admin Channel • Replies are private
              </p>
            </SheetFooter>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function FromUser({ query }: { query: AdminQuery }) {
  return (
    <div className="space-y-2">
      <Label>From User</Label>
      <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold">
            {(query.user.name || query.user.email || "?").charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-bold text-white">{query.user.name || "Unnamed"}</p>
            <p className="text-[10px] text-zinc-600 font-bold uppercase">
              {query.user.email}
            </p>
          </div>
        </div>
        <Button size="icon" variant="ghost" className="size-8 text-zinc-700 hover:text-white">
          <MoreHorizontal className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function UserMessage({ message }: { message: string }) {
  return (
    <div className="space-y-2">
      <Label>User Inquiry Message</Label>
      <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-300 italic leading-relaxed relative bg-linear-to-b from-zinc-900/50 to-zinc-950">
        <Badge className="absolute -top-3 left-4 bg-zinc-800 border-zinc-700 text-zinc-500 text-[8px] font-black px-2 py-0">
          RECEIVED MESSAGE
        </Badge>
        &quot;{message}&quot;
      </div>
    </div>
  );
}

function SentReply() {
  return (
    <div className="space-y-2 pt-4 border-t border-zinc-800/50">
      <Label className="text-primary italic">Sent Reply</Label>
      <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 text-sm text-zinc-200 leading-relaxed relative shadow-[0_0_15px_rgba(182,255,0,0.05)]">
        <Badge className="absolute -top-3 left-4 bg-primary text-black text-[8px] font-black px-2 py-0">
          ADMIN RESPONSE
        </Badge>
        User has been notified via email.
        <div className="flex items-center gap-1.5 mt-3 text-[10px] font-black text-primary uppercase tracking-widest">
          <CheckCircle2 className="size-3" />
          Delivered to user
        </div>
      </div>
    </div>
  );
}

function DraftReply({
  replyText,
  setReplyText,
  onReply,
  actioning = false,
}: {
  replyText: string;
  setReplyText: (value: string) => void;
  onReply: (closeAfter?: boolean) => void;
  actioning?: boolean;
}) {
  return (
    <div className="space-y-4 pt-4 border-t border-zinc-800/50">
      <Label className="text-primary">Draft Response</Label>
      <div className="relative group/reply">
        <Textarea
          placeholder="Type your reply message here..."
          className="bg-zinc-900 border-zinc-800 text-white min-h-35 rounded-2xl focus:ring-primary/20 focus:border-primary transition-all p-5 placeholder:text-zinc-700 placeholder:italic"
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
        />
        <Reply className="absolute right-4 bottom-4 size-5 text-zinc-700 group-focus-within/reply:text-primary transition-colors pointer-events-none" />
      </div>
      <Button
        onClick={() => onReply(true)}
        disabled={actioning || !replyText.trim()}
        className="w-full bg-primary text-black font-black uppercase tracking-widest text-xs h-12 rounded-xl shadow-[0_0_20px_rgba(182,255,0,0.15)] hover:shadow-[0_0_25px_rgba(182,255,0,0.25)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {actioning ? "Sending..." : "Send Reply"}
        <ArrowUpRight className="size-4" />
      </Button>
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
