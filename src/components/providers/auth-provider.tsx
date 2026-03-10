"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/routes";
import {
  authPost,
  fetchWithRefresh,
  fetchCsrfToken,
} from "@/lib/client/auth-api";

type Role = "user" | "admin";

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  bio?: string;
  profileImage?: string | null;
  isReadOnly?: boolean;
  isBanned?: boolean;
}

interface AuthContextType {
  role: Role;
  setRole: (role: Role) => void;
  isAdmin: boolean;
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<Role>("user");
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // hydrate from localStorage to avoid avatar flicker on refresh
  useEffect(() => {
    const cached = localStorage.getItem("cv_auth_user");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setUserState(parsed);
        if (parsed.role?.toLowerCase() === "admin") setRole("admin");
      } catch {
        // ignore bad cache
      }
    }
  }, []);

  const setUser = (value: User | null) => {
    setUserState(value);
    if (value) {
      localStorage.setItem("cv_auth_user", JSON.stringify(value));
    } else {
      localStorage.removeItem("cv_auth_user");
    }
  };

  useEffect(() => {
    let refreshInterval: NodeJS.Timeout;

    const initAuth = async () => {
      try {
        const res = await fetchWithRefresh("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          const normalizedRole =
            typeof data.user.role === "string" && data.user.role.toLowerCase() === "admin"
              ? "admin"
              : "user";

          const avatar = data.user.profileImage || data.user.avatar || "";

          setUser({
            ...data.user,
            id: data.user.id,
            role: data.user.role,
            avatar,
            profileImage: data.user.profileImage,
            bio: data.user.bio,
            isReadOnly: data.user.isReadOnly,
            isBanned: data.user.isBanned,
          });
          setRole(normalizedRole);

          // Start proactive refresh interval (every 10 minutes)
          refreshInterval = setInterval(
            async () => {
              try {
                await fetch("/api/auth/refresh-token", {
                  method: "POST",
                  credentials: "include",
                  headers: {
                    "x-csrf-token": await fetchCsrfToken().catch(() => ""),
                  },
                });
              } catch (err) {
                console.error("Proactive refresh failed", err);
              }
            },
            10 * 60 * 1000,
          ); // 10 minutes
        }
      } catch (err) {
        console.error("Auth init failed", err);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();

    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, []);

  const signOut = async () => {
    try {
      await authPost("/api/auth/logout", {});
      setUser(null);
      setRole("user");
      router.push(ROUTES.auth.signIn);
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  const isAdmin = role === "admin";

  return (
    <AuthContext.Provider
      value={{ role, setRole, isAdmin, user, setUser, isLoading, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
