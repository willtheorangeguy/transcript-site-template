# Podcast Template — Quickstart

## 1. Put it in the right place

The template reads content from its parent directory, so it must live inside the repository that
holds your transcripts:

```
your-podcast/
├── 2024/
│   ├── 2024-01-15 - Episode Title_transcript.md
│   └── 2024-01-15 - Episode Title_summary.txt
└── web/          <-- clone the template here
```

```bash
cd your-podcast
git clone https://github.com/willtheorangeguy/transcript-site-template web
cd web
npm install
```

Node 22.12 or newer.

## 2. Name your files correctly

```
{YYYY-MM-DD} - {Title}_transcript.md
{YYYY-MM-DD} - {Title}_summary.txt
```

An episode needs **at least one transcript and one summary** sharing the same base name. Add
`_corrected` variants and the site shows a toggle between them:

```
2024-01-15 - Episode Title_transcript.md
2024-01-15 - Episode Title_transcript_corrected.md
2024-01-15 - Episode Title_summary.txt
2024-01-15 - Episode Title_summary_corrected.txt
```

Both `.md` and `.txt` work for either. [Usage](./usage.md) covers the pairing rules.

## 3. Configure it

Edit `podcast.config.ts`: the podcast's name, description, site URL, how many episodes to show on
the homepage, and the theme colours. That file is the whole customisation surface —
[Configuration](./configuration.md).

## 4. Run it

```bash
npm run dev
```

Search does not work in dev — Pagefind indexes the built output. For the real thing:

```bash
npm run build
npm run preview
```

## What success looks like

The homepage lists your latest episodes, `/episodes` groups them by year, each episode page shows
transcript and summary with a toggle if you supplied corrected variants, and `/search` finds text
inside transcripts.

## If no episodes appear

Almost always the file naming or the directory placement. The build prints a warning for each
incomplete episode it skips, and says nothing at all when it finds no year folders —
[Troubleshooting](./troubleshooting.md).
