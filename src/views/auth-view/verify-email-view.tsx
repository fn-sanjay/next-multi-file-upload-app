"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Mail,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronLeft,
  MoveRight,
} from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/routes";
import { fetchWithRefresh } from "@/lib/client/auth-api";

export const VerifyEmailView = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("Verifying your email address...");
  const [errorType, setErrorType] = useState<"expired" | "invalid" | "none">(
    "none",
  );

  const effectRan = useRef(false);

  const verify = useCallback(async () => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid or missing verification token.");
      return;
    }

    try {
      const res = await fetchWithRefresh(
        `/api/auth/verify-email?token=${token}`,
      );
      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(
          data.message || "Your email has been successfully verified.",
        );
      } else {
        setStatus("error");
        setMessage(data.error || "Verification failed.");
        if (data.error?.toLowerCase().includes("expired")) {
          setErrorType("expired");
        }
      }
    } catch (err) {
      setStatus("error");
      setMessage("An unexpected error occurred. Please try again later.");
    }
  }, [token]);

  useEffect(() => {
    if (effectRan.current === false) {
      verify();
      effectRan.current = true;
    }
  }, [verify]);

  return (
    <div className="w-full">
      <Card className="bg-card border-zinc-800 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-primary to-transparent opacity-50" />

        <CardHeader className="space-y-4 text-center pb-8 border-b border-zinc-900">
          <div className="flex justify-center">
            <div
              className={`p-4 rounded-2xl border ${
                status === "loading"
                  ? "bg-zinc-900 border-zinc-800"
                  : status === "success"
                    ? "bg-primary/10 border-primary/20"
                    : "bg-red-500/10 border-red-500/20"
              }`}
            >
              {status === "loading" && (
                <Loader2 className="size-8 text-zinc-500 animate-spin" />
              )}
              {status === "success" && (
                <CheckCircle2 className="size-8 text-primary" />
              )}
              {status === "error" && (
                <XCircle className="size-8 text-red-500" />
              )}
            </div>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-black tracking-tight text-white uppercase italic">
              {status === "loading"
                ? "Verifying"
                : status === "success"
                  ? "Success!"
                  : "Failed"}
            </CardTitle>
            <CardDescription className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">
              Email Verification
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="py-12 space-y-6 text-center">
          <div className="space-y-4 max-w-[300px] mx-auto">
            <p className="text-zinc-400 text-sm font-medium leading-relaxed">
              {message}
            </p>

            {status === "error" && errorType === "expired" && (
              <p className="text-zinc-500 text-xs italic">
                The verification period has lapsed. For security reasons,
                unverified accounts are removed.
              </p>
            )}
          </div>

          {status === "success" && (
            <Button
              asChild
              className="w-full h-12 text-sm font-black uppercase tracking-widest bg-primary text-black hover:bg-primary/90 rounded-xl gap-2 group transition-all"
            >
              <Link href={ROUTES.auth.signIn}>
                Go to Sign In
                <MoveRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          )}

          {status === "error" && (
            <Button
              asChild
              variant="outline"
              className="w-full h-11 border-zinc-800 text-zinc-400 hover:text-white rounded-xl font-bold gap-2 text-[10px] uppercase tracking-widest px-8"
            >
              <Link
                href={
                  errorType === "expired"
                    ? ROUTES.auth.signUp
                    : ROUTES.auth.signIn
                }
              >
                {errorType === "expired"
                  ? "Create New Account"
                  : "Back to Sign In"}
              </Link>
            </Button>
          )}
        </CardContent>

        <CardFooter className="flex flex-col items-center pb-8 pt-4">
          <Link
            href={ROUTES.auth.signIn}
            className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-2 hover:text-white transition-colors"
          >
            <ChevronLeft className="size-3" />
            Back to Sign In
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};
