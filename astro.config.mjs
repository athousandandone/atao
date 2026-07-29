// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { origin } from "./src/site.ts";

// `site` arrives in Slice 5, where canonical URLs, the feed and the
// sitemap first require an origin. The value lives in src/site.ts so
// templates, feed and configuration share one source.
export default defineConfig({
  site: origin,
  trailingSlash: "always",
  // Emitted HTML is left uncompressed so that dist/index.html remains
  // structurally comparable to the hand-authored site/index.html, and so
  // generated markup stays inspectable line by line.
  compressHTML: false,
  markdown: {
    // Monochrome code is the design; no highlighting markup is emitted.
    // Build-time Shiki remains possible later, still zero-JS (§17).
    syntaxHighlight: false
  },
  integrations: [sitemap()]
});
