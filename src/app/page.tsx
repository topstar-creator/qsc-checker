import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export default async function Page() {
  const session = await getSession();
  redirect(session ? "/home" : "/auth/sign-in");
}
