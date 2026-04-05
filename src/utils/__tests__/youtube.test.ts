import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import { getVideoUrl, matchVideoToEpisode, loadCache, saveCache, type YouTubeVideo } from '../youtube';

// ---------------------------------------------------------------------------
// getVideoUrl
// ---------------------------------------------------------------------------

describe('getVideoUrl', () => {
  it('generates a YouTube watch URL', () => {
    expect(getVideoUrl('abc123')).toBe('https://www.youtube.com/watch?v=abc123');
  });

  it('handles an empty video ID', () => {
    expect(getVideoUrl('')).toBe('https://www.youtube.com/watch?v=');
  });
});

// ---------------------------------------------------------------------------
// matchVideoToEpisode
// ---------------------------------------------------------------------------

const sampleVideos: YouTubeVideo[] = [
  {
    videoId: 'v1',
    title: 'Introduction to TypeScript',
    description: '',
    publishedAt: '2024-01-15T10:00:00Z',
    thumbnailUrl: 'https://example.com/thumb1.jpg',
    channelTitle: 'Test Channel',
  },
  {
    videoId: 'v2',
    title: 'Advanced React Patterns',
    description: '',
    publishedAt: '2024-03-20T10:00:00Z',
    thumbnailUrl: 'https://example.com/thumb2.jpg',
    channelTitle: 'Test Channel',
  },
  {
    videoId: 'v3',
    title: 'Building REST APIs with Node',
    description: '',
    publishedAt: '2024-06-10T10:00:00Z',
    thumbnailUrl: 'https://example.com/thumb3.jpg',
    channelTitle: 'Test Channel',
  },
];

describe('matchVideoToEpisode', () => {
  it('matches by title similarity within date proximity', () => {
    const match = matchVideoToEpisode(
      'Introduction to TypeScript',
      new Date('2024-01-15T12:00:00Z'),
      sampleVideos,
    );
    expect(match?.videoId).toBe('v1');
  });

  it('matches by title similarity alone when dates are far apart', () => {
    // Episode date is far from any video date, but the title matches v2 well
    const match = matchVideoToEpisode(
      'Advanced React Patterns',
      new Date('2020-01-01T12:00:00Z'),
      sampleVideos,
    );
    expect(match?.videoId).toBe('v2');
  });

  it('returns null when there is no good match', () => {
    const match = matchVideoToEpisode(
      'Completely Unrelated Topic',
      new Date('2020-01-01T12:00:00Z'),
      sampleVideos,
    );
    expect(match).toBeNull();
  });

  it('returns null for an empty video list', () => {
    const match = matchVideoToEpisode('My Episode', new Date(), []);
    expect(match).toBeNull();
  });

  it('prefers the best title match among multiple date-proximate videos', () => {
    const closeVideos: YouTubeVideo[] = [
      {
        videoId: 'near-poor',
        title: 'Something Unrelated Published Close',
        description: '',
        publishedAt: '2024-01-15T10:00:00Z',
        thumbnailUrl: '',
        channelTitle: '',
      },
      {
        videoId: 'near-good',
        title: 'Building REST APIs with Node',
        description: '',
        publishedAt: '2024-01-16T10:00:00Z',
        thumbnailUrl: '',
        channelTitle: '',
      },
    ];
    const match = matchVideoToEpisode(
      'Building REST APIs with Node',
      new Date('2024-01-15T12:00:00Z'),
      closeVideos,
    );
    expect(match?.videoId).toBe('near-good');
  });

  it('ignores short words (2 chars or fewer) when computing similarity', () => {
    // "to" and "is" and "a" should not count as matching words
    const match = matchVideoToEpisode(
      'to is a',
      new Date('2020-01-01T12:00:00Z'),
      sampleVideos,
    );
    expect(match).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// loadCache / saveCache
// ---------------------------------------------------------------------------

describe('loadCache and saveCache', () => {
  const cacheFile = '.youtube-cache.json';

  beforeEach(() => {
    // Remove cache file if it was left over from a previous run
    if (fs.existsSync(cacheFile)) {
      fs.unlinkSync(cacheFile);
    }
  });

  afterEach(() => {
    if (fs.existsSync(cacheFile)) {
      fs.unlinkSync(cacheFile);
    }
  });

  it('returns null when no cache file exists', () => {
    expect(loadCache()).toBeNull();
  });

  it('saves and then loads the cache correctly', () => {
    const videos: YouTubeVideo[] = [
      {
        videoId: 'test-id',
        title: 'Test Video',
        description: 'A description',
        publishedAt: '2024-01-01T00:00:00Z',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        channelTitle: 'My Channel',
      },
    ];

    saveCache(videos);
    expect(fs.existsSync(cacheFile)).toBe(true);

    const cached = loadCache();
    expect(cached).not.toBeNull();
    expect(cached?.videos).toHaveLength(1);
    expect(cached?.videos[0].videoId).toBe('test-id');
    expect(cached?.lastUpdated).toBeTruthy();
  });

  it('returns null when the cache file contains invalid JSON', () => {
    fs.writeFileSync(cacheFile, 'not-valid-json', 'utf-8');
    expect(loadCache()).toBeNull();
  });
});
