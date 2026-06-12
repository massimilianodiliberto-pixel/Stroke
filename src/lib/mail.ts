import type { Order, OrderItem } from "@prisma/client";
import { env } from "@/env";
import { formatPrice } from "./money";

type OrderWithItems = Order & { items: OrderItem[] };

function itemLines(order: OrderWithItems) {
  return order.items
    .map((i) => `- ${i.brandName} ${i.productName} (${i.size}) × ${i.quantity} — ${formatPrice(i.priceCents * i.quantity, order.locale)}`)
    .join("\n");
}

const SUBJECTS: Record<string, { it: string; en: string }> = {
  PENDING_REVIEW: {
    it: "Abbiamo ricevuto la tua prenotazione",
    en: "We received your reservation",
  },
  CONFIRMED: { it: "Ordine confermato!", en: "Order confirmed!" },
  CANCELLED: { it: "Ordine annullato", en: "Order cancelled" },
};

function customerBody(order: OrderWithItems) {
  const it = order.locale === "it";
  const head =
    order.status === "PENDING_REVIEW"
      ? it
        ? "Grazie! Il tuo ordine è una prenotazione: verifichiamo che i capi siano ancora disponibili in negozio e ti confermiamo entro 24/48 ore. Nessun importo viene incassato prima della conferma."
        : "Thanks! Your order is a reservation: we check that the items are still available in store and confirm within 24/48 hours. Nothing is charged before confirmation."
      : order.status === "CONFIRMED"
        ? it
          ? "Il tuo ordine è confermato. Prepariamo i capi e ti contattiamo per la spedizione o il ritiro in negozio."
          : "Your order is confirmed. We are preparing your items and will contact you about shipping or in-store pickup."
        : it
          ? "Purtroppo abbiamo dovuto annullare il tuo ordine: uno o più capi non sono più disponibili. Se c'era un pagamento, l'autorizzazione è stata rilasciata."
          : "Unfortunately we had to cancel your order: one or more items are no longer available. If a payment hold was placed, it has been released.";

  return `${head}

${it ? "Ordine" : "Order"} ${order.orderNumber}
${itemLines(order)}
${it ? "Totale" : "Total"}: ${formatPrice(order.totalCents, order.locale)}

Stroke Shop — Salò (BS), Lago di Garda
Instagram: @strokeshop`;
}

export async function sendOrderStatusEmails(order: OrderWithItems) {
  if (!env.EMAIL_ENABLED) return;
  const subject = SUBJECTS[order.status];
  if (!subject) return;

  const { Resend } = await import("resend");
  const resend = new Resend(env.RESEND_API_KEY);

  await resend.emails.send({
    from: env.EMAIL_FROM,
    to: order.email,
    subject: `${subject[order.locale === "it" ? "it" : "en"]} — ${order.orderNumber}`,
    text: customerBody(order),
  });

  if (env.SHOP_NOTIFICATION_EMAIL && order.status === "PENDING_REVIEW") {
    await resend.emails.send({
      from: env.EMAIL_FROM,
      to: env.SHOP_NOTIFICATION_EMAIL,
      subject: `Nuova prenotazione ${order.orderNumber} — ${formatPrice(order.totalCents)}`,
      text: `Nuovo ordine da ${order.customerName} (${order.email})\n\n${itemLines(order)}\n\nTotale: ${formatPrice(order.totalCents)}\n\nVai su /admin/orders per confermare o annullare.`,
    });
  }
}
