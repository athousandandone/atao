// Helper tests (§12): content-model logic is tested here, directly —
// not by planting bad fixtures in the canonical collection and not by
// scanning dist/. Run: node --test scripts/tests/*.test.mjs
// (Node ≥ 22.18 strips the .ts modules' types natively.)

import assert from "node:assert/strict";
import { test } from "node:test";
import { blogSchema } from "../../src/lib/schema.ts";
import {
  adjacentEntries,
  compareEntries,
  isPublished
} from "../../src/lib/publish.ts";

const valid = {
  title: "The Sourdough Loop",
  standfirst: "What a jar of flour and water teaches.",
  date: "2026-07-24"
};

test("schema accepts minimal valid frontmatter and applies defaults", () => {
  const parsed = blogSchema.parse(valid);
  assert.equal(parsed.title, "The Sourdough Loop");
  assert.ok(parsed.date instanceof Date);
  assert.equal(parsed.date.toISOString().slice(0, 10), "2026-07-24");
  assert.equal(parsed.draft, false); // default applied
  assert.equal(parsed.tags, undefined); // genuinely optional
});

test("schema accepts optional tags with display case preserved", () => {
  const parsed = blogSchema.parse({ ...valid, tags: ["Food"] });
  assert.deepEqual(parsed.tags, ["Food"]);
});

test("schema rejects missing title", () => {
  const { title, ...rest } = valid;
  assert.equal(blogSchema.safeParse(rest).success, false);
});

test("schema rejects empty standfirst", () => {
  assert.equal(
    blogSchema.safeParse({ ...valid, standfirst: "" }).success,
    false
  );
});

test("schema accepts a Date instance (unquoted YAML timestamp)", () => {
  const parsed = blogSchema.parse({
    ...valid,
    date: new Date("2026-07-24T00:00:00Z")
  });
  assert.equal(parsed.date.toISOString().slice(0, 10), "2026-07-24");
});

test("schema rejects an unparseable date", () => {
  assert.equal(
    blogSchema.safeParse({ ...valid, date: "not-a-date" }).success,
    false
  );
});

test("schema rejects date strings not in exact YYYY-MM-DD form", () => {
  assert.equal(
    blogSchema.safeParse({ ...valid, date: "24/07/2026" }).success,
    false
  );
  assert.equal(
    blogSchema.safeParse({ ...valid, date: "July 24, 2026" }).success,
    false
  );
  assert.equal(
    blogSchema.safeParse({ ...valid, date: "2026-7-4" }).success,
    false
  );
  assert.equal(
    blogSchema.safeParse({ ...valid, date: 1753000000000 }).success,
    false
  );
});

test("schema rejects impossible calendar dates authored as strings", () => {
  assert.equal(
    blogSchema.safeParse({ ...valid, date: "2026-02-30" }).success,
    false
  );
  assert.equal(
    blogSchema.safeParse({ ...valid, date: "2026-13-01" }).success,
    false
  );
});

test("string dates parse as UTC midnight, immune to build-machine time zone", () => {
  const parsed = blogSchema.parse(valid);
  assert.equal(parsed.date.toISOString(), "2026-07-24T00:00:00.000Z");
});

test("schema rejects non-string tags and empty tag strings", () => {
  assert.equal(blogSchema.safeParse({ ...valid, tags: [7] }).success, false);
  assert.equal(blogSchema.safeParse({ ...valid, tags: [""] }).success, false);
});

test("schema rejects a non-boolean draft flag", () => {
  assert.equal(blogSchema.safeParse({ ...valid, draft: "yes" }).success, false);
});

const now = new Date("2026-07-26T12:00:00Z");
const past = { date: new Date("2026-07-24T00:00:00Z"), draft: false };
const future = { date: new Date("2026-08-01T00:00:00Z"), draft: false };

test("drafts are never published, in any mode", () => {
  assert.equal(isPublished({ ...past, draft: true }, now, true), false);
  assert.equal(isPublished({ ...past, draft: true }, now, false), false);
});

test("future-dated entries are excluded from production builds only", () => {
  assert.equal(isPublished(future, now, true), false);
  assert.equal(isPublished(future, now, false), true); // dev and previews
});

test("past, non-draft entries publish in both modes", () => {
  assert.equal(isPublished(past, now, true), true);
  assert.equal(isPublished(past, now, false), true);
});

test("ordering is date descending", () => {
  const older = { id: "older", data: { date: new Date("2026-07-01") } };
  const newer = { id: "newer", data: { date: new Date("2026-07-20") } };
  assert.deepEqual([older, newer].sort(compareEntries), [newer, older]);
});

test("ordering ties on date break by slug, ascending, deterministically", () => {
  const date = new Date("2026-07-20");
  const a = { id: "autumn-notes", data: { date } };
  const b = { id: "bread-again", data: { date } };
  assert.deepEqual([b, a].sort(compareEntries), [a, b]);
  assert.deepEqual([a, b].sort(compareEntries), [a, b]);
});

// ---- prev/next adjacency (Slice 4) ----

test("adjacentEntries reads the ordered list as newest-first", () => {
  const ordered = [{ id: "newest" }, { id: "middle" }, { id: "oldest" }];
  assert.deepEqual(adjacentEntries(ordered, "middle"), {
    newer: { id: "newest" },
    older: { id: "oldest" }
  });
});

test("adjacentEntries returns null at the ends of the sequence", () => {
  const ordered = [{ id: "newest" }, { id: "oldest" }];
  assert.deepEqual(adjacentEntries(ordered, "newest"), {
    newer: null,
    older: { id: "oldest" }
  });
  assert.deepEqual(adjacentEntries(ordered, "oldest"), {
    newer: { id: "newest" },
    older: null
  });
});

test("adjacentEntries handles a single entry and an unknown id", () => {
  assert.deepEqual(adjacentEntries([{ id: "only" }], "only"), {
    newer: null,
    older: null
  });
  assert.deepEqual(adjacentEntries([{ id: "only" }], "absent"), {
    newer: null,
    older: null
  });
});
