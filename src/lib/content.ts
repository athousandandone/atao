import { getCollection } from 'astro:content';
import { compareEntries, isPublished } from './publish';

/**
 * The sole access path for publishable blog entries (§6): draft and
 * future-date filtering live here, making the policy structural rather than
 * conventional. Templates never call getCollection('blog') directly —
 * enforced as a review invariant.
 */
export async function getPublishedEntries() {
  const entries = await getCollection('blog');
  const now = new Date();
  return entries
    .filter((entry) => isPublished(entry.data, now, import.meta.env.PROD))
    .sort(compareEntries);
}
