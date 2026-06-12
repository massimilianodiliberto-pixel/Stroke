"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { transitionOrder } from "@/lib/orders";
import { db } from "@/lib/db";

export async function confirmOrder(orderId: string) {
  await requireAdmin();
  try {
    await transitionOrder(orderId, "CONFIRMED");
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Errore" };
  }
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  return { ok: true };
}

export async function cancelOrder(orderId: string) {
  await requireAdmin();
  try {
    await transitionOrder(orderId, "CANCELLED");
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Errore" };
  }
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  return { ok: true };
}

export async function saveAdminNote(orderId: string, note: string) {
  await requireAdmin();
  await db.order.update({
    where: { id: orderId },
    data: { adminNote: note.slice(0, 2000) },
  });
  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true };
}
