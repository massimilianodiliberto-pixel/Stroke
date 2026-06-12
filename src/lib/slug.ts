export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function importKeyFor(brandName: string, productName: string): string {
  return `${slugify(brandName)}::${slugify(productName)}`;
}
