/**
 * Script to fetch YouTube video data and cache it locally
 * Run with: npm run fetch-youtube
 * 
 * Requires YOUTUBE_API_KEY environment variable
 */

import * as fs from 'node:fs';
import config from '../podcast.config.ts';

const CACHE_FILE = '.youtube-cache.json';

async function fetchChannelVideos(channelId, maxResults = 500) {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    console.error('Error: YOUTUBE_API_KEY environment variable is not set');
    console.log('\nTo get a YouTube API key:');
    console.log('1. Go to https://console.cloud.google.com/');
    console.log('2. Create a new project or select an existing one');
    console.log('3. Enable the YouTube Data API v3');
    console.log('4. Create credentials (API key)');
    console.log('\nThen run:');
    console.log('  set YOUTUBE_API_KEY=your-api-key');
    console.log('  npm run fetch-youtube');
    process.exit(1);
  }

  if (!channelId) {
    console.error('Error: No YouTube channel ID configured in podcast.config.ts');
    console.log('\nAdd your channel ID to podcast.config.ts:');
    console.log('  youtubeChannelId: "UC..."');
    process.exit(1);
  }

  const videos = [];
  let pageToken = '';

  console.log(`Fetching videos from channel: ${channelId}`);

  // First, get the uploads playlist ID
  const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`;
  const channelResponse = await fetch(channelUrl);
  const channelData = await channelResponse.json();

  if (channelData.error) {
    console.error('YouTube API error:', channelData.error.message);
    process.exit(1);
  }

  if (!channelData.items?.[0]) {
    console.error('Could not find YouTube channel:', channelId);
    process.exit(1);
  }

  const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;
  console.log(`Found uploads playlist: ${uploadsPlaylistId}`);

  // Fetch videos from uploads playlist
  while (videos.length < maxResults) {
    const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=50&pageToken=${pageToken}&key=${apiKey}`;
    const response = await fetch(playlistUrl);
    const data = await response.json();

    if (data.error) {
      console.error('YouTube API error:', data.error.message);
      break;
    }

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

    console.log(`  Fetched ${videos.length} videos...`);

    pageToken = data.nextPageToken;
    if (!pageToken) break;
  }

  return videos;
}

async function main() {
  console.log('YouTube Data Fetcher\n');

  const videos = await fetchChannelVideos(config.youtubeChannelId);

  const cacheData = {
    lastUpdated: new Date().toISOString(),
    channelId: config.youtubeChannelId,
    videoCount: videos.length,
    videos,
  };

  fs.writeFileSync(CACHE_FILE, JSON.stringify(cacheData, null, 2));

  console.log(`\n✓ Saved ${videos.length} videos to ${CACHE_FILE}`);
  console.log('\nThe build process will use this cached data to match episodes to YouTube videos.');
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
