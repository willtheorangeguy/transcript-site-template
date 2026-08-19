# Podcast Template — Documentation

An Astro template for building a podcast website out of transcript and summary files. Drop it
into a `web/` folder beside your year-organised content, configure a few values, and it produces
a static site with full-text search, per-episode pages, and a raw/corrected toggle.

Output is plain HTML, CSS, and JavaScript — no server, no framework at runtime.

```
docs/
├── README.md            this index
├── quickstart.md        template to a running site
├── installation.md      prerequisites, and where the template must live
├── usage.md             content layout, file naming, and the raw/corrected pairing
├── configuration.md     podcast.config.ts, theming, environment variables
├── architecture.md      how episodes are discovered, paired, and rendered
├── deployment.md        GitHub Pages from the content repo, Netlify, Vercel
├── development.md       tests, commands, and what is not configured
├── troubleshooting.md   why no episodes appeared
├── roadmap.md           gaps and deliberate non-goals
└── internal/
    └── known-issues.md  defects found while documenting (not fixed)
```

## The one structural rule

The template reads content from `..` — its parent directory — and nothing makes that
configurable. It has to be cloned into a subfolder of the repository holding the transcripts:

```
your-podcast/
├── 2020/
├── 2021/
└── web/     <-- this template
```

Everything else is configuration. This is not, and can be found out the hard way — see
[Installation](./installation.md).

## Start here

- Getting a site up — [Quickstart](./quickstart.md)
- Naming your files so they are found — [Usage](./usage.md)
- No episodes appeared — [Troubleshooting](./troubleshooting.md)
- Publishing it — [Deployment](./deployment.md)
