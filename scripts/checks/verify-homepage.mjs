// verify:homepage — homepage preservation (§12). Its own command with its
// own failure messages, separate from scripting concerns.
//
// 1. Passthrough files (app.css, site.webmanifest, images/*) must be
//    byte-identical to their site/ counterparts.
// 2. dist/index.html vs site/index.html by normalised structural comparison
//    (tags, attributes, text; whitespace-insensitive). Differences fail
//    unless on the exception list below — deterministic Astro serialisation
//    differences only, each documented with its reason, established in the
//    Slice 1 PR and never grown casually.
//
// Exception list (Slice 1):
//   E1  Doctype case and position: Astro emits an uppercase <!DOCTYPE html>
//       as the first bytes; the source file has lowercase <!doctype html>
//       after the <!-- @format --> comment. Handled by comparing the doctype
//       by name only and comparing remaining document children in order.
//   E2  Void elements lose the XML-style " />" (e.g. <meta charset="utf-8">).
//       HTML-equivalent serialisation; invisible to a spec parser.
//   E3  Multi-line attribute wrapping collapses to single-line tags.
//       Intra-tag whitespace; invisible to a spec parser.
//   E4  Indentation and inter-node whitespace differ; the comparison is
//       whitespace-insensitive per §12.
//   E5  The generated file has no trailing newline. Whitespace-only.
//
// Approved additions (Slice 5.1, Editor's ruling 2026-07-28):
//   E6  The section nav beneath the logotype (nav.home-nav) and the
//       stylesheet Astro emits for it (an inlined <style>, or a <link>
//       into /_astro/ above the inlining threshold). These nodes are
//       pruned from the dist tree before comparison; everything else
//       must still match site/. The nav's link targets are verified by
//       verify:routes, not here.
//
// Byte identity of index.html is a migration aid, not the definition (§12).

import {
  DIST,
  SITE,
  isElement,
  listFiles,
  parseHtmlFile,
  runAsMain,
} from './lib.mjs';
import { existsSync, readFileSync } from 'node:fs';

const PASSTHROUGH = ['app.css', 'site.webmanifest'];

function bytesEqual(a, b) {
  return existsSync(a) && existsSync(b) && readFileSync(a).equals(readFileSync(b));
}

/**
 * Normalise a parse5 node into a comparable structure: element name, sorted
 * attributes, whitespace-collapsed text, comments. Whitespace-only text
 * nodes are dropped (E4); doctype nodes are handled separately (E1).
 */
function normalise(node) {
  if (node.nodeName === '#text') {
    const text = node.value.replace(/\s+/g, ' ').trim();
    return text ? { text } : null;
  }
  if (node.nodeName === '#comment') {
    return { comment: node.data.trim() };
  }
  if (isElement(node) || node.nodeName === '#document') {
    const children = (node.childNodes ?? [])
      .filter((c) => c.nodeName !== '#documentType')
      .map(normalise)
      .filter(Boolean);
    if (node.nodeName === '#document') return { document: children };
    return {
      tag: node.tagName.toLowerCase(),
      attrs: (node.attrs ?? [])
        .map((a) => [a.name.toLowerCase(), a.value])
        .sort((x, y) => (x[0] < y[0] ? -1 : 1)),
      children,
    };
  }
  return null;
}

function describe(node) {
  if (!node) return '(absent)';
  if (node.text !== undefined) return `text "${node.text.slice(0, 60)}"`;
  if (node.comment !== undefined) return `comment "${node.comment.slice(0, 60)}"`;
  if (node.tag) return `<${node.tag}${node.attrs.map(([n, v]) => ` ${n}="${v}"`).join('')}>`;
  return 'document';
}

function compare(a, b, path, diffs) {
  if (!a || !b || JSON.stringify(a) === JSON.stringify(b)) {
    if ((a === null) !== (b === null)) diffs.push({ path, a: describe(a), b: describe(b) });
    return;
  }
  const aKids = a.document ?? a.children ?? [];
  const bKids = b.document ?? b.children ?? [];
  const shallowA = { ...a, children: undefined, document: undefined };
  const shallowB = { ...b, children: undefined, document: undefined };
  if (JSON.stringify(shallowA) !== JSON.stringify(shallowB)) {
    diffs.push({ path, a: describe(a), b: describe(b) });
    return;
  }
  const max = Math.max(aKids.length, bKids.length);
  for (let i = 0; i < max; i++) {
    const childPath = `${path} > ${describe(aKids[i] ?? bKids[i])}[${i}]`;
    if (!aKids[i] || !bKids[i]) {
      diffs.push({ path: childPath, a: describe(aKids[i]), b: describe(bKids[i]) });
    } else {
      compare(aKids[i], bKids[i], childPath, diffs);
    }
  }
}

function getDoctype(doc) {
  return (doc.childNodes ?? []).find((n) => n.nodeName === '#documentType');
}

/** E6: true for a normalised node the ruling permits dist to add. */
function isApprovedAddition(node) {
  if (!node?.tag) return false;
  if (node.tag === 'style') return true;
  if (node.tag === 'link') {
    return node.attrs.some(([name, value]) => name === 'href' && value.startsWith('/_astro/'));
  }
  if (node.tag === 'nav') {
    return node.attrs.some(
      ([name, value]) => name === 'class' && value.split(/\s+/).includes('home-nav'),
    );
  }
  return false;
}

/** E6: strip approved additions from the dist tree before comparing. */
function pruneApproved(node) {
  const kids = node.document ?? node.children;
  if (!kids) return node;
  const filtered = kids.filter((c) => !isApprovedAddition(c)).map(pruneApproved);
  return node.document ? { document: filtered } : { ...node, children: filtered };
}

export async function check() {
  const violations = [];
  const hint = 'the homepage must remain equivalent to site/; fix the port or the passthrough, never site/ itself (sanctioned homepage fixes land on main as ordinary reviewed changes).';

  // 1. Passthrough byte identity.
  const images = listFiles(`${SITE}/images`).filter((f) => !f.split('/').pop().startsWith('.'));
  const pairs = [
    ...PASSTHROUGH.map((f) => [`${SITE}/${f}`, `${DIST}/${f}`]),
    ...images.map((f) => [`${SITE}/images/${f}`, `${DIST}/images/${f}`]),
  ];
  for (const [src, out] of pairs) {
    if (!bytesEqual(src, out)) {
      violations.push({ file: out, line: 0, pattern: `passthrough file not byte-identical to ${src}`, excerpt: '', hint });
    }
  }

  // 2. Structural equivalence of the homepage document.
  const siteDoc = parseHtmlFile(`${SITE}/index.html`);
  const distDoc = parseHtmlFile(`${DIST}/index.html`);

  const siteDt = getDoctype(siteDoc);
  const distDt = getDoctype(distDoc);
  if (!siteDt || !distDt || siteDt.name.toLowerCase() !== distDt.name.toLowerCase()) {
    violations.push({
      file: `${DIST}/index.html`, line: 1,
      pattern: `doctype mismatch (site: ${siteDt?.name ?? 'none'}, dist: ${distDt?.name ?? 'none'})`,
      excerpt: '', hint,
    });
  }

  const diffs = [];
  compare(normalise(siteDoc), pruneApproved(normalise(distDoc)), 'document', diffs);
  for (const d of diffs) {
    violations.push({
      file: `${DIST}/index.html`, line: 0,
      pattern: `structural difference at ${d.path}`,
      excerpt: `site: ${d.a} | dist: ${d.b}`,
      hint,
    });
  }

  return { violations, advisories: [] };
}

runAsMain(import.meta.url, 'verify:homepage', check);
