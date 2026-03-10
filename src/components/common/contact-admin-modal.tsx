"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpload } from "@/components/providers/upload-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { useSupport } from "@/components/providers/support-provider";
import { ShieldCheck, Send, CheckCircle2 } from "lucide-react";

export function ContactAdminModal() {
  const { isContactAdminOpen, setIsContactAdminOpen } = useUpload();
  const { user } = useAuth();
  const { addQuery } = useSupport();
  const [submitted, setSubmitted] = React.useState(false);
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [amount, setAmount] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    addQuery({
      type: "storage",
      userId: user.id,
      userName: user.name || "Anonymous",
      subject,
      message,
      amount: amount ? `${amount}GB` : undefined,
    });

    setSubmitted(true);
    setTimeout(() => {
      setIsContactAdminOpen(false);
      setSubmitted(false);
      setSubject("");
      setMessage("");
      setAmount("");
    }, 2000);
  };

  return (
    <Dialog open={isContactAdminOpen} onOpenChange={setIsContactAdminOpen}>
      <DialogContent className="sm:max-w-112.5 bg-card border-zinc-800 p-0 overflow-hidden">
        {!submitted ? (
          <div className="relative group p-px rounded-3xl">
            <div className="bg-card rounded-3xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-white/5 bg-black/40 flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <ShieldCheck className="size-6 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold tracking-tight text-white">
                    Contact Admin
                  </DialogTitle>
                  <DialogDescription className="text-xs text-zinc-500 font-medium uppercase tracking-widest mt-0.5">
                    Request storage or technical support
                  </DialogDescription>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="subject"
                    className="text-zinc-400 font-bold text-[10px] uppercase tracking-widest"
                  >
                    Subject
                  </Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., Higher storage limit request"
                    className="bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 h-11"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="amount"
                      className="text-zinc-400 font-bold text-[10px] uppercase tracking-widest"
                    >
                      Storage Amount (GB)
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="e.g., 50"
                      className="bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-400 font-bold text-[10px] uppercase tracking-widest">
                      Priority
                    </Label>
                    <div className="h-11 bg-zinc-900/50 border border-zinc-800 rounded-lg flex items-center px-4 text-xs font-bold text-primary">
                      Normal
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="message"
                    className="text-zinc-400 font-bold text-[10px] uppercase tracking-widest"
                  >
                    Message
                  </Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your storage needs..."
                    className="bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 min-h-30 resize-none"
                    required
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full bg-primary text-black hover:bg-primary/90 font-black uppercase tracking-widest h-12 rounded-xl flex items-center justify-center gap-2 group transition-all active:scale-[0.98]"
                  >
                    <Send className="size-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    Send Request
                  </Button>
                </div>

                <p className="text-[10px] text-center text-zinc-600 font-medium px-4">
                  By submitting this request, you agree to our terms. Admins
                  typically respond within 24 hours.
                </p>
              </form>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center space-y-6 flex flex-col items-center justify-center bg-card min-h-100">
            <div className="size-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center animate-in zoom-in duration-500">
              <CheckCircle2 className="size-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white">Request Sent!</h2>
              <p className="text-zinc-500 text-sm max-w-60 mx-auto">
                Your message has been delivered. The administrator will review
                your request shortly.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
