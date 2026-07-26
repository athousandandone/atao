// verify:routes — build output completeness and integrity (§12).
//
// 1. Every expected route's file is present in dist/ (manifest below, grown
//    per slice) and non-empty.
// 2. No server or dynamic output exists (static output only).
// 3. Internal links and asset references in every HTML file (href, src,
//    srcset and friends) resolve to a file in dist/ (trailing-slash URLs
//    resolve to index.html). References that traverse outside dist/ fail
//    outright — the served site cannot reach above its root, so such a
//    reference is broken even if a repository file happens to sit at the
//    escaped path. External origins, fragments and non-fetching schemes
//    are out of scope here.

import {
  DIST,
  excerptAt,
  isElement,
  listFiles,
  nodeLine,
  parseHtmlFile,
  readText,
  runAsMain,
  srcsetUrls,
  textLines,
  walkNodes,
} from './lib.mjs';
import { existsSync, statSync } from 'node:fs';
import { join, posix } from 'node:path';

// Expected routes, grown per slice. Slice 1: homepage and 404 only.
const EXPECTED = ['index.html', '404.html'];

const SKIP_URL = /^(https?:)?\/\/|^(mailto|tel|data|javascript):|^#/i;
const URL_ATTRS = ['href', 'src', 'poster', 'data'];

function resolveTarget(url, htmlFile) {
  const clean = url.split('#')[0].split('?')[0];
  if (clean === '') return null; // pure fragment/query — same document
  const base = clean.startsWith('/') ? '' : posix.dirname(htmlFile);
  let target = posix.normalize(posix.join(base, clean.replace(/^\//, '')));
  if (clean.endsWith('/')) target = posix.join(target, 'index.html');
  return target;
}

export async function check() {
  const violations = [];
  const files = listFiles(DIST);

  for (const route of EXPECTED) {
    const path = join(DIST, route);
    if (!existsSync(path) || statSync(path).size === 0) {
      violations.push({ file: `${DIST}/${route}`, line: 0, pattern: 'expected route file missing or empty', excerpt: '', hint: 'the route manifest in scripts/checks/verify-routes.mjs lists every route the build must emit.' });
    }
  }

  if (existsSync(join(DIST, 'server'))) {
    violations.push({ file: `${DIST}/server`, line: 0, pattern: 'server output in a static build', excerpt: '', hint: 'output must remain fully static; no adapter or dynamic rendering is permitted.' });
  }

  for (const file of files.filter((f) => /\.html?$/i.test(f))) {
    const path = `${DIST}/${file}`;
    const lines = textLines(readText(path));
    for (const node of walkNodes(parseHtmlFile(path))) {
      if (!isElement(node)) continue;
      for (const attr of node.attrs ?? []) {
        const name = attr.name.toLowerCase();
        let urls;
        if (URL_ATTRS.includes(name)) urls = [attr.value.trim()];
        else if (name === 'srcset' || name === 'imagesrcset') urls = srcsetUrls(attr.value);
        else continue;
        for (const url of urls) {
          if (url === '' || SKIP_URL.test(url)) continue;
          let target = resolveTarget(url, file);
          if (target === null) continue;
          if (target === '..' || target.startsWith('../')) {
            violations.push({
              file: path,
              line: nodeLine(node),
              pattern: `reference escapes the site root (${name}="${url}")`,
              excerpt: excerptAt(lines, nodeLine(node)),
              hint: 'the served site cannot reach above dist/; the reference is broken regardless of what exists at the escaped path.',
            });
            continue;
          }
          // A directory target without a trailing slash still serves its index.
          if (existsSync(join(DIST, target)) && statSync(join(DIST, target)).isDirectory()) {
            target = posix.join(target, 'index.html');
          }
          if (!existsSync(join(DIST, target))) {
            violations.push({
              file: path,
              line: nodeLine(node),
              pattern: `unresolved internal reference (${name}="${url}" → ${target})`,
              excerpt: excerptAt(lines, nodeLine(node)),
              hint: 'every internal link and asset reference must resolve within dist/.',
            });
          }
        }
      }
    }
  }

  return { violations, advisories: [] };
}

runAsMain(import.meta.url, 'verify:routes', check);
