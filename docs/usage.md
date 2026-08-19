# Podcast Template — Usage

## Where content lives

Year folders beside the template, not inside it:

```
your-podcast/
├── 2020/
├── 2021/
├── 2024/
│   ├── 2024-01-15 - Episode Title_transcript.md
│   ├── 2024-01-15 - Episode Title_transcript_corrected.md
│   ├── 2024-01-15 - Episode Title_summary.txt
│   └── 2024-01-15 - Episode Title_summary_corrected.txt
└── web/          <-- this template
```

Only directories whose names are exactly four digits are read. `2024-archive/` is ignored;
`2024/` is not.

## File naming

```
{YYYY-MM-DD} - {Title}_{type}[_corrected].{md|txt}
```

| Part | Rule |
|---|---|
| Date | `YYYY-MM-DD` at the start |
| Separator | ` - ` — space, hyphen, space |
| Title | Anything; becomes the episode title and, slugified, the URL |
| Type | `_transcript` or `_summary` |
| Variant | `_corrected` for the corrected version; omit for raw |
| Extension | `.md` or `.txt`, either for either type |

Files sharing a base title within a year are grouped into one episode. **An episode needs at
least one transcript and at least one summary** — either variant satisfies either requirement.
Anything with only one of the two is skipped, with a warning naming what was missing.

## Raw and corrected

Supply both variants and the episode page shows a toggle. Supply one and it shows that one with
no toggle.

The distinction exists because machine transcription produces something worth publishing
immediately and something worth fixing later. Readers who want the verbatim record and readers
who want a readable one are both served, and the correction is visible as a correction rather
than replacing history silently.

When both exist, the corrected variant supplies the title and date.

## Formats

`.md` is rendered as Markdown, so a corrected transcript can carry headings, emphasis, and
speaker formatting. `.txt` is rendered as text. Both extensions work for both transcripts and
summaries — if the same variant exists as both, markdown wins.

## Tabs and links

The transcript/summary and raw/corrected toggles are driven by URL hashes, with no client-side
framework, so a link to a specific tab is a shareable URL and the back button behaves.

## Search

Pagefind, indexed at build time over the built output. It covers transcript text, which is the
point — full-text search across every episode is what makes a transcript archive useful.

It does not work under `npm run dev`, because there is no built output to index. Use
`npm run build && npm run preview`.

## Adding an episode

Drop the files into the right year folder and rebuild. There is no index to update, no
frontmatter to write, and no CLI to run.
