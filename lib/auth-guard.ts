import { auth } from "@/auth";
import { redirect } from "next/navigation";

// Call this at the top of every admin page to protect it
export async function requireAdmin() {
  const session = await auth();

  if (session?.user?.role !== "admin") {
    redirect("/unauthorized");
  }

  return session;
}
