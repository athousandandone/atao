// Tag-slug helper tests (§12): slugging and collision behaviour verified
// directly, not by planting colliding content in the canonical collection.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { tagSlug, tagsBySlug } from '../../src/lib/tag-slug.ts';

const entry = (id, ...tags) => ({ id, data: { tags } });

test('tagSlug lowercases a single word', () => {
  assert.equal(tagSlug('Product'), 'product');
});

test('tagSlug hyphenates multi-word names', () => {
  assert.equal(tagSlug('Sourdough Baking'), 'sourdough-baking');
});

test('tagSlug collapses punctuation and repeated separators into one hyphen', () => {
  assert.equal(tagSlug('Food & Drink'), 'food-drink');
  assert.equal(tagSlug('  Odds --- Ends  '), 'odds-ends');
});

test('tagSlug folds diacritics to base letters', () => {
  assert.equal(tagSlug('Café Culture'), 'cafe-culture');
});

test('tagSlug refuses a name with no sluggable characters', () => {
  assert.throws(() => tagSlug('★☆'), /empty slug/);
});

test('tagsBySlug groups entries under their slugs, preserving order', () => {
  const a = entry('a', 'Food');
  const b = entry('b', 'Food', 'Travel');
  const c = entry('c', 'Travel');
  const groups = tagsBySlug([a, b, c]);
  assert.deepEqual([...groups.keys()], ['food', 'travel']);
  assert.equal(groups.get('food').name, 'Food');
  assert.deepEqual(
    groups.get('food').entries.map((e) => e.id),
    ['a', 'b'],
  );
  assert.deepEqual(
    groups.get('travel').entries.map((e) => e.id),
    ['b', 'c'],
  );
});

test('tagsBySlug ignores entries without tags', () => {
  const groups = tagsBySlug([entry('a'), entry('b', 'Food')]);
  assert.deepEqual([...groups.keys()], ['food']);
});

test('tagsBySlug throws when two display names collide on one slug', () => {
  assert.throws(
    () => tagsBySlug([entry('a', 'Food'), entry('b', 'food')]),
    /collision: "Food" and "food" both slug to "food"/,
  );
});
