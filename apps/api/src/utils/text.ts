/** Lower-cases text, drops apostrophes ("men's" → "mens") and splits it into words of letters and digits. */
export function toWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/['’]/g, '')
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

/** A URL-friendly name: "men's clothing" → "mens-clothing". */
export function slugify(text: string): string {
  return toWords(text).join('-');
}
