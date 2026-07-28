// Site-level values, introduced at first use. The byline arrived in
// Slice 4; the origin, title and description join in Slice 5 where
// feeds and metadata first require them.
//
// The origin is the intended production domain. It is registered but
// still parked at the registrar; DNS moves at the Netlify transition
// (Slice 6) — stated assumption, confirmed at review.

export const byline = 'Oliver Matthews';
export const title = 'A Thousand And One';
export const origin = 'https://atao.co.uk';
export const description =
  'Essays on the craft of making things — software, food, travel and more. Everything is product.';
