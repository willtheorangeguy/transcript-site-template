# Podcast Template — Deployment

The output is static — HTML, CSS, JavaScript, and the Pagefind index — so anything that serves
files works.

## GitHub Pages, from your transcript repository

The intended setup: one repository holding the year folders **and** this template in `web/`.

1. Repository settings → **Pages → Source → GitHub Actions**.
2. Copy
   [`.github/workflows/deploy-transcript-repo.yml.example`](../.github/workflows/deploy-transcript-repo.yml.example)
   into your repository as `.github/workflows/deploy.yaml`, dropping the `.example` suffix.
3. Push to `main`.

That workflow builds from `web/`, uploads `web/dist`, and passes the Pages `SITE` and `BASE_PATH`
values into the build.

> **Do not copy this repository's own `deploy.yaml`.** It builds the template standalone from the
> repository root, to preview the empty template. It is not the one you want, and the two are
> easy to confuse — they differ by which directory they build from.

### Project subpaths work without a custom domain

A project page is served from `https://<user>.github.io/<repo>/`, which breaks every root-relative
link in a naive static site. The workflow supplies `BASE_PATH`, `astro.config.mjs` reads it into
Astro's `base`, and every internal link, asset, favicon, and the Pagefind index go through
`withBase()` in `src/utils/url.ts`.

A user or organisation page, or a custom domain served at the root, also works with no changes —
`withBase()` handles a base of `/` correctly.

## Netlify and Vercel

Connect the repository and set:

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Output directory | `dist` |

If the template is in `web/`, set the base or root directory to `web` as well.

## Anything else

`npm run build` writes `dist/`. Copy it to any static host. Nothing needs a server, and there is
no runtime configuration — `SITE` and `BASE_PATH` are baked in at build time, so a site built for
one base path cannot be moved to another without rebuilding.

## YouTube data in CI

If `youtubeChannelId` is set, the build wants YouTube metadata. Two options:

- **Commit the cache.** Run `npm run fetch-youtube` locally once with `YOUTUBE_API_KEY` set and
  commit `.youtube-cache.json`. Builds then need no key. Note the file is not gitignored, so this
  is the path of least resistance either way.
- **Give CI the key.** Add `YOUTUBE_API_KEY` as a repository secret and pass it to the build
  step. Every build then spends quota.

With neither, the build logs a warning and produces a site without video links or thumbnails.
That is a warning, not an error — worth knowing, because a missing key does not fail the build.

## Search

Pagefind runs as part of `npm run build` (`astro build && npx pagefind --site dist`), so the
index is inside `dist/` and deploys with everything else. Running `astro build` alone leaves
`/search` broken.
