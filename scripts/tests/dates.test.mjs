// Display-date helpers: en-GB forms, pinned to UTC so the displayed day
// never drifts in a non-UTC build environment.
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  formatDateShort,
  formatDateLong,
  isoDay
} from "../../src/lib/dates.ts";

const june9 = new Date("2026-06-09T00:00:00Z");
const july12 = new Date("2026-07-12T00:00:00Z");

test("short form pads the day and abbreviates the month", () => {
  assert.equal(formatDateShort(june9), "09 Jun 2026");
  assert.equal(formatDateShort(july12), "12 Jul 2026");
});

test("long form uses an unpadded day and the full month", () => {
  assert.equal(formatDateLong(june9), "9 June 2026");
  assert.equal(formatDateLong(july12), "12 July 2026");
});

test("isoDay returns the YYYY-MM-DD day", () => {
  assert.equal(isoDay(june9), "2026-06-09");
});

test("a UTC-midnight date displays as the same civil day, not the day before", () => {
  // In any zone west of UTC a naive local format would render 8 June.
  assert.equal(formatDateLong(new Date("2026-06-09T00:00:00Z")), "9 June 2026");
  assert.equal(isoDay(new Date("2026-06-09T00:00:00Z")), "2026-06-09");
});
