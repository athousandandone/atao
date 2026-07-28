<!-- @format -->

# A Thousand And One

[_A Thousand And One_](https://athousandandone.co.uk) is an exploration of the idea that **everything is product**.

Software, AI, engineering, food, travel, literature, design, art and music may appear to be unrelated disciplines, but they all share the same underlying craft: observing the world, making something, learning from the result, and making it better. It is a journal of those observations—short notes, practical articles and longer essays that explore how better things are made.

This repository contains the source for the A Thousand And One website: an Astro static build (`src/` → `dist/`) carrying the homepage and the blog — statically generated, Markdown-first, semantic HTML, CSS-first, and free of browser JavaScript, with the build self-verifying those properties.

## Deployment

The site deploys on Netlify from this repository.

### Configuration

`netlify.toml` is authoritative:

- **Build command**: `npm run build && npm run verify` — every deploy runs the full verification suite (zero-JS, self-containment, homepage preservation, route integrity, feeds/metadata coherence) after building; a verification failure fails the deploy, so an unverified site cannot publish.
- **Publish directory**: `dist/`.
- **Node**: pinned by `.nvmrc` (22.22.3).

### Before the transition (gate snapshot, 2026-07-26)

Netlify published the hand-authored `site/` directory directly, with no build step, deploying on pushes to `main` that changed `./site/*`. The domain `athousandandone.co.uk` was already live on this configuration (apex canonical, www → apex, HTTPS). Snippet injection: none. The `netlify.toml` in this repository replaces the publish directory and adds the verified build; it involves no DNS or domain change.

### Rollback

Two independent paths, in escalation order:

1. **Instant — deploy restore**: in the Netlify UI, restore the last known-good deploy (the final `site/` deploy predating the transition), then **lock the published deploy** so subsequent automatic deploys cannot re-publish the failed configuration. Atomic deploys and `must-revalidate` HTML mean no cache-busting work.
2. **Durable — revert the commit**: revert the `netlify.toml` commit on `main`. Netlify's UI settings then publish the retained `site/` again, exactly as before the transition.

Either path re-404s `/blog/…` URLs and orphans any feed subscribers gained in the interim — accepted and stated plainly.

### Why `site/` is retained

`site/` remains in the repository after the transition. Its presence **is** the durable rollback target: reverting the configuration returns production to a directory that still exists and still matches what production served before the switch (`verify:homepage` continuously guards the equivalence of the generated homepage against it). Its removal is an optional, separate decision outside the migration programme.

## Verification

- `npm test` — helper unit tests (`node --test scripts/tests/*.test.mjs`).
- `npm run build` — Astro static build into `dist/`.
- `npm run verify` — all checks over `dist/`: `verify:js` (zero browser JavaScript), `verify:self-contained` (no third-party application resources), `verify:homepage` (preservation against `site/`), `verify:routes` (route manifest and reference integrity), `verify:feeds` (feed/sitemap/canonical URL-form coherence).

CI runs the same suite on every pull request; the Netlify build command runs it on every deploy.
