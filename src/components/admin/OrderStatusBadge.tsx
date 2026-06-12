import type { OrderStatus } from "@prisma/client";

const LABELS: Record<OrderStatus, { label: string; className: string }> = {
  AWAITING_PAYMENT: { label: "In pagamento", className: "bg-paper/20 text-paper" },
  PENDING_REVIEW: { label: "Da confermare", className: "bg-acid text-ink" },
  CONFIRMED: { label: "Confermato", className: "bg-green-500 text-ink" },
  CANCELLED: { label: "Annullato", className: "bg-danger text-ink" },
  EXPIRED: { label: "Scaduto", className: "bg-paper/10 text-paper-dim" },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { label, className } = LABELS[status];
  return (
    <span className={`px-2 py-1 text-xs font-bold uppercase tracking-wider ${className}`}>
      {label}
    </span>
  );
}
