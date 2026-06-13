# Podcast Template

A reusable Astro template for creating podcast websites from markdown transcripts and summaries.

## Features

- 📄 **Markdown or plain-text content** - Add `.md` or `.txt` transcript and summary files, the site builds automatically
- 🔀 **Raw / corrected toggle** - Ships both the raw and the spelling/grammar-corrected versions and lets readers switch between them
- 🔍 **Full-text search** - Search through all episode transcripts with Pagefind
- 🎨 **Customizable theming** - CSS custom properties for easy per-podcast styling
- 📺 **YouTube integration** - Optional YouTube API support for video thumbnails and links
- 📱 **Responsive design** - Mobile-first, works great on all devices
- ⚡ **Static output** - Deploy to GitHub Pages, Netlify, Vercel, or any static host

## Quick Start

1. **Copy this template** to a `web/` folder in your podcast project
2. **Ensure your content** is in year folders alongside the `web/` folder (see structure below)
3. **Configure** `podcast.config.ts` with your podcast info
4. **Customize** `src/styles/theme.css` to match your brand
5. **Build and deploy**: `npm run build`

## Project Structure

The template expects markdown files to live in year folders **in the parent directory**:

```
your-podcast-project/
├── 2020/
│   ├── 2020-05-01 - Episode Title_transcript_corrected.md
│   └── 2020-05-01 - Episode Title_summary_corrected.md
├── 2021/
│   └── ...
├── 2022/
│   └── ...
├── 2023/
│   └── ...
├── 2024/
│   └── ...
├── 2025/
│   └── ...
├── 2026/
│   └── ...
└── web/                    <-- This template goes here
    ├── src/
    ├── podcast.config.ts
    ├── package.json
    └── ...
```

### File Naming Convention

Each episode is built from transcript and summary files. Both `.md` and `.txt`
are supported, and each can come in a raw and/or a corrected version:

| File | Meaning |
|------|---------|
| `{date} - {title}_transcript.md` | Raw transcript |
| `{date} - {title}_transcript_corrected.md` | Spelling/grammar-corrected transcript |
| `{date} - {title}_summary.txt` | Raw summary |
| `{date} - {title}_summary_corrected.txt` | Corrected summary |

An episode is published as long as it has **at least one transcript and one
summary** (either variant). When both a raw and a corrected version exist, the
episode page shows a **Raw / Corrected** toggle; the corrected version is shown
by default, and the toggle option for a missing variant is disabled. If both
`.md` and `.txt` exist for the same variant, the `.md` file is used.

The date should be in `YYYY-MM-DD` format at the start of the filename.

## Configuration

Edit `podcast.config.ts` to customize your site:

```typescript
const config = {
  name: "My Podcast",                    // Shown in header and metadata
  description: "About my podcast",       // SEO description
  siteUrl: "https://example.com",        // Your site URL
  youtubeChannelId: "UC...",             // Optional: YouTube channel ID
  latestEpisodesCount: 6,                // Episodes on homepage
  theme: {
    primary: "#3b82f6",                  // Brand color
    secondary: "#1e40af",                // Accent color
    background: "#ffffff",
    text: "#1f2937",
    textMuted: "#6b7280",
    surface: "#f9fafb",
    border: "#e5e7eb",
  },
  social: {
    youtube: "https://youtube.com/...",
    twitter: "https://twitter.com/...",
  },
};
```

## Theming

For deeper customization, edit `src/styles/theme.css`:

```css
:root {
  --color-primary: #your-color;
  --font-family: 'Your Font', sans-serif;
  --radius-lg: 12px;
  /* ... see file for all variables */
}
```

## YouTube Integration (Optional)

To fetch video thumbnails and links from YouTube:

1. Get a YouTube API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the "YouTube Data API v3"
3. Add your channel ID to `podcast.config.ts`
4. Run:

```bash
set YOUTUBE_API_KEY=your-api-key
npm run fetch-youtube
```

This caches video data in `.youtube-cache.json`. The build process matches episodes to videos by title/date similarity.

## Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server at localhost:4321 |
| `npm run build` | Build for production (includes search indexing) |
| `npm run preview` | Preview production build locally |
| `npm run fetch-youtube` | Fetch/refresh YouTube video data |

## Deployment

### GitHub Pages (from your transcript repo)

This is the intended setup: one repo containing your year folders **and** this
template in a `web/` subfolder. The whole site — including search — is fully
static, so GitHub Pages serves it with no server.

1. In your repo settings, set **Pages → Source** to "GitHub Actions".
2. Copy [`web/.github/workflows/deploy-transcript-repo.yml.example`](.github/workflows/deploy-transcript-repo.yml.example)
   into your repo as `.github/workflows/deploy.yaml` (drop the `.example` suffix).
   It builds from `web/`, uploads `web/dist`, and passes the Pages `SITE` /
   `BASE_PATH` values to the build.
3. Push to `main`.

**Project subpaths just work.** When the site is served from a project page
(`https://<user>.github.io/<repo>/`), the workflow supplies `BASE_PATH` and
`astro.config.mjs` reads it into Astro's `base`. All internal links, assets, the
favicon, and the Pagefind search index are prefixed automatically via the
`withBase()` helper (`src/utils/url.ts`), so no custom domain is required. A
user/org page or custom domain (served at the root) also works with no changes.

> The `deploy.yaml` already in this template repo builds the template
> standalone (from the repo root) for previewing the empty template — it is
> **not** the one to copy into a transcript repo. Use the `.example` file above.

### Netlify / Vercel

Just connect your repo and set:
- Build command: `npm run build`
- Output directory: `dist`

## Template File Structure

```
web/                       # This template
├── src/
│   ├── components/        # Reusable UI components
│   ├── layouts/           # Page layouts
│   ├── pages/             # Routes
│   ├── styles/            # Global CSS and theme
│   └── utils/             # Content loading and utilities
├── public/                # Static assets (favicon, images)
├── scripts/               # Build scripts (YouTube fetcher)
├── podcast.config.ts      # Site configuration
└── package.json

../                        # Parent directory (content)
├── 2020/                  # Year folders with markdown files
├── 2021/
├── ...
└── 2026/
```

## License

MIT
