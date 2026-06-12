export function BrandMarquee({ brands }: { brands: string[] }) {
  if (brands.length === 0) return null;
  const list = [...brands, ...brands];

  return (
    <div className="overflow-hidden border-y border-paper/10 bg-ink-2 py-5">
      <div className="marquee-track flex w-max items-center gap-12 whitespace-nowrap">
        {list.map((brand, i) => (
          <span
            key={`${brand}-${i}`}
            className="display text-2xl text-paper/40 transition-colors hover:text-acid sm:text-3xl"
          >
            {brand}
            <span className="ml-12 text-stroke-orange">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
