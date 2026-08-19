# Podcast Template — Installation

## Prerequisites

| Requirement | Notes |
|---|---|
| Node ≥ 22.12.0 | Declared in `engines`; Astro 7 requires a current Node |
| Transcript and summary files | In year folders — see below |
| A YouTube Data API key | Optional, only for video links and thumbnails |

## Where it must go

The template reads content from `..`, its parent directory. That is a constant in
`src/utils/content.ts`, not a setting. It must be cloned into a subfolder of the repository that
holds your content:

```
your-podcast/
├── 2020/
├── 2024/
└── web/     <-- here
```

```bash
cd your-podcast
git clone https://github.com/willtheorangeguy/transcript-site-template web
rm -rf web/.git        # if you want it to be part of your repo rather than a nested clone
cd web
npm install
```

Cloning it anywhere else produces a site with no episodes, and — because the existence check on
`..` can never fail — no error explaining why. See
[`internal/known-issues.md`](./internal/known-issues.md).

## Configure

Edit `podcast.config.ts`: name, description, `siteUrl`, `latestEpisodesCount`, theme colours, and
social links. [Configuration](./configuration.md) covers every field.

## Run

```bash
npm run dev              # http://localhost:4321
npm run build            # astro build + pagefind
npm run preview          # serve the built output
```

Search only works after a full build — Pagefind indexes `dist`, which `npm run dev` never
produces.

## Verify

```bash
npm test
```

Vitest over the content-loading and filename-parsing utilities. It passes without any content
present, since it works from fixtures — a green test run means the template is intact, not that
your files are named correctly.

For that, run `npm run build` and read the output: every incomplete episode is reported by name.

## Updating the template later

If you removed `.git`, the template is now part of your repository and updating means merging
changes by hand. Keeping it as a nested clone or a submodule preserves the update path at the
cost of a more awkward repository. Neither is wrong; decide before you have made local
modifications.
