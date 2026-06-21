import type { SessionUser } from "./session";
import type { UserRole } from "@/lib/db/schema";

const ROLE_HIERARCHY: Record<UserRole, number> = {
  platform_admin: 100,
  company_admin: 80,
  sv: 60,
  store_manager: 40,
  inspector: 20,
};

export function hasRole(user: SessionUser, ...roles: UserRole[]): boolean {
  return roles.includes(user.role);
}

export function hasMinRole(user: SessionUser, minRole: UserRole): boolean {
  return ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[minRole];
}

export function canManageCompany(user: SessionUser): boolean {
  return hasRole(user, "platform_admin", "company_admin");
}

export function canApproveCases(user: SessionUser): boolean {
  return hasRole(user, "platform_admin", "company_admin", "sv");
}

export function canInspect(user: SessionUser): boolean {
  return hasRole(user, "platform_admin", "company_admin", "sv", "inspector");
}

export function canManageStoreCase(
  user: SessionUser,
  storeId: string,
  assignedStoreIds: string[]
): boolean {
  if (canManageCompany(user) || hasRole(user, "sv")) return true;
  return assignedStoreIds.includes(storeId);
}
