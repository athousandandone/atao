import { z } from 'astro/zod';

// The blog frontmatter schema (§6 of the migration plan) — the minimum that
// real needs justify. Kept in a plain module, importable by node:test, so
// invalid frontmatter rejection is provable without planting bad content in
// the canonical collection. Anticipated fields (updated, kicker, author) are
// added only when first needed; additive changes are cheap.
export const blogSchema = z.object({
  title: z.string().min(1),
  standfirst: z.string().min(1),
  // Authored as YYYY-MM-DD; coerced to a Date for ordering and display.
  date: z.coerce.date(),
  // Optional: a short observation may need no classification. Tag pages
  // derive only from tagged articles; display case is stored here.
  tags: z.array(z.string().min(1)).optional(),
  // Workflow safety from day one: drafts never reach any output.
  draft: z.boolean().default(false),
});

export type BlogData = z.infer<typeof blogSchema>;
