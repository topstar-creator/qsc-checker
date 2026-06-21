export type UserRole =
  | "platform_admin"
  | "company_admin"
  | "sv"
  | "store_manager"
  | "inspector";

export type CaseStatus =
  | "pending"
  | "in_progress"
  | "reported"
  | "rejected"
  | "done";

export type RankingType = "store" | "group" | "improvement";
export type RankingPeriod = "1m" | "3m" | "6m" | "1y";

export const ROLE_LABELS: Record<UserRole, string> = {
  company_admin: "会社管理者",
  sv: "SV",
  store_manager: "店長",
  inspector: "調査員",
  platform_admin: "システム管理者",
};

export interface DemoUser {
  role: UserRole;
  userName: string;
}

export const DEMO_USERS: DemoUser[] = [
  { role: "company_admin", userName: "田中 太郎" },
  { role: "sv", userName: "佐藤 花子" },
  { role: "store_manager", userName: "鈴木 一郎" },
  { role: "inspector", userName: "高橋 調査" },
];

export function getInitial(name: string) {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0) : "?";
}
