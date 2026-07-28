// Tag-route slugs: lowercase-hyphen forms derived from display names.
// Pure and node-importable — slugging and collision behaviour are tested
// directly (scripts/tests/tag-slug.test.mjs), never by planting colliding
// content in the canonical collection.

/** Lowercase-hyphen slug of a tag's display name. Diacritics fold to
 * their base letters; every other non-alphanumeric run becomes a single
 * hyphen. A name with no sluggable characters cannot form a route and
 * is a content defect, so it throws rather than yielding an empty slug. */
export function tagSlug(name: string): string {
  const slug = name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (slug === '') {
    throw new Error(`tag "${name}" yields an empty slug and cannot form a route`);
  }
  return slug;
}

export interface TagGroup<T> {
  name: string;
  entries: T[];
}

/** Groups entries by tag slug, preserving the entries' given order within
 * each group. Two distinct display names slugging identically would merge
 * unrelated tags into one route silently — that is a build defect, so a
 * collision throws with both names. */
export function tagsBySlug<T extends { data: { tags?: string[] } }>(
  entries: T[],
): Map<string, TagGroup<T>> {
  const groups = new Map<string, TagGroup<T>>();
  for (const entry of entries) {
    for (const name of entry.data.tags ?? []) {
      const slug = tagSlug(name);
      const group = groups.get(slug);
      if (!group) {
        groups.set(slug, { name, entries: [entry] });
      } else if (group.name !== name) {
        throw new Error(
          `tag slug collision: "${group.name}" and "${name}" both slug to "${slug}"`,
        );
      } else {
        group.entries.push(entry);
      }
    }
  }
  return groups;
}
