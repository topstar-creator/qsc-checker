import { BottomNav } from "@/components/layout/bottom-nav";
import { RoleProvider } from "@/components/layout/role-context";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/auth/sign-in");

  return (
    <RoleProvider initialRole={session.role} userName={session.name}>
      <div className="app-frame">
        <main className="app-main">{children}</main>
        <BottomNav />
      </div>
    </RoleProvider>
  );
}
