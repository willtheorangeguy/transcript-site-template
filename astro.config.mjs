// @ts-check
import { defineConfig } from 'astro/config';

// `SITE` and `BASE_PATH` are provided by the GitHub Pages deploy workflow
// (actions/configure-pages). For a project page they resolve to e.g.
// site = "https://user.github.io" and base = "/repo-name", so the site works
// correctly when served from a subpath. Locally they are unset and the site is
// served from the root.
const site = process.env.SITE || undefined;
const base = process.env.BASE_PATH || undefined;

// https://astro.build/config
export default defineConfig({
  site,
  base,
  output: 'static',
  build: {
    format: 'directory',
  },
  markdown: {
    shikiConfig: {
      theme: 'github-light',
    },
  },
});
