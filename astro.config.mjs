// @ts-check
import { defineConfig } from 'astro/config';

// `site` is deliberately omitted until Slice 5: nothing in the foundation
// generates canonical URLs, so the origin enters the configuration where
// feeds and metadata first require it.
export default defineConfig({
  trailingSlash: 'always',
  // Emitted HTML is left uncompressed so that dist/index.html remains
  // structurally comparable to the hand-authored site/index.html, and so
  // generated markup stays inspectable line by line.
  compressHTML: false,
  markdown: {
    // Monochrome code is the design; no highlighting markup is emitted.
    // Build-time Shiki remains possible later, still zero-JS (§17).
    syntaxHighlight: false,
  },
});
