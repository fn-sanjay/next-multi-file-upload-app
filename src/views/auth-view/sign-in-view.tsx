"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FolderOpen,
  Mail,
  Lock,
  Eye,
  EyeOff,
  MoveRight,
  ShieldCheck,
  Zap,
  Vault,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { FcGoogle } from "react-icons/fc";
import { FaCube } from "react-icons/fa";
import Link from "next/link";
import { ROUTES } from "@/routes";
import { useAuth } from "@/components/providers/auth-provider";
import { useRouter, useSearchParams } from "next/navigation";
import { authPost } from "@/lib/client/auth-api";
import { signInSchema, type SignInFormValues } from "@/lib/validations/auth";

type LoginResponse = {
  user: {
    id: string;
    name: string | null;
    email: string;
    role: "USER" | "ADMIN";
  };
};

export const SignInView = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [bannedMessage, setBannedMessage] = useState<string | null>(null);
  const { setRole, setUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      setBannedMessage(null);
      await authPost("/api/auth/login", values);

      // Fetch real user
      const res = await fetch("/api/auth/me", {
        credentials: "include",
      });

      const data = await res.json();

      const user = data.user;

      const appRole = user.role === "ADMIN" ? "admin" : "user";

      setRole(appRole);

      setUser({
        id: user.id,
        name: user.name ?? user.email.split("@")[0],
        email: user.email,
        role: user.role,
        avatar: user.profileImage || user.avatar || "",
        profileImage: user.profileImage,
        bio: user.bio,
        isReadOnly: user.isReadOnly,
        isBanned: user.isBanned,
      });

      toast.success("Login successful");

      router.push(
        appRole === "admin"
          ? ROUTES.admin.dashboard
          : ROUTES.pages.myFiles
      );

    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Login failed";
      if (message.toLowerCase().includes("banned")) {
        setBannedMessage(message);
      } else {
        toast.error(message);
      }
    }
  });

  const isSubmitting = form.formState.isSubmitting;

  React.useEffect(() => {
    if (searchParams?.get("banned") === "1") {
      setBannedMessage("Your account has been banned. Contact support.");
    }
  }, [searchParams]);

  return (
    <div className="w-full">
      <Card className="bg-card border-zinc-800 shadow-2xl overflow-hidden relative group">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-primary to-transparent opacity-50" />
        <div className="absolute -top-24 -left-24 size-48 bg-primary/10 blur-[100px] rounded-full" />
        <div className="absolute -bottom-24 -right-24 size-48 bg-primary/5 blur-[100px] rounded-full" />

        <CardHeader className="space-y-4 text-center pb-8 relative">
          <div className="flex justify-center">
            <div className="bg-primary p-3 rounded-2xl shadow-[0_0_30px_rgba(191,255,0,0.3)]">
              <FaCube className="size-8 text-black" />
            </div>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-4xl font-black tracking-tighter text-white flex items-baseline justify-center">
              Cloudvalut<span className="text-primary text-6xl ml-px">.</span>
            </CardTitle>
            <CardDescription className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">
              Next-Gen Multi-File Management
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 relative">
          {bannedMessage && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-rose-200">
              <p className="text-[10px] font-black uppercase tracking-widest text-rose-300">
                Account Banned
              </p>
              <p className="mt-2 text-sm font-medium">{bannedMessage}</p>
              <p className="mt-2 text-[11px] text-rose-300/80">
                If you believe this is a mistake, contact support.
              </p>
            </div>
          )}
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1"
              >
                Email Address
              </Label>
              <div className="relative group/input">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within/input:text-primary transition-colors">
                  <Mail className="size-4" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  className="bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-700 pl-10 h-12 rounded-xl focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
                  {...form.register("email")}
                />
              </div>
              {form.formState.errors.email ? (
                <p className="text-[11px] text-red-400 ml-1">
                  {form.formState.errors.email.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <Label
                  htmlFor="password"
                  className="text-[10px] font-black uppercase tracking-widest text-zinc-500"
                >
                  Password
                </Label>
                <Link
                  href={ROUTES.auth.forgotPassword}
                  className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative group/input">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within/input:text-primary transition-colors">
                  <Lock className="size-4" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-700 pl-10 pr-10 h-12 rounded-xl focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
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

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 text-sm font-black uppercase tracking-widest bg-primary text-black hover:bg-primary/90 rounded-xl gap-2 group mt-2 transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(191,255,0,0.15)] hover:shadow-[0_0_25px_rgba(191,255,0,0.25)]"
            >
              {isSubmitting ? "Signing In..." : "Sign In"}
              <MoveRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full bg-zinc-900" />
            </div>
            <div className="relative flex justify-center text-[9px] uppercase font-black tracking-[0.2em]">
              <span className="bg-card px-3 text-zinc-600">
                Or authorize with
              </span>
            </div>
          </div>

          <Button
            asChild
            variant="outline"
            className="w-full h-12 border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:text-white hover:bg-zinc-900 hover:border-zinc-700 rounded-xl font-bold gap-2 text-xs transition-all"
          >
            <a href="/api/auth/google">
              <FcGoogle className="size-4" />
              Google
            </a>
          </Button>
        </CardContent>

        <CardFooter className="flex flex-col items-center pb-8 pt-4 relative gap-6">
          <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider">
            New to Cloudvalut?{" "}
            <Link
              href={ROUTES.auth.signUp}
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Create Account
            </Link>
          </p>

          <div className="flex items-center justify-center gap-6 opacity-50">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-zinc-700" />
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
                Secured by Cloudvalut Protocol
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="size-4 text-zinc-700" />
              <span className="text-[10px] text-zinc-700 font-black uppercase tracking-widest">
                Multi-Threaded Sync
              </span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
