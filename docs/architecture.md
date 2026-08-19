# Podcast Template — Architecture

Astro in static mode with TypeScript in strict mode. No client-side framework, no SSR. The
interesting part is the content pipeline, which runs entirely at build time.

```
../YYYY/*.{md,txt}
        |
        v
  content.ts ── episodes.ts (parse filenames, pair variants, slugify)
        |     ── youtube.ts  (cache or API, fuzzy match to episodes)
        v
   Episode[]  ──►  Astro pages  ──►  dist/  ──►  pagefind --site dist
```

## Layout

```
src/
├── pages/          index, episodes/index, episodes/[slug], search
├── components/     BaseLayout, EpisodeCard, EpisodeTabs, Search, YearGroup
├── layouts/        BaseLayout — header, footer, nav
├── utils/
│   ├── content.ts  loads episodes from ../YYYY/
│   ├── episodes.ts filename parsing, slugs, grouping
│   ├── youtube.ts  YouTube API and fuzzy matching
│   └── url.ts      base-path helpers
└── styles/         global.css, theme.css
scripts/
└── fetch-youtube.mjs   one-off cache fetcher
podcast.config.ts
```

## Content discovery

`loadAllEpisodes()` in `content.ts`:

1. Optionally load YouTube videos — from `.youtube-cache.json` if present, otherwise from the API
   if a key is set, otherwise not at all.
2. Read `..` and keep directories matching `/^\d{4}$/`. Anything else is ignored.
3. For each file in each year folder, run `parseEpisodeFilename`, which returns the base title,
   type, variant, and format, or nothing.
4. Group parsed files by `{year}/{baseTitle}`.
5. For each group, pick the best file per type and variant — markdown over text — and require at
   least one transcript and one summary. Groups failing that are skipped with a warning.
6. Derive title, date, and slug, then attach a YouTube match if one is found.

The grouping key is the base title, so the pairing between raw and corrected is by filename and
nothing else. Rename one half and the episode splits in two — each then missing a counterpart,
and both skipped.

## The `..` constant

```ts
const CONTENT_DIR = '..';
```

This is the design: the template is a subfolder of the content repository. It is also the one
thing that cannot be configured, and it means the template cannot be developed against sample
content inside its own repository — running it here finds the repository's own parent directory,
whatever that happens to be.

Note that `fs.existsSync('..')` is essentially always true, so the "content directory not found"
guard never fires. The real empty case — no four-digit folders — produces zero episodes with no
message at all. See [`internal/known-issues.md`](./internal/known-issues.md).

## YouTube matching

`matchVideoToEpisode` compares the episode title and date against the channel's uploads using
fuzzy matching. One video per episode; no match leaves the episode without a link or thumbnail,
which renders fine.

The cache is the important part: `fetchChannelVideos` pages through the uploads playlist 50 at a
time, which is a lot of quota to spend on every build. `.youtube-cache.json` makes it a one-off.

## Rendering

Episodes become pages under `/episodes/[slug]`, grouped by year on `/episodes`, with the newest
`latestEpisodesCount` on the homepage. `marked` renders markdown. The transcript/summary and
raw/corrected toggles are URL hashes read by a small script — no framework, and every tab state
is linkable.

## Search

Pagefind indexes `dist` after `astro build`, as part of `npm run build`. It is a static index
served alongside the site, so search needs no backend and no request to anything.

## Base paths

`withBase()` in `url.ts` joins `import.meta.env.BASE_URL` with an app path, handling both `/` and
`/repo` without doubling slashes. Every internal link uses it. That is what makes a project-page
deploy work without a custom domain — see [Deployment](./deployment.md).

## Tests

Vitest, over `src/utils/`: `content.test.ts`, `episodes.test.ts`, and `youtube.test.ts` — 667
lines of test against 578 lines of utility code. The filename parsing and pairing rules are the
part most worth testing, and they are the part tested.

Nothing tests the Astro components; there is no linter or formatter configured.
