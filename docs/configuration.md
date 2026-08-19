# Podcast Template — Configuration

One file for almost everything, one CSS file for the rest, and two environment variables for
deployment.

## `podcast.config.ts`

Typed by the `PodcastConfig` interface in the same file, so a typo is a build error rather than a
silently ignored key.

| Field | Type | Effect |
|---|---|---|
| `name` | string | Header and page metadata |
| `description` | string | SEO description and homepage copy |
| `siteUrl` | string | Canonical URLs |
| `youtubeChannelId` | string, optional | Enables YouTube lookups — leave empty to skip entirely |
| `latestEpisodesCount` | number | Episodes shown on the homepage |
| `theme` | object | Seven colours, below |
| `social` | object | `youtube`, `twitter`, `instagram`, `website` — all optional |
| `extraNavLinks` | array, optional | `{ label, href }` pairs added beside Home, Episodes, Search |

### Theme colours

`primary`, `secondary`, `background`, `text`, `textMuted`, `surface`, `border`.

These cover the common case. Anything beyond colour — fonts, radii, spacing — lives in
`src/styles/theme.css` as CSS custom properties:

```css
:root {
  --color-primary: #your-color;
  --font-family: 'Your Font', sans-serif;
  --radius-lg: 12px;
}
```

`src/styles/global.css` holds base styles and layout utilities. Editing that is editing the
template rather than configuring it.

## Environment variables

| Variable | Used by | Effect |
|---|---|---|
| `SITE` | `astro.config` | The deployed origin, e.g. `https://user.github.io` |
| `BASE_PATH` | `astro.config` | Subpath for project Pages deploys, e.g. `/my-podcast` |
| `YOUTUBE_API_KEY` | `scripts/fetch-youtube.mjs`, `src/utils/youtube.ts` | YouTube Data API key |

`SITE` and `BASE_PATH` exist because GitHub Pages project sites live under a subpath. Every
internal link goes through `withBase()` in `src/utils/url.ts`, which joins the base correctly for
both root and subpath deploys — so setting `BASE_PATH` is the whole job.
[Deployment](./deployment.md) covers the workflow that sets them.

## YouTube

Optional, and off unless `youtubeChannelId` is set.

```bash
YOUTUBE_API_KEY=... npm run fetch-youtube
```

That writes `.youtube-cache.json` in the working directory. On later builds, `loadCache()` reads
it and no API call is made; without a cache and without a key, the build logs a warning and
carries on with no YouTube data.

Fetching once and committing the cache is the intended pattern for CI — otherwise every build
needs the key. Note that `.youtube-cache.json` is **not** in `.gitignore`, which is either
convenient or a trap depending on whether you meant to commit it. See
[`internal/known-issues.md`](./internal/known-issues.md).

Videos are matched to episodes by fuzzy title and date comparison, so a video whose title differs
substantially from the transcript filename will not match, and one match is used per episode.

## What is not configurable

**Where content comes from.** `src/utils/content.ts` sets `CONTENT_DIR = '..'` as a constant. The
template must live one level below the year folders.

**The file naming convention.** Parsed by `parseEpisodeFilename` in `src/utils/episodes.ts` —
changing it means changing that function.

**Which files win.** When an episode has both `.md` and `.txt` for the same variant, markdown is
preferred. When it has both raw and corrected, corrected is used for the title and date.
