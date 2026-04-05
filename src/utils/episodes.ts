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
  /** Path to transcript markdown file */
  transcriptPath: string;
  /** Path to summary markdown file */
  summaryPath: string;
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
  baseTitle: string;
}

/**
 * Parse an episode filename to extract metadata
 * Expected format: YYYY-MM-DD - Episode Title_transcript_corrected.md
 * or: YYYY-MM-DD - Episode Title_summary_corrected.md
 */
export function parseEpisodeFilename(filename: string, yearFolder: string): RawEpisodeFile | null {
  const transcriptMatch = filename.match(/^(.+)_transcript_corrected\.md$/i);
  const summaryMatch = filename.match(/^(.+)_summary_corrected\.md$/i);

  if (!transcriptMatch && !summaryMatch) {
    return null;
  }

  const isTranscript = !!transcriptMatch;
  const baseTitle = (transcriptMatch?.[1] || summaryMatch?.[1]) ?? '';

  return {
    path: `${yearFolder}/${filename}`,
    filename,
    year: yearFolder,
    type: isTranscript ? 'transcript' : 'summary',
    baseTitle: baseTitle.trim(),
  };
}

/**
 * Parse date and title from the base title string
 * Expected format: "YYYY-MM-DD - Episode Title" or "YYYY-MM-DD Episode Title"
 */
export function parseTitleAndDate(baseTitle: string): { title: string; date: Date } {
  // Try to match YYYY-MM-DD at the start
  const dateMatch = baseTitle.match(/^(\d{4}-\d{2}-\d{2})\s*[-–—]?\s*(.*)$/);

  if (dateMatch) {
    const [, dateStr, title] = dateMatch;
    return {
      date: new Date(dateStr),
      title: title.trim() || baseTitle,
    };
  }

  // Fallback: no date found, use current date
  return {
    title: baseTitle,
    date: new Date(),
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
