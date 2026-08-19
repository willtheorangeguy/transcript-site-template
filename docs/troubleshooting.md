# Podcast Template — Troubleshooting

## No episodes appear, and there is no error

The most common outcome, and it has three causes.

**The template is in the wrong place.** Content is read from `..`, so `web/` must sit beside the
year folders. The existence check on `..` can never fail, so nothing reports this — the site just
builds empty. [`internal/known-issues.md`](./internal/known-issues.md).

**The year folders are not four digits.** Only names matching exactly four digits are read.
`2024/` yes; `2024-archive/`, `Season 1/`, `episodes/` no.

**The filenames do not parse.** The format is strict:

```
{YYYY-MM-DD} - {Title}_transcript.md
{YYYY-MM-DD} - {Title}_summary.txt
```

The separator is space-hyphen-space. A file that does not parse is skipped in silence, without
even the incomplete-episode warning — that warning only fires for groups that parsed but lacked a
counterpart.

## `Skipping incomplete episode: 2024/... (missing summary)`

Exactly what it says: that base title had a transcript and no summary, or the reverse. An episode
needs one of each; either variant counts.

The usual cause is the base names not matching. `2024-01-15 - Title_transcript.md` and
`2024-01-15 - The Title_summary.txt` are two different episodes as far as the grouping is
concerned, each missing half.

## Search returns nothing, or /search 404s

Pagefind indexes built output. It cannot work under `npm run dev`.

```bash
npm run build && npm run preview
```

If it is still empty after a full build, check that the build ran `npx pagefind --site dist` —
running `astro build` on its own skips it.

## Links 404 on GitHub Pages

A project page is served under `/repo/`, so the build needs `BASE_PATH` set. The supplied
workflow does it; a hand-rolled one may not. [Deployment](./deployment.md).

Symptom to recognise: the homepage loads and every link from it 404s.

## No YouTube thumbnails or links

Three possibilities: `youtubeChannelId` is empty in `podcast.config.ts`, no `YOUTUBE_API_KEY` is
set and no `.youtube-cache.json` exists, or the fuzzy matcher found nothing close enough for that
episode.

The first two log a warning and continue — a missing key does not fail the build, so this can go
unnoticed in CI.

## The wrong video is attached to an episode

Matching is fuzzy over title and date. An episode whose transcript filename differs substantially
from the video title can match a neighbour. Renaming the file to something closer to the video
title is the practical fix.

## The corrected version is not showing

Both variants must be present for a toggle to appear, and the base names must match exactly:

```
2024-01-15 - Title_transcript.md
2024-01-15 - Title_transcript_corrected.md
```

## `npm install` fails on the Node version

`engines` requires Node ≥ 22.12.0. Older versions are refused.

## Changes to podcast.config.ts do nothing

It is read at build time. Restart `npm run dev`, or rebuild.
