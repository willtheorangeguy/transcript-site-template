/**
 * Podcast Site Configuration
 * Customize this file for each podcast project
 */

export interface PodcastConfig {
  /** Podcast name displayed in header and metadata */
  name: string;
  /** Short description for SEO and homepage */
  description: string;
  /** Base URL for the site (used for canonical URLs) */
  siteUrl: string;
  /** YouTube channel ID for fetching video metadata */
  youtubeChannelId?: string;
  /** Number of latest episodes to show on homepage */
  latestEpisodesCount: number;
  /** Theme colors - customize per podcast */
  theme: {
    /** Primary brand color */
    primary: string;
    /** Secondary/accent color */
    secondary: string;
    /** Background color */
    background: string;
    /** Text color */
    text: string;
    /** Muted/secondary text color */
    textMuted: string;
    /** Card/surface background */
    surface: string;
    /** Border color */
    border: string;
  };
  /** Social media links */
  social: {
    youtube?: string;
    twitter?: string;
    instagram?: string;
    website?: string;
  };
  /** Navigation links (in addition to default Home, Episodes, Search) */
  extraNavLinks?: Array<{ label: string; href: string }>;
}

const config: PodcastConfig = {
  name: "My Podcast",
  description: "A podcast about interesting things",
  siteUrl: "https://example.com",
  youtubeChannelId: "", // Add your YouTube channel ID here
  latestEpisodesCount: 6,
  theme: {
    primary: "#3b82f6",
    secondary: "#1e40af",
    background: "#ffffff",
    text: "#1f2937",
    textMuted: "#6b7280",
    surface: "#f9fafb",
    border: "#e5e7eb",
  },
  social: {
    youtube: "",
    twitter: "",
  },
  extraNavLinks: [],
};

export default config;
