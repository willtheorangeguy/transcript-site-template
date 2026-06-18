# CLAUDE.md

## Project Overview

Astro-based static site template for podcast transcript/summary websites. Generates pure HTML/CSS/JS with full-text search via Pagefind. Designed to be cloned into a `web/` subfolder alongside year-based content folders.

## Tech Stack

- **Framework:** Astro 6 with TypeScript (strict mode)
- **Markdown:** marked
- **Search:** Pagefind (indexed at build time)
- **Tests:** Vitest
- **Node:** ≥22.12.0
- **Module system:** ES modules (`"type": "module"`)

## Commands

```bash
npm run dev        # Start dev server
npm run build      # Build site + run pagefind indexing
npm run preview    # Preview production build
npm test           # Run tests once
npm run test:watch # Run tests in watch mode
```

## Project Structure

```
src/
  pages/           # Astro page routes (index, episodes/index, episodes/[slug], search)
  components/      # Reusable UI (BaseLayout, EpisodeCard, EpisodeTabs, Search, YearGroup)
  layouts/         # BaseLayout with header/footer/nav
  utils/           # Business logic
    content.ts     # Loads episodes from ../YYYY/ folders
    episodes.ts    # Filename parsing, slug generation, grouping
    youtube.ts     # YouTube API integration with fuzzy matching
    url.ts         # Base path helpers for GitHub Pages subpath deploys
  styles/
    global.css     # Base styles and layout utilities
    theme.css      # CSS custom properties (theming)
  utils/__tests__/ # Unit tests
scripts/
  fetch-youtube.mjs # One-time YouTube video cache fetcher
public/            # Static assets (favicons)
podcast.config.ts  # Site configuration (theme, social links, features)
```

## Content Loading

Episodes are loaded from sibling `../YYYY/` directories (outside this repo). File naming:
- `{date} - {title}_transcript.md` (raw transcript)
- `{date} - {title}_transcript_corrected.md` (corrected variant)
- `{date} - {title}_summary.txt` (raw summary)
- `{date} - {title}_summary_corrected.txt` (corrected variant)

Both `.md` and `.txt` extensions supported. An episode needs at least one transcript + one summary.

## CI

- **ci.yaml:** Runs `npm test` and `npm run build` on PRs and main pushes (Node 22)
- **deploy.yaml:** Deploys to GitHub Pages on main push

## Key Conventions

- No linter/formatter configured — follow existing code style
- Astro components use `.astro` extension; utilities are `.ts`
- Static output only (no SSR)
- Site/base path configurable via `SITE` and `BASE_PATH` env vars for GitHub Pages
- CSS theming via custom properties in `theme.css`
- Interactive state (tabs) managed via URL hashes, no client-side framework
