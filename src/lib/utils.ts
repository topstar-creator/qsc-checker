import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | number | string): string {
  const d = typeof date === "number" ? new Date(date) : new Date(date);
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatMonth(date: Date): string {
  return date.toLocaleDateString("ja-JP", { month: "short" });
}

export function id() {
  return crypto.randomUUID();
}
