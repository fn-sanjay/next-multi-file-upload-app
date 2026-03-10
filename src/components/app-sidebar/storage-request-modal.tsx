"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { fetchWithRefresh } from "@/lib/client/auth-api";
import { toast } from "sonner";
import { HardDrive, Zap } from "lucide-react";

const OPTIONS_MB = [100, 200, 300];
const getErrorMessage = (err: unknown, fallback: string) =>
  err instanceof Error ? err.message : fallback;

interface StorageRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const StorageRequestModal = ({
  open,
  onOpenChange,
}: StorageRequestModalProps) => {
  const [selected, setSelected] = useState(OPTIONS_MB[0]);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    try {
      setSubmitting(true);
      await fetchWithRefresh("/api/user/storage-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestedQuota: selected * 1024 * 1024, // bytes
        }),
      });
      toast.success("Storage request sent");
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to send request"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border border-primary/20 bg-linear-to-br from-black via-zinc-950 to-zinc-900 shadow-[0_25px_80px_rgba(0,0,0,0.6)]">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(191,255,0,0.08),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(6,182,212,0.08),transparent_35%)]" />

        <DialogHeader className="relative space-y-2">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-primary/15 text-primary border border-primary/30">
              <HardDrive className="size-5" />
            </span>
            <div>
              <DialogTitle className="text-xl font-black text-white">
                Request Extra Storage
              </DialogTitle>
              <p className="text-sm text-zinc-400">
                Choose a boost and we’ll queue it instantly. No forms, no fuss.
              </p>
            </div>
          </div>
        </DialogHeader>

        <RadioGroup
          value={selected.toString()}
          onValueChange={(val) => setSelected(Number(val))}
          className="relative space-y-3 mt-4"
        >
          {OPTIONS_MB.map((mb) => (
            <div
              key={mb}
              className={`flex items-center justify-between gap-3 rounded-xl border p-3 transition-all ${
                selected === mb
                  ? "border-primary/60 bg-primary/5 shadow-[0_10px_40px_rgba(191,255,0,0.15)]"
                  : "border-white/5 bg-white/5 hover:border-primary/30 hover:bg-white/10"
              }`}
            >
              <div className="flex items-center gap-3">
                <RadioGroupItem value={mb.toString()} id={`mb-${mb}`} />
                <Label htmlFor={`mb-${mb}`} className="cursor-pointer space-y-0.5">
                  <span className="block text-base font-semibold text-white">
                    {mb} MB
                  </span>
                  <span className="block text-xs text-zinc-500">
                    Quick top-up for upcoming uploads.
                  </span>
                </Label>
              </div>
              <Zap className="size-4 text-primary" />
            </div>
          ))}
        </RadioGroup>

        <Button
          className="mt-6 w-full bg-primary text-black hover:bg-primary/90 font-bold"
          disabled={submitting}
          onClick={submit}
        >
          {submitting ? "Submitting..." : "Submit Request"}
        </Button>

        <p className="mt-3 text-xs text-zinc-500 text-center">
          Requests are processed automatically. You’ll be notified as soon as it’s applied.
        </p>
      </DialogContent>
    </Dialog>
  );
};
