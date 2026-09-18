export function generateSlug(text: string): string {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\u0980-\u09FF-]/g, '') // Keep Bengali characters, alphanumeric, spaces, hyphens
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/-+/g, '-'); // Collapse consecutive hyphens

  const randomSuffix = Math.random().toString(36).substring(2, 7);
  return `${base || 'article'}-${randomSuffix}`;
}
