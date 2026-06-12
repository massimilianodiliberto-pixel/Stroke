export function formatPrice(cents: number, locale: string = "it") {
  return new Intl.NumberFormat(locale === "it" ? "it-IT" : "en-GB", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

/** Converte "39,90" / "39.90" / 39.9 in centesimi interi. */
export function parseEuroToCents(value: string | number): number | null {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return null;
    return Math.round(value * 100);
  }
  const cleaned = value
    .replace(/€/g, "")
    .replace(/\s/g, "")
    .replace(/\.(?=\d{3}(\D|$))/g, "") // separatore migliaia all'italiana
    .replace(",", ".");
  if (!cleaned) return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100);
}
