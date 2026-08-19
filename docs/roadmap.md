# Podcast Template — Roadmap

Defects are in [`internal/known-issues.md`](./internal/known-issues.md).

## Where it is

A working template: content discovery, raw/corrected variants, per-episode pages, year grouping,
full-text search, optional YouTube enrichment, and a Pages deploy that handles project subpaths.
The utilities are well tested.

## Considered

**Making the content directory configurable.** `CONTENT_DIR = '..'` is the single constraint that
shapes everything else — where the template must be cloned, why it cannot be run standalone, and
why the repository carries no sample content. A config field with `..` as the default would cost
nothing and remove all three.

**Saying something when no content is found.** The current behaviour is a site with no episodes
and no message, because the existence check on `..` can never fail. A count and a warning at the
end of the load would turn the most common support question into a line of build output.

**Sample content in the repository.** With a configurable content directory, a small fixture set
would let the template be run, previewed, and tested end to end from a fresh clone.

**A linter and formatter.** Neither is configured, and the stated convention is to match the
existing style — which works while one person maintains it.

**Component tests.** The utilities are well covered; the pages and components are not covered at
all.

**More social links.** `social` has four fixed optional fields. An open map would take Mastodon,
Bluesky, and whatever comes next without a code change.

## Non-goals

**A CMS or an admin interface.** Episodes are files in folders. That is what makes the content
repository the source of truth and the site a build artifact of it.

**SSR or a client framework.** Static output and URL-hash state are why the site can be served
from GitHub Pages with search and no backend. Adding either would take that away.

**Transcribing or correcting anything.** The template renders what you give it. Producing the
transcripts, and correcting them, happens elsewhere.

**Being a general static site generator.** It knows about transcripts, summaries, corrected
variants, and year folders. That specificity is the value — a generic tool would need
configuration for all of it.
