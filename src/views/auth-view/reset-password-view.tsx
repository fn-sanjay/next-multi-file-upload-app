"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
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
import {
  Lock,
  MoveRight,
  CheckCircle2,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/routes";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/lib/validations/auth";
import { authPost } from "@/lib/client/auth-api";

export const ResetPasswordView = () => {
  const [isReset, setIsReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const searchParams = useSearchParams();

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const token = searchParams.get("token");

    if (!token) {
      toast.error("Missing reset token");
      return;
    }

    try {
      await authPost<{ success: boolean }>("/api/auth/reset-password", {
        token,
        newPassword: values.password,
      });

      setIsReset(true);
      toast.success("Password reset successful");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Reset failed");
    }
  });

  return (
    <div className="w-full">
      <Card className="bg-card border-zinc-800 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-primary to-transparent opacity-50" />

        {!isReset ? (
          <>
            <CardHeader className="space-y-4 text-center pb-8">
              <div className="flex justify-center">
                <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl">
                  <Lock className="size-8 text-primary" />
                </div>
              </div>
              <div className="space-y-1">
                <CardTitle className="text-3xl font-black tracking-tight text-white uppercase italic">
                  New Password
                </CardTitle>
                <CardDescription className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">
                  Secure your account with a new pass
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              <form className="space-y-5" onSubmit={onSubmit}>
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1"
                  >
                    New Password
                  </Label>
                  <div className="relative group/input">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within/input:text-primary transition-colors">
                      <Lock className="size-4" />
                    </div>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="bg-zinc-900/50 border-zinc-800 text-white h-12 rounded-xl focus-visible:ring-primary/20 pr-10"
                      {...form.register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                  {form.formState.errors.password ? (
                    <p className="text-[11px] text-red-400 ml-1">
                      {form.formState.errors.password.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1"
                  >
                    Confirm Password
                  </Label>
                  <div className="relative group/input">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within/input:text-primary transition-colors">
                      <Lock className="size-4" />
                    </div>
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="bg-zinc-900/50 border-zinc-800 text-white h-12 rounded-xl focus-visible:ring-primary/20 pr-10"
                      {...form.register("confirmPassword")}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                  {form.formState.errors.confirmPassword ? (
                    <p className="text-[11px] text-red-400 ml-1">
                      {form.formState.errors.confirmPassword.message}
                    </p>
                  ) : null}
                </div>

                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="w-full h-12 text-sm font-black uppercase tracking-widest bg-primary text-black hover:bg-primary/90 rounded-xl gap-2 group mt-2 transition-all"
                >
                  {form.formState.isSubmitting
                    ? "Resetting..."
                    : "Reset Password"}
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
            <div className="space-y-2 max-w-70 mx-auto">
              <h2 className="text-2xl font-black text-white uppercase italic">
                Password Set
              </h2>
              <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                Your password has been successfully updated.
              </p>
            </div>
            <Button
              asChild
              className="bg-primary text-black hover:bg-primary/90 rounded-xl font-black uppercase tracking-widest px-8 h-12 w-full shadow-[0_0_20px_rgba(191,255,0,0.2)]"
            >
              <Link href={ROUTES.auth.signIn}>Go to Sign In</Link>
            </Button>
          </CardContent>
        )}

        <CardFooter className="flex flex-center justify-center pb-8 pt-4">
          <div className="flex items-center gap-2 opacity-50">
            <ShieldCheck className="size-3 text-zinc-500" />
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
              Secured by Protocol
            </span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
