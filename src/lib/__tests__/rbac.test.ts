import { describe, it, expect } from "vitest";
import { hasRole, canManageCompany, canApproveCases } from "@/lib/auth/rbac";
import type { SessionUser } from "@/lib/auth/session";

const admin: SessionUser = {
  id: "1",
  email: "a@test.com",
  name: "Admin",
  role: "company_admin",
  companyId: "c1",
};

const sv: SessionUser = { ...admin, role: "sv", id: "2" };
const manager: SessionUser = { ...admin, role: "store_manager", id: "3" };

describe("RBAC", () => {
  it("company admin can manage company", () => {
    expect(canManageCompany(admin)).toBe(true);
    expect(canManageCompany(sv)).toBe(false);
  });

  it("SV can approve cases", () => {
    expect(canApproveCases(sv)).toBe(true);
    expect(canApproveCases(manager)).toBe(false);
  });

  it("hasRole checks correctly", () => {
    expect(hasRole(admin, "company_admin")).toBe(true);
    expect(hasRole(manager, "company_admin")).toBe(false);
  });
});

describe("Ranking calculations", () => {
  it("improvement rate formula", () => {
    const prior = 88;
    const recent = 92;
    const rate = ((recent - prior) / prior) * 100;
    expect(rate).toBeCloseTo(4.545, 1);
  });
});
