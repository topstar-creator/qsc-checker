import { test, expect } from "@playwright/test";

test("sign in page loads", async ({ page }) => {
  await page.goto("/auth/sign-in");
  await expect(page.getByText("QSC Checker")).toBeVisible();
  await expect(page.getByRole("button", { name: "ログイン" })).toBeVisible();
});

test("home page after login", async ({ page }) => {
  await page.goto("/auth/sign-in");
  await page.getByLabel("メールアドレス").fill("admin@example.com");
  await page.getByLabel("パスワード").fill("admin123");
  await page.getByRole("button", { name: "ログイン" }).click();
  await expect(page).toHaveURL(/\/home/);
  await expect(page.getByText("QSC ランキング")).toBeVisible();
});
