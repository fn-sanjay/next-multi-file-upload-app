"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/providers/auth-provider";

interface RoleSyncProps {
  role: "user" | "admin";
}

export function RoleSync({ role }: RoleSyncProps) {
  const { setRole } = useAuth();

  useEffect(() => {
    setRole(role);
  }, [role, setRole]);

  return null;
}
