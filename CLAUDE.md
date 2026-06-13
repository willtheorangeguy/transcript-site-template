# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Dev server at localhost:4321
npm run build        # Production build + Pagefind search indexing
npm run preview      # Preview production build locally
npm test             # Run Vitest test suite
npm run test:watch   # Tests in watch mode
npm run fetch-youtube  # Fetch/refresh YouTube video metadata (requires YOUTUBE_API_KEY env var)
```

Run a single test file:
```bash
npx vitest run src/utils/__tests__/episodes.test.ts
```

There is no linter configured in this project.

## Architecture

This is an **Astro static site generator** for podcast websites. It reads markdown episode files from a **parent directory** at build time — the template itself lives in a `web/` subfolder of a larger podcast project.

### Content Directory Convention

Content lives **outside** this repo, one level up (`..`), in year-named folders:

```
your-podcast-project/
├── 2020/
│   ├── 2020-05-01 - Episode Title_transcript_corrected.md
│   └── 2020-05-01 - Episode Title_summary_corrected.md
├── 2024/
│   └── ...
└── web/   ← this repo
```

The constant `CONTENT_DIR = '..'` in `src/utils/content.ts` drives this. Episode files that don't match both `_transcript_corrected.md` and `_summary_corrected.md` suffixes (case-insensitive) are silently skipped. An episode requires **both** a transcript and summary file to appear on the site.

### Content Loading Pipeline

`src/utils/content.ts` → `loadAllEpisodes()` is the central entry point called at build time by every page:
1. Scans `../YYYY/` folders for files matching the naming convention
2. Groups files by base title to pair transcripts with summaries
3. Calls `parseTitleAndDate()` to extract date from the filename prefix (`YYYY-MM-DD - Title`)
4. Generates a URL slug via `createSlug()` — format: `YYYY-MM-DD-title-slug` (title truncated to 50 chars)
5. Optionally matches each episode to a YouTube video from `.youtube-cache.json`
6. Returns episodes sorted newest-first

### YouTube Integration

`src/utils/youtube.ts` — YouTube data is **pre-fetched and cached** in `.youtube-cache.json` (git-ignored). The `npm run fetch-youtube` script calls the YouTube Data API v3 and writes this cache. At build time, `loadAllEpisodes()` reads from the cache (never makes live API calls during build). Episode-to-video matching uses:
1. Jaccard word-level title similarity + date proximity (within 3 days)
2. Fallback: global title similarity > 0.5 threshold

### Routing

- `/` — Homepage: latest N episodes (configurable via `latestEpisodesCount` in `podcast.config.ts`)
- `/episodes` — Full archive grouped by year
- `/episodes/[slug]` — Episode detail with transcript/summary tabs (Pagefind-indexed)
- `/search` — Full-text search UI (Pagefind)

### Configuration

All site customization lives in `podcast.config.ts` at the root — podcast name, description, site URL, YouTube channel ID, homepage episode count, theme colors (mapped to CSS custom properties), social links, and extra nav links.

Theme CSS variables are in `src/styles/theme.css`. The config's `theme` object is injected into CSS custom properties at build time via `BaseLayout.astro`.

### Search

Pagefind runs as a post-build step (`npm run build` calls `astro build && pagefind --site dist`). The search index is built from the static HTML output — no server needed.

### Testing

Tests in `src/utils/__tests__/` cover the three utility modules. Tests use Node environment (no DOM). The content integration test in `content.test.ts` exercises real filesystem reads against mock directory structures using `tmp` directories.
