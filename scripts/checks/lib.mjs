// Shared helpers for the verification checks under scripts/checks/.
// These checks inspect generated output (dist/) only; they never ship.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parse } from 'parse5';

export const DIST = 'dist';
export const SITE = 'site';

/** Recursively list files under root, returned as root-relative POSIX paths. */
export function listFiles(root) {
  const out = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir).sort()) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) walk(full);
      else out.push(relative(root, full).split(sep).join('/'));
    }
  };
  walk(root);
  return out;
}

export function readText(path) {
  return readFileSync(path, 'utf8');
}

export function textLines(text) {
  return text.split(/\r?\n/);
}

export function excerptAt(lines, line) {
  return (lines[line - 1] ?? '').trim().slice(0, 120);
}

/** Parse an HTML (or SVG-as-HTML) file with source locations retained. */
export function parseHtmlFile(path) {
  return parse(readText(path), { sourceCodeLocationInfo: true });
}

/** Depth-first walk over every node, including <template> contents. */
export function* walkNodes(node) {
  yield node;
  for (const child of node.childNodes ?? []) yield* walkNodes(child);
  if (node.content) yield* walkNodes(node.content);
}

export function isElement(node) {
  return typeof node.tagName === 'string';
}

export function getAttr(node, name) {
  return (node.attrs ?? []).find((a) => a.name.toLowerCase() === name)?.value;
}

export function nodeLine(node) {
  return node.sourceCodeLocation?.startLine ?? 0;
}

/**
 * A violation: { file, line, pattern, excerpt, hint }.
 * Prints in the agreed format: path:line — pattern — excerpt, plus a hint.
 */
export function printFindings(title, violations, advisories = []) {
  const format = ({ file, line, pattern, excerpt, hint }) =>
    `  ${file}${line ? `:${line}` : ''} — ${pattern}${excerpt ? ` — ${excerpt}` : ''}` +
    (hint ? `\n    hint: ${hint}` : '');
  if (violations.length === 0) {
    console.log(`${title}: pass${advisories.length ? ` (${advisories.length} advisory)` : ''}`);
  } else {
    console.error(`${title}: FAIL — ${violations.length} violation(s)`);
    for (const v of violations) console.error(format(v));
  }
  for (const a of advisories) console.log(`  advisory: ${format(a).trim()}`);
  return violations.length;
}

/** Run a check module directly: node scripts/checks/<name>.mjs */
export function runAsMain(metaUrl, title, checkFn) {
  if (process.argv[1] && metaUrl === pathToFileURL(process.argv[1]).href) {
    Promise.resolve(checkFn())
      .then(({ violations, advisories }) => {
        process.exitCode = printFindings(title, violations, advisories) ? 1 : 0;
      })
      .catch((err) => {
        console.error(`${title}: ERROR — ${err.message}`);
        process.exitCode = 1;
      });
  }
}
