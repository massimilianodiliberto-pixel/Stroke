import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { redirect } from "next/navigation";
import { sessionOptions, type SessionData } from "./session";

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session.isAdmin) redirect("/admin/login");
  return session;
}
