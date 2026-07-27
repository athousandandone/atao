// Article composition the templates cannot reach: the MI end-mark
// belongs after the essay text and before the footnote apparatus
// (design 2b), but Sätteri appends its footnotes section inside the
// rendered content, so no template can place an element between them.
// The article layout therefore passes the entry's rendered HTML through
// this function. (Sätteri does not run rehype plugins — wiring them
// would swap the Markdown processor back to legacy unified — so the
// insertion works on the emitted HTML, matched against the Slice 2
// emission record: <section data-footnotes class="footnotes">.)

const MARK =
  '<img src="/blog/mi-plain.svg" alt="" class="end-mark" width="26" height="26">';

export function withEndMark(html) {
  const footnotes = html.search(/<section[^>]*\bdata-footnotes\b/);
  if (footnotes === -1) return `${html}\n${MARK}`;
  return `${html.slice(0, footnotes)}${MARK}\n${html.slice(footnotes)}`;
}
