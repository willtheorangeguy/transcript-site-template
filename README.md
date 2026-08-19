<!-- Logo -->
<h1 align="center">Podcast Template</h1>

<!-- Tagline -->
<h4 align="center">An Astro template that turns a folder of podcast transcripts and summaries into a searchable static site.</h4>

<!-- Badges -->
<div align="center">
  <!-- CI -->
  <img alt="CI State" src="https://github.com/willtheorangeguy/transcript-site-template/actions/workflows/ci.yaml/badge.svg">
  <!-- Deploy -->
  <img alt="Deploy State" src="https://github.com/willtheorangeguy/transcript-site-template/actions/workflows/deploy.yaml/badge.svg">
  <!-- Issues -->
  <img alt="GitHub Issues" src="https://img.shields.io/github/issues/willtheorangeguy/transcript-site-template">
  <!-- Pull Requests -->
  <img alt="GitHub Pull Requests" src="https://img.shields.io/github/issues-pr/willtheorangeguy/transcript-site-template">
  <!-- License -->
  <img alt="License" src="https://img.shields.io/github/license/willtheorangeguy/transcript-site-template">
</div>

<!-- Nav -->
<p align="center">
  <a href="#key-features">Key Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#documentation">Documentation</a> •
  <a href="#support">Support</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#credits">Credits</a> •
  <a href="#license">License</a>
</p>

Drop it into a `web/` folder beside your year-organised transcripts, set a few values, and it builds a site with per-episode pages and full-text search. Output is plain HTML, CSS, and JavaScript — no server, no runtime framework.

## Key Features

* Add a `.md` or `.txt` transcript and summary to a year folder and the site picks them up — no index to update, no frontmatter to write.
* Ships both the raw and the corrected version of each file and lets readers switch between them, so the verbatim record and the readable one both stay available.
* Full-text search across every transcript, via Pagefind, indexed at build time and served as static files.
* Theming through CSS custom properties, with the common colours exposed in one config file.
* Optional YouTube integration: video links and thumbnails matched to episodes by title and date, cached so builds do not spend API quota.
* Deploys to GitHub Pages from your own transcript repository, project subpaths included, with no custom domain required.

## Installation

The template reads content from its **parent directory**, so it has to live inside the repository holding your transcripts:

```
your-podcast/
├── 2024/
└── web/     <-- clone the template here
```

```bash
cd your-podcast
git clone https://github.com/willtheorangeguy/transcript-site-template web
cd web
npm install
```

Node 22.12 or newer. Full prerequisites are in [`docs/installation.md`](docs/installation.md).

## Usage

Name your files:

```
{YYYY-MM-DD} - {Title}_transcript.md
{YYYY-MM-DD} - {Title}_summary.txt
```

Add `_corrected` variants of either and the episode page gains a toggle. An episode needs at least one transcript and one summary sharing the same base name.

Then edit `podcast.config.ts` — name, description, site URL, theme colours — and:

```bash
npm run dev              # http://localhost:4321
npm run build            # astro build + pagefind
```

Search only works after a full build, since Pagefind indexes the built output. [`docs/usage.md`](docs/usage.md) covers the naming and pairing rules in full.

**If no episodes appear**, it is almost always the placement or the filenames — and the build says nothing when it finds no year folders. [`docs/troubleshooting.md`](docs/troubleshooting.md) has each cause.

## Documentation

Full documentation lives in [`docs/`](docs/README.md):
[Installation](docs/installation.md) · [Quickstart](docs/quickstart.md) · [Usage](docs/usage.md) · [Configuration](docs/configuration.md) · [Architecture](docs/architecture.md) · [Deployment](docs/deployment.md) · [Development](docs/development.md) · [Troubleshooting](docs/troubleshooting.md) · [Roadmap](docs/roadmap.md)

## Support

File an [issue](https://github.com/willtheorangeguy/transcript-site-template/issues/new/choose).

## Contributing

Contributions welcome. See the org-wide [Contributing Guide](https://github.com/willtheorangeguy/.github/blob/main/CONTRIBUTING.md) and [Code of Conduct](https://github.com/willtheorangeguy/.github/blob/main/CODE_OF_CONDUCT.md).

`npm test` runs Vitest over the content-loading and filename-parsing utilities, which is where the behaviour lives.

## Credits

* [Astro](https://astro.build/) — the static site framework.
* [Pagefind](https://pagefind.app/) — static full-text search with no backend.
* [marked](https://marked.js.org/) — Markdown rendering.
* [Vitest](https://vitest.dev/) — the test runner.

## License

MIT — see [`LICENSE.md`](LICENSE.md).
