# Podcast Template — Development

## Commands

```bash
npm run dev            # dev server
npm run build          # astro build && npx pagefind --site dist
npm run preview        # serve the built output
npm test               # vitest run
npm run test:watch     # vitest
npm run fetch-youtube  # populate .youtube-cache.json
```

Node ≥ 22.12.0, ES modules throughout, TypeScript in strict mode.

## Developing the template itself

Awkward by design: `CONTENT_DIR` is `..`, so running the template inside its own repository reads
whatever directory happens to be above it. There is no sample content committed and no way to
point it elsewhere.

The practical approach is to create a scratch directory with a couple of year folders and clone
the template into it as `web/`. That is also exactly how a user will use it, which is worth
experiencing.

## Tests

Vitest over `src/utils/`:

| File | Covers |
|---|---|
| `episodes.test.ts` | Filename parsing, title and date extraction, slug generation, grouping |
| `content.test.ts` | Episode assembly, variant pairing, the incomplete-episode path |
| `youtube.test.ts` | Cache handling and fuzzy matching |

667 lines of test against 578 lines of utility. The parsing and pairing rules are where the
behaviour lives and where the tests are, which is the right allocation.

Nothing tests the Astro components, and there is no linter or formatter — the stated convention
is to follow the existing style.

## Conventions

- `.astro` for components, `.ts` for utilities.
- Static output only; no SSR.
- Interactive state through URL hashes, no client-side framework. Keeping that is what makes
  every tab linkable and the back button work.
- Theming through CSS custom properties in `theme.css`, not through component styles.
- Base-path-aware links through `withBase()` — a hardcoded `/episodes` will 404 on a project-page
  deploy.

## The two deploy workflows

`.github/workflows/deploy.yaml` builds this repository standalone, to preview the empty template.
`.github/workflows/deploy-transcript-repo.yml.example` is the one users copy into their content
repository; it builds from `web/` and uploads `web/dist`.

They are easy to confuse. If a user reports that their episodes are missing from a Pages deploy,
this is the first thing to check.

## Dependencies

Three runtime: `astro`, `marked`, `pagefind`. One dev: `vitest`. All are caret-pinned.

Note that `CLAUDE.md` describes the stack as Astro 6; `package.json` pins `^7.2.1`. See
[`internal/known-issues.md`](./internal/known-issues.md).

## Contributing

See the org-wide
[Contributing Guide](https://github.com/willtheorangeguy/.github/blob/main/CONTRIBUTING.md).

Making `CONTENT_DIR` configurable is the change that would most improve the development
experience, and it would let the repository carry sample content and test the loader end to end.
