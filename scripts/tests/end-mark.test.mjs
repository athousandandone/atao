// The MI end-mark placement: inserted before the footnotes section when
// one exists, appended at the end when none does.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { withEndMark } from '../../src/lib/end-mark.mjs';

const MARK = '<img src="/blog/mi-plain.svg" alt="" class="end-mark" width="26" height="26">';

test('with footnotes, the mark sits between the text and the footnotes section', () => {
  const html = '<p>Essay.</p>\n<section data-footnotes class="footnotes"><ol></ol></section>';
  const out = withEndMark(html);
  assert.ok(out.indexOf(MARK) > out.indexOf('<p>Essay.</p>'));
  assert.ok(out.indexOf(MARK) < out.indexOf('<section data-footnotes'));
});

test('without footnotes, the mark closes the article', () => {
  const out = withEndMark('<p>Essay.</p>');
  assert.ok(out.endsWith(MARK));
});

test('an ordinary section without the data-footnotes attribute is not an insertion point', () => {
  const html = '<section><p>Not footnotes.</p></section>';
  const out = withEndMark(html);
  assert.ok(out.endsWith(MARK));
});

test('the mark is decorative: empty alt, site-root src', () => {
  assert.match(MARK, /alt=""/);
  assert.match(MARK, /src="\/blog\/mi-plain\.svg"/);
});
