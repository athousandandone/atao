<!-- @format -->

# A Thousand And One — Design System

Editorial identity and CSS design system for **athousandandone.co.uk** — a blog by Oliver Matthews exploring the idea that _everything is product_: software, AI, engineering, food, travel, literature, design, art, music.

**MI** is the brand device: 1001 in roman numerals. It is an _identifier_, not a logo — favicon, avatars, watermark, footer mark, end-of-article mark. The primary identity is always the **A Thousand And One** wordmark (set in Cormorant Garamond, with a swash A).

Sources: site at http://athousandandone.co.uk (currently a holding page with the wordmark); ident files supplied by the owner (`assets/wordmark.png`, `assets/mi.svg`, `assets/mi-reverse.svg`). A fully vectorised wordmark is pending from the owner — `assets/wordmark.svg` is missing its swash A; prefer `wordmark.png` until then.

Reference designs: `Blog Explorations.dc.html` — option **2a** (index) and **2b** (article) are the approved directions.

## Positioning

A publication first, a website second. Think _The Gentleman's Journal_ × _Delayed Gratification_ × Craig Mod: reading over navigation, typography over decoration, longevity over trends. Calm, confident, understated.

## Content fundamentals

- First person singular, wry and precise. Engineering vocabulary applied lovingly to non-engineering subjects ("a starter is a feedback system you can eat").
- British English. Sentence case everywhere except the mono apparatus (metadata, labels), which is uppercase and letterspaced.
- No emoji, ever. Typographic symbols carry the load: → ↩ ☾ · ···
- Formats: observations (200–500 words), articles (800–1,500), features (2,000–4,000). The design must be elegant when a post is nothing but paragraphs.
- Content is authored in Markdown, rendered to semantic HTML, styled by `prose.css`. Semantic elements are first-class: blockquote, figure/figcaption, aside, table, code/pre, ol/ul/dl, details, sup footnotes.
- Roman numerals as brand flavour: years (MMXXVI), volume lines.

## Visual foundations

- **Colour**: warm paper (#fefbf8) and warm ink (#17130e). One accent — "rubric" red (oklch 0.48 0.13 29), after manuscript rubrication — reserved for links, tags, kickers. Never backgrounds.
- **Type**: Cormorant Garamond (display, matches logotype), EB Garamond (body — sturdier at reading sizes), IBM Plex Mono (apparatus: metadata, captions, tags, code). Weights 400/500 only. Full scale in `tokens/typography.css`.
- **Rules do the decorating**: hairlines (12% ink), strong rules (solid ink), twin hairlines, double rules, dotted leaders. No shadows, no rounded corners, no gradients.
- **Layout**: 640px reading measure; sidenotes hang in a 300px right gutter (column sits left of centre); 860px breakout figures. Generous rhythm: 26px paragraphs, 64px sections.
- **Ornament**: drop cap on the opening paragraph; ··· section breaks; MI end-mark closes every article.
- **Motion**: none to speak of. Hover = colour change only (muted → ink, or link → ink). No transitions needed; if used, opacity/color 150ms ease.
- **Imagery**: occasional, editorial, full-column or breakout width, always in a `<figure>` with a mono `Fig. n` caption. Pre-publication: striped `.placeholder`.

## Iconography

No icon set. Unicode/typographic glyphs only: ☾ (theme toggle), → (read on), ← (previous), ↩ (footnote return), · (separators), ··· (section break). MI device for all avatar/favicon duties. Never introduce icon fonts or SVG icon libraries.

## Index

- `styles.css` — entry point (imports everything below)
- `tokens/` — colors.css, typography.css, spacing.css, fonts.css
- `base.css` — page scaffold, links, selection
- `prose.css` — the Markdown article stylesheet (the heart of the system)
- `components.css` — dateline, masthead, nav, featured entry, post entries, article header/body, prev/next, footer, placeholder
- `assets/` — wordmark.png (bitmap, current source of truth), wordmark.svg (incomplete — swash A missing), mi.svg, mi-plain.svg, mi-reverse.svg
- `guidelines/` — specimen cards (Design System tab)
- `Blog Explorations.dc.html` — approved reference designs (2a, 2b)

## Caveats / intentional choices

- Fonts are Google-hosted via `tokens/fonts.css`; swap to self-hosted `@font-face` for production longevity.
- No React component library: the site build is Markdown → HTML + CSS, so the system is CSS-first by design.
