"use server";

import { redirect } from "next/navigation";
import { timingSafeEqual } from "crypto";
import { env } from "@/env";
import { getSession } from "@/lib/auth";

function safeEquals(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export async function login(_prev: { error?: string } | undefined, formData: FormData) {
  const user = String(formData.get("user") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!safeEquals(user, env.ADMIN_USER) || !safeEquals(password, env.ADMIN_PASSWORD)) {
    return { error: "Credenziali non valide" };
  }

  const session = await getSession();
  session.isAdmin = true;
  await session.save();
  redirect("/admin");
}

export async function logout() {
  const session = await getSession();
  session.destroy();
  redirect("/admin/login");
}
