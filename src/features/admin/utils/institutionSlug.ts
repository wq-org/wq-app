export function replaceGermanUmlauts(input: string): string {
  return input
    .replace(/Ä/g, 'Ae')
    .replace(/Ö/g, 'Oe')
    .replace(/Ü/g, 'Ue')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
}

/** URL-safe slug from an institution display name (umlauts → ae/oe/ue/ss, then kebab-case). */
export function slugifyInstitutionName(input: string): string {
  return replaceGermanUmlauts(input)
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}
