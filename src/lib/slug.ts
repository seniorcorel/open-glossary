/**
 * Generate a URL-safe slug from a term.
 * "Spendere e spandere" → "spendere-e-spandere"
 * "Arrampicatore sociale" → "arrampicatore-sociale"
 */
export function toSlug(term: string): string {
  return term
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9\s-]/g, "")   // remove special chars
    .trim()
    .replace(/\s+/g, "-")           // spaces to dashes
    .replace(/-+/g, "-");           // collapse multiple dashes
}
