import { describe, it, expect } from 'vitest';
import {
  parseEpisodeFilename,
  parseTitleAndDate,
  createSlug,
  groupEpisodesByYear,
  getLatestEpisodes,
  formatDate,
  type Episode,
} from '../episodes';

// ---------------------------------------------------------------------------
// parseEpisodeFilename
// ---------------------------------------------------------------------------

describe('parseEpisodeFilename', () => {
  it('parses a transcript filename', () => {
    const result = parseEpisodeFilename(
      '2024-01-15 - My Episode_transcript_corrected.md',
      '2024',
    );
    expect(result).not.toBeNull();
    expect(result?.type).toBe('transcript');
    expect(result?.baseTitle).toBe('2024-01-15 - My Episode');
    expect(result?.year).toBe('2024');
    expect(result?.filename).toBe('2024-01-15 - My Episode_transcript_corrected.md');
  });

  it('parses a summary filename', () => {
    const result = parseEpisodeFilename(
      '2024-01-15 - My Episode_summary_corrected.md',
      '2024',
    );
    expect(result).not.toBeNull();
    expect(result?.type).toBe('summary');
    expect(result?.baseTitle).toBe('2024-01-15 - My Episode');
  });

  it('returns null for an unrecognized filename', () => {
    expect(parseEpisodeFilename('random.txt', '2024')).toBeNull();
    expect(parseEpisodeFilename('2024-01-15 - Episode.md', '2024')).toBeNull();
    expect(parseEpisodeFilename('notes.md', '2024')).toBeNull();
  });

  it('matches case-insensitively', () => {
    const result = parseEpisodeFilename('Episode_TRANSCRIPT_CORRECTED.md', '2024');
    expect(result).not.toBeNull();
    expect(result?.type).toBe('transcript');
  });

  it('builds the path from year folder and filename', () => {
    const result = parseEpisodeFilename(
      '2024-01-15 - My Episode_transcript_corrected.md',
      '2024',
    );
    expect(result?.path).toBe('2024/2024-01-15 - My Episode_transcript_corrected.md');
  });

  it('trims whitespace from the base title', () => {
    const result = parseEpisodeFilename(
      '  Padded Title  _transcript_corrected.md',
      '2024',
    );
    expect(result?.baseTitle).toBe('Padded Title');
  });
});

// ---------------------------------------------------------------------------
// parseTitleAndDate
// ---------------------------------------------------------------------------

describe('parseTitleAndDate', () => {
  it('parses standard "YYYY-MM-DD - Title" format', () => {
    const { title, date } = parseTitleAndDate('2024-01-15 - My Episode Title');
    expect(title).toBe('My Episode Title');
    expect(date.getUTCFullYear()).toBe(2024);
    expect(date.getUTCMonth()).toBe(0); // January
    expect(date.getUTCDate()).toBe(15);
  });

  it('parses with an em dash separator', () => {
    const { title } = parseTitleAndDate('2024-03-20 — Another Episode');
    expect(title).toBe('Another Episode');
  });

  it('parses with an en dash separator', () => {
    const { title } = parseTitleAndDate('2024-03-20 – Yet Another Episode');
    expect(title).toBe('Yet Another Episode');
  });

  it('parses date with no separator (space only)', () => {
    const { title, date } = parseTitleAndDate('2024-06-01 Title Without Dash');
    expect(date.getUTCFullYear()).toBe(2024);
    expect(title).toBe('Title Without Dash');
  });

  it('falls back to the base title when the date-only string has no title', () => {
    const { title, date } = parseTitleAndDate('2024-01-15');
    expect(date.getUTCFullYear()).toBe(2024);
    // When title part is empty the baseTitle itself is used as fallback
    expect(title).toBe('2024-01-15');
  });

  it('falls back to current date when no date prefix is found', () => {
    const before = new Date();
    const { title, date } = parseTitleAndDate('No Date In This Title');
    const after = new Date();
    expect(title).toBe('No Date In This Title');
    expect(date.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(date.getTime()).toBeLessThanOrEqual(after.getTime());
  });
});

// ---------------------------------------------------------------------------
// createSlug
// ---------------------------------------------------------------------------

describe('createSlug', () => {
  it('produces a URL-safe slug prefixed with the date', () => {
    const date = new Date('2024-01-15T00:00:00Z');
    expect(createSlug('My Episode Title', date)).toBe('2024-01-15-my-episode-title');
  });

  it('replaces special characters with hyphens', () => {
    const date = new Date('2024-01-15T00:00:00Z');
    const slug = createSlug('My "Special" Episode!', date);
    expect(slug).toMatch(/^[a-z0-9-]+$/);
  });

  it('removes leading and trailing hyphens from the title part', () => {
    const date = new Date('2024-01-15T00:00:00Z');
    const slug = createSlug('---Episode---', date);
    const titlePart = slug.replace(/^\d{4}-\d{2}-\d{2}-/, '');
    expect(titlePart).not.toMatch(/^-|-$/);
  });

  it('truncates the title part to 50 characters', () => {
    const date = new Date('2024-01-15T00:00:00Z');
    const slug = createSlug('a'.repeat(100), date);
    const titlePart = slug.replace(/^\d{4}-\d{2}-\d{2}-/, '');
    expect(titlePart.length).toBeLessThanOrEqual(50);
  });

  it('includes the correct date prefix', () => {
    const date = new Date('2023-11-30T00:00:00Z');
    expect(createSlug('Test', date)).toMatch(/^2023-11-30-/);
  });
});

// ---------------------------------------------------------------------------
// groupEpisodesByYear
// ---------------------------------------------------------------------------

function makeEpisode(year: number, month: number, day: number, title: string): Episode {
  return {
    slug: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}-${title.toLowerCase().replace(/\s+/g, '-')}`,
    title,
    date: new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T12:00:00Z`),
    year,
    transcriptPath: '',
    summaryPath: '',
  };
}

describe('groupEpisodesByYear', () => {
  it('groups episodes by their year', () => {
    const episodes = [
      makeEpisode(2024, 1, 1, 'Alpha'),
      makeEpisode(2023, 3, 1, 'Beta'),
      makeEpisode(2024, 5, 1, 'Gamma'),
    ];
    const grouped = groupEpisodesByYear(episodes);
    expect(grouped.get(2024)?.length).toBe(2);
    expect(grouped.get(2023)?.length).toBe(1);
  });

  it('sorts years in descending order', () => {
    const episodes = [
      makeEpisode(2022, 1, 1, 'Old'),
      makeEpisode(2024, 1, 1, 'New'),
      makeEpisode(2023, 1, 1, 'Mid'),
    ];
    const years = Array.from(groupEpisodesByYear(episodes).keys());
    expect(years).toEqual([2024, 2023, 2022]);
  });

  it('sorts episodes within a year by date descending', () => {
    const episodes = [
      makeEpisode(2024, 1, 1, 'January'),
      makeEpisode(2024, 6, 1, 'June'),
      makeEpisode(2024, 3, 1, 'March'),
    ];
    const yearEpisodes = groupEpisodesByYear(episodes).get(2024)!;
    expect(yearEpisodes[0].title).toBe('June');
    expect(yearEpisodes[1].title).toBe('March');
    expect(yearEpisodes[2].title).toBe('January');
  });

  it('handles an empty episode list', () => {
    expect(groupEpisodesByYear([])).toEqual(new Map());
  });

  it('handles a single episode', () => {
    const episodes = [makeEpisode(2024, 6, 1, 'Solo')];
    const grouped = groupEpisodesByYear(episodes);
    expect(grouped.size).toBe(1);
    expect(grouped.get(2024)?.[0].title).toBe('Solo');
  });
});

// ---------------------------------------------------------------------------
// getLatestEpisodes
// ---------------------------------------------------------------------------

describe('getLatestEpisodes', () => {
  const episodes: Episode[] = [
    makeEpisode(2024, 1, 1, 'Alpha'),
    makeEpisode(2024, 6, 1, 'Gamma'),
    makeEpisode(2023, 1, 1, 'Beta'),
  ];

  it('returns the requested number of episodes', () => {
    expect(getLatestEpisodes(episodes, 2).length).toBe(2);
  });

  it('returns episodes sorted newest first', () => {
    const latest = getLatestEpisodes(episodes, 2);
    expect(latest[0].title).toBe('Gamma');
    expect(latest[1].title).toBe('Alpha');
  });

  it('returns all episodes when count exceeds the total', () => {
    expect(getLatestEpisodes(episodes, 100).length).toBe(3);
  });

  it('returns an empty array for an empty input', () => {
    expect(getLatestEpisodes([], 5)).toEqual([]);
  });

  it('does not mutate the original array', () => {
    const copy = [...episodes];
    getLatestEpisodes(episodes, 2);
    expect(episodes).toEqual(copy);
  });
});

// ---------------------------------------------------------------------------
// formatDate
// ---------------------------------------------------------------------------

describe('formatDate', () => {
  it('formats a date in long US English format', () => {
    // Use local noon to avoid DST / UTC boundary edge cases
    const date = new Date(2024, 0, 15, 12, 0, 0); // January 15 2024 local noon
    const formatted = formatDate(date);
    expect(formatted).toContain('2024');
    expect(formatted).toContain('January');
    expect(formatted).toContain('15');
  });

  it('formats December correctly', () => {
    const date = new Date(2023, 11, 31, 12, 0, 0); // December 31 2023 local noon
    const formatted = formatDate(date);
    expect(formatted).toContain('December');
    expect(formatted).toContain('31');
    expect(formatted).toContain('2023');
  });
});
