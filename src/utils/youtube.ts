/**
 * YouTube API Utilities
 * Fetches video metadata at build time and caches results
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const CACHE_FILE = '.youtube-cache.json';

export interface YouTubeVideo {
  videoId: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnailUrl: string;
  channelTitle: string;
}

interface CacheData {
  lastUpdated: string;
  videos: YouTubeVideo[];
}

/**
 * Load cached YouTube data
 */
export function loadCache(): CacheData | null {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = fs.readFileSync(CACHE_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn('Failed to load YouTube cache:', error);
  }
  return null;
}

/**
 * Save YouTube data to cache
 */
export function saveCache(videos: YouTubeVideo[]): void {
  const data: CacheData = {
    lastUpdated: new Date().toISOString(),
    videos,
  };
  fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2));
}

/**
 * Fetch videos from YouTube Data API
 * Requires YOUTUBE_API_KEY environment variable
 */
export async function fetchChannelVideos(channelId: string, maxResults = 100): Promise<YouTubeVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    console.warn('YOUTUBE_API_KEY not set. Skipping YouTube data fetch.');
    return [];
  }

  if (!channelId) {
    console.warn('No YouTube channel ID configured. Skipping YouTube data fetch.');
    return [];
  }

  const videos: YouTubeVideo[] = [];
  let pageToken = '';

  try {
    // First, get the uploads playlist ID
    const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`;
    const channelResponse = await fetch(channelUrl);
    const channelData = await channelResponse.json();

    if (!channelData.items?.[0]) {
      console.warn('Could not find YouTube channel:', channelId);
      return [];
    }

    const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;

    // Fetch videos from uploads playlist
    while (videos.length < maxResults) {
      const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=50&pageToken=${pageToken}&key=${apiKey}`;
      const response = await fetch(playlistUrl);
      const data = await response.json();

      if (!data.items) break;

      for (const item of data.items) {
        const snippet = item.snippet;
        videos.push({
          videoId: snippet.resourceId.videoId,
          title: snippet.title,
          description: snippet.description,
          publishedAt: snippet.publishedAt,
          thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url || '',
          channelTitle: snippet.channelTitle,
        });
      }

      pageToken = data.nextPageToken;
      if (!pageToken) break;
    }

    // Save to cache
    saveCache(videos);
    console.log(`Fetched ${videos.length} videos from YouTube`);

  } catch (error) {
    console.error('Failed to fetch YouTube videos:', error);
    // Try to use cached data as fallback
    const cached = loadCache();
    if (cached) {
      console.log('Using cached YouTube data');
      return cached.videos;
    }
  }

  return videos;
}

/**
 * Match an episode title to a YouTube video
 * Uses fuzzy matching based on title similarity
 */
export function matchVideoToEpisode(
  episodeTitle: string,
  episodeDate: Date,
  videos: YouTubeVideo[]
): YouTubeVideo | null {
  const normalizedEpisodeTitle = normalizeTitle(episodeTitle);

  // First try: exact date match within 3 days + title similarity
  const episodeDateMs = episodeDate.getTime();
  const threeDaysMs = 3 * 24 * 60 * 60 * 1000;

  const dateMatches = videos.filter((video) => {
    const videoDate = new Date(video.publishedAt);
    return Math.abs(videoDate.getTime() - episodeDateMs) < threeDaysMs;
  });

  if (dateMatches.length > 0) {
    // Find best title match among date matches
    let bestMatch: YouTubeVideo | null = null;
    let bestScore = 0;

    for (const video of dateMatches) {
      const score = titleSimilarity(normalizedEpisodeTitle, normalizeTitle(video.title));
      if (score > bestScore && score > 0.3) {
        bestScore = score;
        bestMatch = video;
      }
    }

    if (bestMatch) return bestMatch;
  }

  // Second try: just title similarity across all videos
  let bestMatch: YouTubeVideo | null = null;
  let bestScore = 0;

  for (const video of videos) {
    const score = titleSimilarity(normalizedEpisodeTitle, normalizeTitle(video.title));
    if (score > bestScore && score > 0.5) {
      bestScore = score;
      bestMatch = video;
    }
  }

  return bestMatch;
}

/**
 * Normalize a title for comparison
 */
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculate similarity between two titles (0-1)
 * Uses word overlap / Jaccard similarity
 */
function titleSimilarity(a: string, b: string): number {
  const wordsA = new Set(a.split(' ').filter((w) => w.length > 2));
  const wordsB = new Set(b.split(' ').filter((w) => w.length > 2));

  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  const intersection = new Set([...wordsA].filter((w) => wordsB.has(w)));
  const union = new Set([...wordsA, ...wordsB]);

  return intersection.size / union.size;
}

/**
 * Get YouTube video URL from video ID
 */
export function getVideoUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}
