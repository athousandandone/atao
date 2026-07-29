// Publication policy, kept pure so node:test can exercise it directly
// (astro:content is a virtual module and cannot be imported by the test
// runner). src/lib/content.ts applies these rules to the real collection.

interface PublishFields {
  date: Date;
  draft: boolean;
}

interface OrderFields {
  id: string;
  data: { date: Date };
}

/**
 * Whether an entry may appear in output. Drafts never appear. Future-dated
 * entries are excluded from production builds and included in dev and
 * previews (§6): exclusion is editorial policy; no scheduling automation
 * exists, so a future-dated article appears on the next production build
 * after its date.
 */
export function isPublished(
  data: PublishFields,
  now: Date,
  prod: boolean
): boolean {
  if (data.draft) return false;
  if (prod && data.date.getTime() > now.getTime()) return false;
  return true;
}

/** Canonical ordering: date descending, entry id (slug) as tie-break. */
export function compareEntries(a: OrderFields, b: OrderFields): number {
  const byDate = b.data.date.getTime() - a.data.date.getTime();
  if (byDate !== 0) return byDate;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

/**
 * Neighbours of an entry within the canonically ordered list (newest
 * first): `newer` is the entry published after it, `older` the one
 * before. The article page renders older as "Previous" and newer as
 * "Next" (design 2b reads the publication as a sequence).
 */
export function adjacentEntries<T extends { id: string }>(
  ordered: T[],
  id: string
): { newer: T | null; older: T | null } {
  const index = ordered.findIndex(entry => entry.id === id);
  if (index === -1) return { newer: null, older: null };
  return {
    newer: ordered[index - 1] ?? null,
    older: ordered[index + 1] ?? null
  };
}
