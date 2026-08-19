# Known Issues — transcript-site-template

Concrete defects and gaps found while writing this repository's documentation in
August 2026. **Nothing here was changed** — each one needs a code, configuration, or
licensing decision rather than a documentation one.

Ordered by severity. See [`docs/roadmap.md`](../roadmap.md) for the narrative version,
which also covers deliberate non-goals.


**6 open:** 2 medium, 4 low.

## 1. Finding no content is silent, and the guard meant to catch it cannot fire

**Severity:** Medium  
**Where:** `src/utils/content.ts` -> `loadAllEpisodes`

**What:**     const CONTENT_DIR = '..';
    if (!fs.existsSync(CONTENT_DIR)) {
      console.warn(`Content directory not found: ${CONTENT_DIR}`);
      return [];
    }

`..` is the parent directory of the process working directory. It exists in every situation the code can be running in, so this branch is unreachable. The case it was written for -- the template not being where it expects to be -- instead falls through to `readdirSync('..')`, which succeeds, finds no directories matching `/^\d{4}$/`, and returns an empty episode list with nothing logged. A filename that fails to parse is likewise skipped without a message; only a group that parsed and then lacked a counterpart produces the incomplete-episode warning.

**Why it matters:** This is a template whose single hard constraint is where it gets cloned, and the failure mode for getting that wrong is a site that builds successfully and contains nothing. No error, no warning, no non-zero exit -- a green build and an empty homepage. The same silence covers a year folder named `2024-archive`, a filename using an en dash instead of a hyphen, and a template cloned one level too deep.

The author clearly anticipated the problem, since the guard exists. It just guards the one thing that cannot go wrong.

**Suggested fix:** Count what was found and say so: warn when no four-digit folders were seen, naming the directory that was searched, and log how many episodes were assembled at the end. Both are one line. Reporting files that were skipped because they did not parse would cover the third case.

## 2. The content directory is a constant, which is why the template cannot be run on its own

**Severity:** Medium  
**Where:** `src/utils/content.ts`; `podcast.config.ts`

**What:** `CONTENT_DIR` is hardcoded to `'..'` and is not exposed in `PodcastConfig`, which is otherwise a thorough typed configuration surface covering name, description, URL, episode count, seven theme colours, four social links, and extra navigation entries. There is no sample content in the repository.

**Why it matters:** Three consequences follow from one constant. The template must be cloned into a subfolder of the content repository, which is a real constraint stated in prose rather than enforced or configurable. It cannot be run from a fresh clone to see what it looks like, because it would read whatever directory happens to sit above it. And the loader cannot be tested end to end against committed fixtures, which is presumably why the otherwise strong test suite covers parsing and pairing but not discovery.

The design decision itself is sound -- content beside the site, site as a build artifact of the content repository. It is the hardcoding, not the default, that costs.

**Suggested fix:** Add `contentDir` to `PodcastConfig`, defaulting to `'..'`. Nothing changes for existing users, the repository can then carry a `fixtures/` tree, and the loader becomes testable.

## 3. Two deploy workflows differ in a way that is easy to get wrong

**Severity:** Low  
**Where:** `.github/workflows/deploy.yaml`, `.github/workflows/deploy-transcript-repo.yml.example`

**What:** `deploy.yaml` builds this repository standalone from the root, to preview the empty template. `deploy-transcript-repo.yml.example` is the one users copy into their content repository: it builds from `web/` and uploads `web/dist`. The README warns about the distinction; nothing in the files themselves does beyond the filename.

**Why it matters:** Copying the wrong one produces a deploy that succeeds and publishes the empty template -- the same symptom as the silent-empty-content issue above, and arrived at differently. A user who hits it sees a green Actions run and a site with no episodes, and has no reason to suspect the workflow rather than their filenames.

It is a documentation-shaped problem more than a code one, but the two files sit adjacent in the same directory with similar names.

**Suggested fix:** A comment at the top of each saying which is which and what the other is for. Renaming `deploy.yaml` to something like `preview-template.yaml` would make the pair self-describing.

## 4. CLAUDE.md names an Astro major version the project is not on

**Severity:** Low  
**Where:** `CLAUDE.md`; `package.json`

**What:** `CLAUDE.md` states the tech stack as Astro 6 with TypeScript in strict mode. `package.json` pins `astro: ^7.2.1`.

**Why it matters:** `CLAUDE.md` exists to orient someone who has not read the code, so a major version out of date is advice for a different framework release -- config shape, integration APIs, and content collection behaviour all moved between those majors. An agent told the project is on 6 has no reason to check.

The same drift appears in `willtheorangeguy.github.io`, whose `CLAUDE.md` also says Astro 6 against a `^7` pin, and in `cv` and `self-bib` on other details. Agent-facing documentation across this account is worth a pass of its own.

**Suggested fix:** Update the line, and prefer describing the pin as "whatever `package.json` says" rather than transcribing a version that will drift again.

## 5. The YouTube cache file is not gitignored

**Severity:** Low  
**Where:** `src/utils/youtube.ts` -> `CACHE_FILE`; `.gitignore`

**What:** `npm run fetch-youtube` writes `.youtube-cache.json` into the working directory. `.gitignore` covers `dist/`, `.astro/`, `node_modules/`, logs, and `.env` -- not this file.

**Why it matters:** Ambiguous rather than wrong, which is the problem. Committing the cache is a legitimate strategy: it means CI builds need no API key and spend no quota, and `docs/deployment.md` now documents it as an option. But nothing says that is the intent, so the file appears as an untracked change after any fetch and gets committed or not depending on who is looking. The two strategies -- commit the cache, or give CI a key -- want different `.gitignore` entries, and the repository has not chosen.

**Suggested fix:** Choose. If the cache is meant to be committed, say so in a comment in `.gitignore` and in `podcast.config.ts`. If not, ignore it and document the CI secret. Either is fine; the current state is the one that produces accidents.

## 6. The package name does not match the repository

**Severity:** Low  
**Where:** `package.json`

**What:** `"name": "podcast-template"`, `"version": "0.0.1"`. The repository is `transcript-site-template`, and the README title is Podcast Template.

**Why it matters:** Nothing breaks -- the package is private and never published -- but the project now goes by three names, and a search for any one of them misses the others. The `0.0.1` version has never moved either, so there is no way to say which revision of the template a given site was built from, which matters for a template that people clone and then diverge from.

**Suggested fix:** Align the name with the repository, and consider tagging releases so a downstream site can record which version it started from.


---

## Also, across every repository

**`.bandit` is present on disk but untracked in git.** Verified in PyWorkout, treklogger,
skyscanner-cli, booking-cli, piggy, and aibot — the config file exists locally in each but
`git ls-files` does not know about it, so none of it reached GitHub.

The August 2026 security sweep therefore looks complete locally and landed nowhere. Worth
checking across all 44 repositories it covered.
