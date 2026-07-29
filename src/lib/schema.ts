/** @format */

import { z } from "astro/zod";

/** True only for a string that is a real calendar date in YYYY-MM-DD form. */
function isRealCalendarDate(value: string): boolean {
  const date = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

// The blog frontmatter schema (§6 of the migration plan) — the minimum that
// real needs justify. Kept in a plain module, importable by node:test, so
// invalid frontmatter rejection is provable without planting bad content in
// the canonical collection. Anticipated fields (updated, kicker, author) are
// added only when first needed; additive changes are cheap.
export const blogSchema = z.object({
  title: z.string().min(1),
  standfirst: z.string().min(1),
  // Authored as YYYY-MM-DD. An unquoted YAML date arrives here as a Date
  // instance (YAML's timestamp type) and is accepted as-is; a quoted string
  // is validated strictly — exact YYYY-MM-DD form and a real calendar date,
  // pinned to UTC so the civil date cannot drift with the build machine's
  // time zone. Known residual: an impossible unquoted date (2026-02-30) is
  // rolled over by the YAML parser before any schema can see it.
  date: z.union([
    z.date(),
    z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "date must be authored as YYYY-MM-DD")
      .refine(isRealCalendarDate, "date is not a real calendar date")
      .transform(value => new Date(`${value}T00:00:00Z`))
  ]),
  // Optional: a short observation may need no classification. Tag pages
  // derive only from tagged articles; display case is stored here.
  tags: z.array(z.string().min(1)).optional(),
  // Workflow safety from day one: drafts never reach any output.
  draft: z.boolean().default(false),
  image: z.string().min(1).optional(),
  imageAlt: z.string().min(1).optional()
});

export type BlogData = z.infer<typeof blogSchema>;
