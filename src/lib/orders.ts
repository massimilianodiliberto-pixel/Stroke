import { OrderStatus, Prisma } from "@prisma/client";
import { customAlphabet } from "nanoid";
import { db } from "./db";
import { getStripe, isStripeEnabled } from "./stripe";
import { sendOrderStatusEmails } from "./mail";

const orderNumberId = customAlphabet("ABCDEFGHJKMNPQRSTUVWXYZ23456789", 6);

export function newOrderNumber() {
  return `STK-${orderNumberId()}`;
}

/** Transizioni ammesse: unica fonte di verità dello stato ordine. */
const ALLOWED: Record<OrderStatus, OrderStatus[]> = {
  AWAITING_PAYMENT: ["PENDING_REVIEW", "CANCELLED", "EXPIRED"],
  PENDING_REVIEW: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: [],
  CANCELLED: [],
  EXPIRED: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus) {
  return ALLOWED[from].includes(to);
}

/** Stati in cui lo stock è "riservato" e va ripristinato se l'ordine muore. */
const STOCK_HELD: OrderStatus[] = ["AWAITING_PAYMENT", "PENDING_REVIEW"];

async function restoreStock(tx: Prisma.TransactionClient, orderId: string) {
  const items = await tx.orderItem.findMany({ where: { orderId } });
  for (const item of items) {
    if (!item.variantId) continue;
    await tx.productVariant.update({
      where: { id: item.variantId },
      data: { quantity: { increment: item.quantity } },
    });
  }
}

export async function transitionOrder(orderId: string, to: OrderStatus) {
  const order = await db.order.findUniqueOrThrow({ where: { id: orderId } });
  if (!canTransition(order.status, to)) {
    throw new Error(`Transizione non valida: ${order.status} → ${to}`);
  }

  // Le chiamate Stripe avvengono prima della transazione DB: se falliscono
  // l'ordine resta nello stato precedente e l'admin può riprovare.
  if (order.paymentMode === "STRIPE" && order.stripePaymentIntentId && isStripeEnabled()) {
    const stripe = getStripe();
    if (to === "CONFIRMED") {
      await stripe.paymentIntents.capture(order.stripePaymentIntentId);
    } else if (to === "CANCELLED" && order.status === "PENDING_REVIEW") {
      await stripe.paymentIntents.cancel(order.stripePaymentIntentId);
    }
  }

  const updated = await db.$transaction(async (tx) => {
    if ((to === "CANCELLED" || to === "EXPIRED") && STOCK_HELD.includes(order.status)) {
      await restoreStock(tx, order.id);
    }
    return tx.order.update({
      where: { id: order.id },
      data: { status: to },
      include: { items: true },
    });
  });

  await sendOrderStatusEmails(updated).catch(() => {});
  return updated;
}

/**
 * Sweep "senza cron", chiamata dal loader della dashboard admin:
 * - AWAITING_PAYMENT più vecchi di 24h → EXPIRED (+ restock)
 * - ritorna i PENDING_REVIEW più vecchi di 6 giorni (l'autorizzazione Stripe
 *   scade a ~7) perché la dashboard li evidenzi.
 */
export async function sweepStaleOrders() {
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const stale = await db.order.findMany({
    where: { status: "AWAITING_PAYMENT", createdAt: { lt: dayAgo } },
    select: { id: true },
  });
  for (const { id } of stale) {
    await transitionOrder(id, "EXPIRED").catch(() => {});
  }

  const sixDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
  return db.order.findMany({
    where: { status: "PENDING_REVIEW", createdAt: { lt: sixDaysAgo } },
    orderBy: { createdAt: "asc" },
  });
}
