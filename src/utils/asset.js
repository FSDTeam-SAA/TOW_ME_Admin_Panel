/**
 * Resolve a file in public/ against the app's base path.
 *
 * The panel is served from a sub-path (/admin/), so absolute "/assets/…" URLs
 * would resolve against the domain root and 404.
 */
export const asset = (path) =>
  `${import.meta.env.BASE_URL}${String(path).replace(/^\/+/, '')}`
