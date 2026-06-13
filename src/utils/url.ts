/**
 * URL helpers for base-path-aware links.
 *
 * When the site is deployed to a GitHub Pages project subpath
 * (e.g. https://user.github.io/repo/), Astro's `base` is set to "/repo".
 * Internal links must include that prefix or they will 404. `withBase` joins
 * the configured base with an absolute app path, avoiding double slashes, and
 * works whether the base is "/" (root deploy) or "/repo" (subpath deploy).
 */

/** Astro normalizes `import.meta.env.BASE_URL` from the `base` config. */
const BASE_URL: string =
  typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL
    ? import.meta.env.BASE_URL
    : '/';

/**
 * Prefix an absolute app path (e.g. "/episodes") with the deploy base path.
 * @param path A root-relative path beginning with "/".
 */
export function withBase(path: string): string {
  const base = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
  const suffix = path.startsWith('/') ? path : `/${path}`;
  // For the site root, return the base itself (with a trailing slash).
  if (suffix === '/') {
    return `${base}/`;
  }
  return `${base}${suffix}`;
}
