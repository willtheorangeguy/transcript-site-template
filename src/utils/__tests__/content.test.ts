import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { readMarkdownContent } from '../content';

// ---------------------------------------------------------------------------
// readMarkdownContent
// ---------------------------------------------------------------------------

describe('readMarkdownContent', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'transcript-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('reads the content of an existing markdown file', () => {
    const filePath = path.join(tmpDir, 'episode.md');
    fs.writeFileSync(filePath, '# Hello World\n\nThis is a test transcript.');
    const content = readMarkdownContent(filePath);
    expect(content).toBe('# Hello World\n\nThis is a test transcript.');
  });

  it('returns an empty string for a non-existent file', () => {
    const content = readMarkdownContent(path.join(tmpDir, 'nonexistent.md'));
    expect(content).toBe('');
  });

  it('reads a file with unicode content', () => {
    const filePath = path.join(tmpDir, 'unicode.md');
    const text = '# Episode: "Smart Quotes" & émoji 🎙️';
    fs.writeFileSync(filePath, text, 'utf-8');
    expect(readMarkdownContent(filePath)).toBe(text);
  });

  it('reads an empty file as an empty string', () => {
    const filePath = path.join(tmpDir, 'empty.md');
    fs.writeFileSync(filePath, '');
    expect(readMarkdownContent(filePath)).toBe('');
  });
});

// ---------------------------------------------------------------------------
// loadAllEpisodes (integration – uses real filesystem via temp directory)
// ---------------------------------------------------------------------------

describe('loadAllEpisodes', () => {
  let tmpDir: string;
  let originalCwd: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'transcript-integration-'));
    originalCwd = process.cwd();
    // loadAllEpisodes reads from CONTENT_DIR = '..', so we change cwd to a
    // subdirectory of the temp dir so that '..' points to our fixture content.
    const siteDir = path.join(tmpDir, 'site');
    fs.mkdirSync(siteDir);
    process.chdir(siteDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('returns an empty array when no year folders exist', async () => {
    // '..' (tmpDir) exists but has no year subfolders
    const { loadAllEpisodes } = await import('../content?t=' + Date.now());
    const episodes = await loadAllEpisodes();
    expect(Array.isArray(episodes)).toBe(true);
    expect(episodes.length).toBe(0);
  });

  it('loads paired transcript and summary files as episodes', async () => {
    const yearDir = path.join(tmpDir, '2024');
    fs.mkdirSync(yearDir);
    fs.writeFileSync(
      path.join(yearDir, '2024-03-10 - Test Podcast Episode_transcript_corrected.md'),
      '# Transcript content',
    );
    fs.writeFileSync(
      path.join(yearDir, '2024-03-10 - Test Podcast Episode_summary_corrected.md'),
      '# Summary content',
    );

    const { loadAllEpisodes } = await import('../content?t=' + Date.now());
    const episodes = await loadAllEpisodes();
    expect(episodes.length).toBe(1);
    expect(episodes[0].title).toBe('Test Podcast Episode');
    expect(episodes[0].year).toBe(2024);
    expect(episodes[0].slug).toMatch(/^2024-03-10-/);
  });

  it('skips incomplete episodes that are missing a paired file', async () => {
    const yearDir = path.join(tmpDir, '2024');
    fs.mkdirSync(yearDir);
    // Only the transcript – no matching summary
    fs.writeFileSync(
      path.join(yearDir, '2024-05-01 - Incomplete Episode_transcript_corrected.md'),
      '# Transcript only',
    );

    const { loadAllEpisodes } = await import('../content?t=' + Date.now());
    const episodes = await loadAllEpisodes();
    expect(episodes.length).toBe(0);
  });

  it('loads episodes from multiple year folders and sorts newest first', async () => {
    for (const [year, month, day] of [
      ['2023', '06', '01'],
      ['2024', '01', '15'],
    ]) {
      const yearDir = path.join(tmpDir, year);
      if (!fs.existsSync(yearDir)) fs.mkdirSync(yearDir);
      const base = `${year}-${month}-${day} - Episode ${year}`;
      fs.writeFileSync(path.join(yearDir, `${base}_transcript_corrected.md`), '# T');
      fs.writeFileSync(path.join(yearDir, `${base}_summary_corrected.md`), '# S');
    }

    const { loadAllEpisodes } = await import('../content?t=' + Date.now());
    const episodes = await loadAllEpisodes();
    expect(episodes.length).toBe(2);
    expect(episodes[0].year).toBe(2024);
    expect(episodes[1].year).toBe(2023);
  });
});
