// Site-level values, introduced at first use. The byline arrived in
// Slice 4; the origin, title and description join in Slice 5 where
// feeds and metadata first require them.
//
// The origin is the production domain, ruled by the Editor 2026-07-28.
// It is already live, serving the hand-authored site/; the Netlify
// transition (Slice 6) switches the published directory to dist/ —
// no DNS change is involved.

export const byline = 'Oliver Matthews';
export const title = 'A Thousand And One';
export const origin = 'https://athousandandone.co.uk';
export const description =
  'Essays on the craft of making things — software, food, music and more. Everything is product.';
