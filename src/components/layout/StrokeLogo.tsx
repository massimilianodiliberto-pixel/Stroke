/* Il logo Stroke ricreato in CSS: scritta minuscola arrotondata sui
   4 blocchi colorati, come l'etichetta cucita sui capi del negozio. */
export function StrokeLogo({
  size = "md",
  tagline = false,
}: {
  size?: "sm" | "md";
  tagline?: boolean;
}) {
  const textSize = size === "sm" ? "text-xl px-2 pb-0.5" : "text-2xl px-2.5 pb-1";

  return (
    <span className="inline-flex items-center gap-3">
      <span className={`stroke-blocks inline-block border border-paper/60 ${textSize}`}>
        <span className="wordmark text-ink">stroke</span>
      </span>
      {tagline && (
        <span className="hidden text-[9px] uppercase tracking-[0.3em] text-paper-dim sm:block">
          streetwear
          <br />
          &amp; boards shop
        </span>
      )}
    </span>
  );
}
