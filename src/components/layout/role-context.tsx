"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { DemoUser, UserRole } from "@/lib/types";

interface RoleContextValue {
  role: UserRole;
  userName: string;
  setDevUser: (user: DemoUser) => void;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({
  children,
  initialRole = "company_admin",
  userName: initialUserName = "田中 太郎",
}: {
  children: ReactNode;
  initialRole?: UserRole;
  userName?: string;
}) {
  const [role, setRole] = useState<UserRole>(initialRole);
  const [userName, setUserName] = useState(initialUserName);

  const value = useMemo<RoleContextValue>(
    () => ({
      role,
      userName,
      setDevUser: (user: DemoUser) => {
        setRole(user.role);
        setUserName(user.userName);
      },
    }),
    [role, userName]
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}

// Re-export shared types/helpers for convenience
export {
  DEMO_USERS,
  ROLE_LABELS,
  getInitial,
  type DemoUser,
  type UserRole,
} from "@/lib/types";
