// npm run verify — orchestrates every check in scripts/checks/ (§13).
// Runs all checks even after a failure so one run reports everything;
// exits non-zero if any check found a violation. A failure identifies
// which concern failed: scripting, self-containment, homepage
// preservation, routing, or feeds/metadata coherence.

import { existsSync } from "node:fs";
import { DIST, printFindings } from "./lib.mjs";
import { check as js } from "./verify-js.mjs";
import { check as selfContained } from "./verify-self-contained.mjs";
import { check as homepage } from "./verify-homepage.mjs";
import { check as routes } from "./verify-routes.mjs";
import { check as feeds } from "./verify-feeds.mjs";

if (!existsSync(DIST)) {
  console.error("verify: dist/ does not exist — run `npm run build` first.");
  process.exit(1);
}

const checks = [
  ["verify:js", js],
  ["verify:self-contained", selfContained],
  ["verify:homepage", homepage],
  ["verify:routes", routes],
  ["verify:feeds", feeds]
];

let failures = 0;
for (const [title, fn] of checks) {
  try {
    const { violations, advisories } = await fn();
    failures += printFindings(title, violations, advisories) ? 1 : 0;
  } catch (err) {
    console.error(`${title}: ERROR — ${err.message}`);
    failures += 1;
  }
}

if (failures) {
  console.error(`\nverify: ${failures} check(s) failed.`);
  process.exit(1);
}
console.log("\nverify: all checks passed.");
