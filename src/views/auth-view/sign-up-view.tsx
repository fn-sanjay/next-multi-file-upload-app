"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
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
import { Mail, Lock, User, MoveRight, Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaCube } from "react-icons/fa";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { ROUTES } from "@/routes";
import { authPost } from "@/lib/client/auth-api";
import { signUpSchema, type SignUpFormValues } from "@/lib/validations/auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CheckCircle2, ShieldCheck, Zap, Vault } from "lucide-react";

export const SignUpView = () => {
  const router = useRouter();
  const [isCreated, setIsCreated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      terms: false,
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await authPost<{ user: { id: string } }>("/api/auth/signup", {
        name: `${values.firstName} ${values.lastName}`.trim(),
        email: values.email,
        password: values.password,
      });

      setIsCreated(true);
      toast.success("Account created successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sign up failed");
    }
  });

  const isSubmitting = form.formState.isSubmitting;

  return (
    <div className="w-full">
      <Card className="bg-card border-zinc-800 shadow-2xl overflow-hidden relative group">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-primary to-transparent opacity-50" />
        <div className="absolute -top-24 -left-24 size-48 bg-primary/10 blur-[100px] rounded-full" />

        {!isCreated ? (
          <>
            <CardHeader className="space-y-4 text-center pb-8 relative">
              <div className="flex justify-center">
                <div className="bg-primary p-3 rounded-2xl shadow-[0_0_30px_rgba(191,255,0,0.2)]">
                  <FaCube className="size-8 text-black" />
                </div>
              </div>
              <div className="space-y-1">
                <CardTitle className="text-4xl font-black tracking-tighter text-white flex items-baseline justify-center">
                  Cloudvalut
                  <span className="text-primary text-6xl ml-px">.</span>
                </CardTitle>
                <CardDescription className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">
                  Start managing files without limits
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-5 relative">
              <form className="space-y-4" onSubmit={onSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="firstName"
                      className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1"
                    >
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      className="bg-zinc-900/50 border-zinc-800 text-white h-11 rounded-xl focus-visible:ring-primary/20"
                      {...form.register("firstName")}
                    />
                    {form.formState.errors.firstName ? (
                      <p className="text-[11px] text-red-400 ml-1">
                        {form.formState.errors.firstName.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="lastName"
                      className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1"
                    >
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      className="bg-zinc-900/50 border-zinc-800 text-white h-11 rounded-xl focus-visible:ring-primary/20"
                      {...form.register("lastName")}
                    />
                    {form.formState.errors.lastName ? (
                      <p className="text-[11px] text-red-400 ml-1">
                        {form.formState.errors.lastName.message}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1"
                  >
                    Work Email
                  </Label>
                  <div className="relative group/input">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within/input:text-primary transition-colors">
                      <Mail className="size-4" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@company.com"
                      className="bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-700 pl-10 h-11 rounded-xl focus-visible:ring-primary/20"
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
                  <Label
                    htmlFor="password"
                    className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1"
                  >
                    Create Password
                  </Label>
                  <div className="relative group/input">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within/input:text-primary transition-colors">
                      <Lock className="size-4" />
                    </div>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-700 pl-10 pr-10 h-11 rounded-xl focus-visible:ring-primary/20"
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

                <div className="flex items-center gap-2 pt-1 ml-1 group/terms">
                  <Controller
                    control={form.control}
                    name="terms"
                    render={({ field }) => (
                      <Checkbox
                        id="terms"
                        className="border-zinc-800 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        checked={field.value}
                        onCheckedChange={(checked) =>
                          field.onChange(checked === true)
                        }
                      />
                    )}
                  />
                  <div className="text-[10px] leading-none text-zinc-500 font-bold select-none cursor-pointer">
                    I AGREE TO THE{" "}
                    <Dialog>
                      <DialogTrigger asChild>
                        <span className="text-primary hover:underline cursor-pointer">
                          TERMS OF SERVICE
                        </span>
                      </DialogTrigger>
                      <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-400">
                        <DialogHeader>
                          <DialogTitle className="text-white uppercase italic font-black">
                            Terms of Service
                          </DialogTitle>
                          <DialogDescription className="text-zinc-500">
                            Please read our terms of service carefully.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 text-xs leading-relaxed max-h-[40vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
                          <p>
                            1. Acceptance of Terms: By creating an account, you
                            agree to be bound by these terms.
                          </p>
                          <p>
                            2. Description of Service: We provide a multi-file
                            upload and management platform.
                          </p>
                          <p>
                            3. User Conduct: You agree not to upload illegal or
                            harmful content.
                          </p>
                          <p>
                            4. Privacy: Your use of the service is also governed
                            by our Privacy Policy.
                          </p>
                          <p>
                            5. Termination: We reserve the right to terminate
                            accounts that violate these terms.
                          </p>
                        </div>
                      </DialogContent>
                    </Dialog>{" "}
                    AND{" "}
                    <Dialog>
                      <DialogTrigger asChild>
                        <span className="text-primary hover:underline cursor-pointer">
                          PRIVACY POLICY
                        </span>
                      </DialogTrigger>
                      <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-400">
                        <DialogHeader>
                          <DialogTitle className="text-white uppercase italic font-black">
                            Privacy Policy
                          </DialogTitle>
                          <DialogDescription className="text-zinc-500">
                            How we handle your data.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 text-xs leading-relaxed max-h-[40vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
                          <p>
                            1. Data Collection: We collect information you
                            provide when creating an account.
                          </p>
                          <p>
                            2. Use of Data: We use your data to provide and
                            improve our services.
                          </p>
                          <p>
                            3. Data Sharing: We do not sell your personal data
                            to third parties.
                          </p>
                          <p>
                            4. Security: We implement industry-standard security
                            measures to protect your data.
                          </p>
                          <p>
                            5. Your Rights: You have the right to access and
                            delete your personal data.
                          </p>
                        </div>
                      </DialogContent>
                    </Dialog>
                    .
                  </div>
                </div>
                {form.formState.errors.terms ? (
                  <p className="text-[11px] text-red-400 ml-1">
                    {form.formState.errors.terms.message}
                  </p>
                ) : null}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 text-sm font-black uppercase tracking-widest bg-primary text-black hover:bg-primary/90 rounded-xl gap-2 group mt-2 shadow-[0_0_20px_rgba(191,255,0,0.1)] hover:shadow-[0_0_25px_rgba(191,255,0,0.2)]"
                >
                  {isSubmitting ? "Creating..." : "Get Started"}
                  <MoveRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full bg-zinc-900" />
                </div>
                <div className="relative flex justify-center text-[9px] uppercase font-black tracking-[0.2em]">
                  <span className="bg-card px-3 text-zinc-600">
                    Or join with
                  </span>
                </div>
              </div>

              <Button
                asChild
                variant="outline"
                className="w-full h-11 border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:text-white rounded-xl font-bold gap-2 text-[10px] uppercase tracking-wider transition-all hover:bg-zinc-900"
              >
                <a href="/api/auth/google">
                  <FcGoogle className="size-4" />
                  Google
                </a>
              </Button>
            </CardContent>

            <CardFooter className="flex flex-col items-center pb-8 pt-4 gap-6">
              <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider">
                Already a member?{" "}
                <Link
                  href={ROUTES.auth.signIn}
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  Sign In
                </Link>
              </p>

              <div className="flex items-center justify-center gap-6 opacity-50">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-zinc-700" />
                  <span className="text-[10px] text-zinc-700 font-black uppercase tracking-widest">
                    End-to-end Encrypted
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
                Check Email
              </h2>
              <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                We&apos;ve sent a verification link to your email address.
                Please check your inbox.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="border-zinc-800 text-zinc-400 hover:text-white rounded-xl font-bold gap-2 text-[10px] uppercase tracking-widest px-8"
                onClick={() => setIsCreated(false)}
              >
                Go Back
              </Button>
              <Button
                asChild
                variant="link"
                className="text-zinc-500 hover:text-primary text-[10px] uppercase font-bold tracking-widest"
              >
                <Link href={ROUTES.auth.signIn}>Go to Sign In</Link>
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};
