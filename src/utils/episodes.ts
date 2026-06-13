/**
 * Episode Utilities
 * Handles parsing episode metadata from filenames and pairing transcripts with summaries
 */

export interface Episode {
  /** Unique slug for the episode (derived from filename) */
  slug: string;
  /** Episode title parsed from filename */
  title: string;
  /** Episode date parsed from filename */
  date: Date;
  /** Year folder the episode is in */
  year: number;
  /** Path to the raw (uncorrected) transcript file, if present */
  transcriptRawPath?: string;
  /** Path to the spelling/grammar corrected transcript file, if present */
  transcriptCorrectedPath?: string;
  /** Path to the raw (uncorrected) summary file, if present */
  summaryRawPath?: string;
  /** Path to the spelling/grammar corrected summary file, if present */
  summaryCorrectedPath?: string;
  /** YouTube video URL (if available) */
  youtubeUrl?: string;
  /** YouTube thumbnail URL (if available) */
  thumbnailUrl?: string;
}

export interface RawEpisodeFile {
  path: string;
  filename: string;
  year: string;
  type: 'transcript' | 'summary';
  /** Whether this is the raw or the corrected version of the content */
  variant: 'raw' | 'corrected';
  /** File format */
  format: 'md' | 'txt';
  baseTitle: string;
}

/**
 * Parse an episode filename to extract metadata.
 *
 * Recognized formats (case-insensitive, .md or .txt):
 *   YYYY-MM-DD - Episode Title_transcript.md            (raw transcript)
 *   YYYY-MM-DD - Episode Title_transcript_corrected.md  (corrected transcript)
 *   YYYY-MM-DD - Episode Title_summary.txt              (raw summary)
 *   YYYY-MM-DD - Episode Title_summary_corrected.txt    (corrected summary)
 *
 * Returns null for any filename that does not match this convention.
 */
export function parseEpisodeFilename(filename: string, yearFolder: string): RawEpisodeFile | null {
  const match = filename.match(/^(.+?)_(transcript|summary)(_corrected)?\.(md|txt)$/i);

  if (!match) {
    return null;
  }

  const [, baseTitle, typeStr, correctedStr, formatStr] = match;

  return {
    path: `${yearFolder}/${filename}`,
    filename,
    year: yearFolder,
    type: typeStr.toLowerCase() as 'transcript' | 'summary',
    variant: correctedStr ? 'corrected' : 'raw',
    format: formatStr.toLowerCase() as 'md' | 'txt',
    baseTitle: baseTitle.trim(),
  };
}

/**
 * Parse title and date from the base title string.
 *
 * Titles may optionally start with a full "YYYY-MM-DD" date, but they are not
 * required to. The episode's year is always taken from the parent year folder,
 * so when a filename has no date prefix we fall back to that folder's year.
 *
 * Examples:
 *   "2024-05-01 - Episode Title"  -> { title: "Episode Title", date: 2024-05-01 }
 *   "Episode Title"  (folder 2023) -> { title: "Episode Title", date: 2023-01-01 }
 */
export function parseTitleAndDate(
  baseTitle: string,
  yearFolder: string,
): { title: string; date: Date } {
  // Try to match a full YYYY-MM-DD date at the start
  const dateMatch = baseTitle.match(/^(\d{4}-\d{2}-\d{2})\s*[-–—]?\s*(.*)$/);

  if (dateMatch) {
    const [, dateStr, title] = dateMatch;
    return {
      date: new Date(dateStr),
      title: title.trim() || baseTitle,
    };
  }

  // No date prefix: infer the year from the parent folder and use Jan 1 so the
  // episode still sorts into the correct year.
  const year = parseInt(yearFolder, 10);
  return {
    title: baseTitle,
    date: new Date(Date.UTC(year, 0, 1)),
  };
}

/**
 * Create a URL-safe slug from a title
 */
export function createSlug(title: string, date: Date): string {
  const datePrefix = date.toISOString().split('T')[0];
  const titleSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);

  return `${datePrefix}-${titleSlug}`;
}

/**
 * Group episodes by year for the archive page
 */
export function groupEpisodesByYear(episodes: Episode[]): Map<number, Episode[]> {
  const grouped = new Map<number, Episode[]>();

  for (const episode of episodes) {
    const year = episode.year;
    if (!grouped.has(year)) {
      grouped.set(year, []);
    }
    grouped.get(year)!.push(episode);
  }

  // Sort years descending, episodes within each year by date descending
  const sortedMap = new Map<number, Episode[]>();
  const years = Array.from(grouped.keys()).sort((a, b) => b - a);

  for (const year of years) {
    const episodes = grouped.get(year)!;
    episodes.sort((a, b) => b.date.getTime() - a.date.getTime());
    sortedMap.set(year, episodes);
  }

  return sortedMap;
}

/**
 * Get the latest N episodes
 */
export function getLatestEpisodes(episodes: Episode[], count: number): Episode[] {
  return [...episodes]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, count);
}

/**
 * Format a date for display
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
