/**
 * Content Loader
 * Loads and pairs episode markdown files from the parent directory
 * 
 * Expected structure:
 * project-root/
 * ├── 2020/
 * │   ├── episode_transcript_corrected.md
 * │   └── episode_summary_corrected.md
 * ├── 2021/
 * │   └── ...
 * └── web/          <-- This template lives here
 *     └── (astro files)
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  type Episode,
  type RawEpisodeFile,
  parseEpisodeFilename,
  parseTitleAndDate,
  createSlug,
} from './episodes';
import {
  loadCache,
  fetchChannelVideos,
  matchVideoToEpisode,
  getVideoUrl,
  type YouTubeVideo,
} from './youtube';
import config from '../../podcast.config';

// Content lives in parent directory (year folders alongside /web)
const CONTENT_DIR = '..';

/**
 * Load all episodes from the content directory
 */
export async function loadAllEpisodes(): Promise<Episode[]> {
  const episodes: Episode[] = [];

  // Load YouTube videos (from cache or API)
  let youtubeVideos: YouTubeVideo[] = [];
  if (config.youtubeChannelId) {
    const cached = loadCache();
    if (cached) {
      youtubeVideos = cached.videos;
    } else {
      youtubeVideos = await fetchChannelVideos(config.youtubeChannelId);
    }
  }

  // Check if content directory exists
  if (!fs.existsSync(CONTENT_DIR)) {
    console.warn(`Content directory not found: ${CONTENT_DIR}`);
    return [];
  }

  // Read year folders from parent directory
  const yearFolders = fs.readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory() && /^\d{4}$/.test(dirent.name))
    .map((dirent) => dirent.name);

  // Group files by base title
  const filesByBaseTitle = new Map<string, RawEpisodeFile[]>();

  for (const year of yearFolders) {
    const yearPath = path.join(CONTENT_DIR, year);
    const files = fs.readdirSync(yearPath);

    for (const file of files) {
      const parsed = parseEpisodeFilename(file, year);
      if (parsed) {
        const key = `${year}/${parsed.baseTitle}`;
        if (!filesByBaseTitle.has(key)) {
          filesByBaseTitle.set(key, []);
        }
        filesByBaseTitle.get(key)!.push(parsed);
      }
    }
  }

  // Create episodes from paired files
  for (const [key, files] of filesByBaseTitle) {
    // A single episode may have up to four files: raw/corrected × transcript/summary.
    // Prefer markdown over txt when both formats exist for the same variant.
    const pick = (type: 'transcript' | 'summary', variant: 'raw' | 'corrected') => {
      const matches = files.filter((f) => f.type === type && f.variant === variant);
      return matches.find((f) => f.format === 'md') ?? matches[0];
    };

    const transcriptRaw = pick('transcript', 'raw');
    const transcriptCorrected = pick('transcript', 'corrected');
    const summaryRaw = pick('summary', 'raw');
    const summaryCorrected = pick('summary', 'corrected');

    const anyTranscript = transcriptCorrected ?? transcriptRaw;
    const anySummary = summaryCorrected ?? summaryRaw;

    // An episode needs at least one transcript and one summary (either variant).
    if (!anyTranscript || !anySummary) {
      console.warn(
        `Skipping incomplete episode: ${key} (missing ${!anyTranscript ? 'transcript' : 'summary'})`,
      );
      continue;
    }

    const { title, date } = parseTitleAndDate(anyTranscript.baseTitle, anyTranscript.year);
    const year = parseInt(anyTranscript.year, 10);
    const slug = createSlug(title, date);

    // Match to YouTube video
    let youtubeUrl: string | undefined;
    let thumbnailUrl: string | undefined;

    if (youtubeVideos.length > 0) {
      const match = matchVideoToEpisode(title, date, youtubeVideos);
      if (match) {
        youtubeUrl = getVideoUrl(match.videoId);
        thumbnailUrl = match.thumbnailUrl;
      }
    }

    episodes.push({
      slug,
      title,
      date,
      year,
      transcriptRawPath: transcriptRaw ? path.join(CONTENT_DIR, transcriptRaw.path) : undefined,
      transcriptCorrectedPath: transcriptCorrected
        ? path.join(CONTENT_DIR, transcriptCorrected.path)
        : undefined,
      summaryRawPath: summaryRaw ? path.join(CONTENT_DIR, summaryRaw.path) : undefined,
      summaryCorrectedPath: summaryCorrected
        ? path.join(CONTENT_DIR, summaryCorrected.path)
        : undefined,
      youtubeUrl,
      thumbnailUrl,
    });
  }

  // Sort by date descending
  episodes.sort((a, b) => b.date.getTime() - a.date.getTime());

  return episodes;
}

/**
 * Load a single episode by slug
 */
export async function loadEpisodeBySlug(slug: string): Promise<Episode | null> {
  const episodes = await loadAllEpisodes();
  return episodes.find((e) => e.slug === slug) || null;
}

/**
 * Read markdown file content
 */
export function readMarkdownContent(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error(`Failed to read file: ${filePath}`, error);
    return '';
  }
}

/**
 * Get all episode slugs for static path generation
 */
export async function getAllEpisodeSlugs(): Promise<string[]> {
  const episodes = await loadAllEpisodes();
  return episodes.map((e) => e.slug);
}
