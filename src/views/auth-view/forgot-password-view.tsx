"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, CheckCircle2, ChevronLeft, MoveRight } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/routes";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/lib/validations/auth";
import { authPost } from "@/lib/client/auth-api";

export const ForgotPasswordView = () => {
  const [isSent, setIsSent] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await authPost<{ success: boolean }>("/api/auth/forgot-password", {
        email: values.email,
      });
      setIsSent(true);
      toast.success("Reset instructions sent");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Request failed");
    }
  });

  return (
    <div className="w-full">
      <Card className="bg-card border-zinc-800 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-primary to-transparent opacity-50" />

        {!isSent ? (
          <>
            <CardHeader className="space-y-4 text-center pb-8">
              <div className="flex justify-center">
                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
                  <Mail className="size-8 text-primary" />
                </div>
              </div>
              <div className="space-y-1">
                <CardTitle className="text-3xl font-black tracking-tight text-white uppercase italic">
                  Reset Link
                </CardTitle>
                <CardDescription className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">
                  Send a password recovery email
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <form className="space-y-6" onSubmit={onSubmit}>
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    className="bg-zinc-900/50 border-zinc-800 text-white h-12 rounded-xl focus-visible:ring-primary/20"
                    {...form.register("email")}
                  />
                  {form.formState.errors.email ? (
                    <p className="text-[11px] text-red-400 ml-1">
                      {form.formState.errors.email.message}
                    </p>
                  ) : null}
                </div>

                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="w-full h-12 text-sm font-black uppercase tracking-widest bg-primary text-black hover:bg-primary/90 rounded-xl gap-2 group transition-all"
                >
                  {form.formState.isSubmitting
                    ? "Sending..."
                    : "Send Instructions"}
                  <MoveRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>
            </CardContent>
          </>
        ) : (
          <CardContent className="py-12 space-y-6 text-center animate-in zoom-in-95 duration-500">
            <div className="flex justify-center">
              <div className="size-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <CheckCircle2 className="size-10 text-primary" />
              </div>
            </div>
            <div className="space-y-2 max-w-[280px] mx-auto">
              <h2 className="text-2xl font-black text-white uppercase italic">
                Check Email
              </h2>
              <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                We&apos;ve sent recovery instructions to your email address.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsSent(false)}
              className="border-zinc-800 text-zinc-400 hover:text-white rounded-xl font-bold gap-2 text-[10px] uppercase tracking-widest px-8"
            >
              Resend Email
            </Button>
          </CardContent>
        )}

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
