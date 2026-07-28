// /blog/rss.xml — the publication feed. Items are the published record
// (drafts and future-dated entries excluded by the access helper),
// summarised by their standfirsts; links carry the canonical
// trailing-slash form against the configured site origin.
import rss from '@astrojs/rss';
import { getPublishedEntries } from '../../lib/content';
import { title, description } from '../../site';

export async function GET(context) {
  const entries = await getPublishedEntries();
  return rss({
    title,
    description,
    site: context.site,
    items: entries.map((entry) => ({
      title: entry.data.title,
      description: entry.data.standfirst,
      pubDate: entry.data.date,
      link: `/blog/${entry.id}/`,
    })),
  });
}
