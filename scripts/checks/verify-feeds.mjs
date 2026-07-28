// verify:feeds — machine-facing surfaces and URL-form coherence (§12,
// Slice 5). The named risk is URL-form drift between canonicals, feed
// and sitemap; every rule below pins the trailing-slash origin form.
//
// 1. robots.txt exists and its single `Sitemap:` line names the origin
//    form of a sitemap file that actually exists in dist/ — no assumed
//    filenames.
// 2. The sitemap index's referenced files exist; the union of their
//    <loc> URLs is exactly the emitted page set (every dist HTML file
//    except 404.html), each in origin + trailing-slash form.
// 3. The feed exists at blog/rss.xml; its channel link is the origin
//    root; every item link is an origin blog URL in trailing-slash form
//    resolving to an emitted article page; every emitted article page
//    appears in the feed (drafts and future-dated entries never reach
//    dist/, so feed equality inherits their exclusion).
// 4. Every blog HTML page carries exactly one title, one description
//    and one canonical (its own URL, trailing-slash form) with og:url
//    identical; 404.html carries title and description but no
//    canonical, claiming no address.

import { DIST, listFiles, parseHtmlFile, readText, runAsMain, walkNodes, isElement } from './lib.mjs';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { origin } from '../../src/site.ts';

// Emitted page URL for a dist HTML file, in canonical trailing-slash form.
function pageUrl(htmlFile) {
  return origin + '/' + htmlFile.replace(/index\.html$/, '').replace(/^\/$/, '');
}

function locs(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

export async function check() {
  const violations = [];
  const fail = (file, pattern, hint) =>
    violations.push({ file: `${DIST}/${file}`, line: 0, pattern, excerpt: '', hint });

  const htmlFiles = listFiles(DIST).filter((f) => /\.html$/i.test(f));
  const pages = htmlFiles.filter((f) => f !== '404.html');
  const articlePages = pages.filter(
    (f) => /^blog\/[^/]+\/index\.html$/.test(f) && !/^blog\/(archive|about|tags)\//.test(f),
  );

  // 1. robots.txt names an emitted sitemap file at the origin.
  let sitemapUrl = null;
  if (!existsSync(join(DIST, 'robots.txt'))) {
    fail('robots.txt', 'robots.txt missing from dist/', 'public/robots.txt should pass through the build.');
  } else {
    const sitemapLines = readText(join(DIST, 'robots.txt'))
      .split('\n')
      .filter((l) => /^sitemap:/i.test(l.trim()));
    if (sitemapLines.length !== 1) {
      fail('robots.txt', `expected exactly one Sitemap line, found ${sitemapLines.length}`, 'robots.txt carries a single Sitemap directive.');
    } else {
      sitemapUrl = sitemapLines[0].replace(/^\s*sitemap:\s*/i, '').trim();
      if (!sitemapUrl.startsWith(origin + '/')) {
        fail('robots.txt', `Sitemap URL "${sitemapUrl}" is not at the site origin ${origin}`, 'the Sitemap directive must use the configured origin.');
      } else if (!existsSync(join(DIST, sitemapUrl.slice(origin.length + 1)))) {
        fail('robots.txt', `Sitemap URL "${sitemapUrl}" names a file the build did not emit`, 'point the directive at the sitemap entry point as emitted — no assumed filenames.');
      }
    }
  }

  // 2. Sitemap coverage equals the emitted page set.
  const indexFile = 'sitemap-index.xml';
  if (!existsSync(join(DIST, indexFile))) {
    fail(indexFile, 'sitemap entry point missing from dist/', 'the sitemap integration should emit sitemap-index.xml.');
  } else {
    const parts = locs(readText(join(DIST, indexFile)));
    const urls = [];
    for (const part of parts) {
      if (!part.startsWith(origin + '/')) {
        fail(indexFile, `sitemap part "${part}" is not at the site origin`, 'sitemap URLs must use the configured origin.');
        continue;
      }
      const file = part.slice(origin.length + 1);
      if (!existsSync(join(DIST, file))) {
        fail(indexFile, `sitemap part "${part}" names a file the build did not emit`, 'every referenced sitemap file must exist.');
        continue;
      }
      urls.push(...locs(readText(join(DIST, file))));
    }
    const expected = new Set(pages.map(pageUrl));
    for (const url of urls) {
      if (!url.startsWith(origin + '/') || (!url.endsWith('/') && !url.endsWith('.html'))) {
        fail(indexFile, `sitemap URL "${url}" is not in origin trailing-slash form`, 'canonical form is origin + path + trailing slash.');
      }
      if (!expected.has(url)) {
        fail(indexFile, `sitemap lists "${url}" which is not an emitted page`, 'the sitemap must cover exactly the emitted routes (404 excluded).');
      }
    }
    for (const url of expected) {
      if (!urls.includes(url)) {
        fail(indexFile, `emitted page "${url}" is missing from the sitemap`, 'the sitemap must cover every expected route.');
      }
    }
  }

  // 3. Feed items are exactly the emitted article pages.
  const feedFile = 'blog/rss.xml';
  if (!existsSync(join(DIST, feedFile))) {
    fail(feedFile, 'feed missing from dist/', 'src/pages/blog/rss.xml.js should emit the feed.');
  } else {
    const xml = readText(join(DIST, feedFile));
    const links = [...xml.matchAll(/<link>([^<]+)<\/link>/g)].map((m) => m[1]);
    const [channelLink, ...itemLinks] = links;
    if (channelLink !== origin + '/') {
      fail(feedFile, `channel link "${channelLink}" is not the origin root`, `expected ${origin}/.`);
    }
    const expected = new Set(articlePages.map(pageUrl));
    for (const link of itemLinks) {
      if (!link.startsWith(origin + '/blog/') || !link.endsWith('/')) {
        fail(feedFile, `item link "${link}" is not in origin trailing-slash form`, 'feed links carry the canonical URL form.');
      }
      if (!expected.has(link)) {
        fail(feedFile, `feed lists "${link}" which is not an emitted article page`, 'feed items must be exactly the published articles.');
      }
    }
    for (const url of expected) {
      if (!itemLinks.includes(url)) {
        fail(feedFile, `emitted article "${url}" is missing from the feed`, 'every published article belongs in the feed.');
      }
    }
  }

  // 4. Per-page metadata: one title/description everywhere; one
  //    self-referential canonical (og:url identical) on blog pages;
  //    no canonical on the 404. The homepage remains a preserved port
  //    and is out of scope here.
  const metaScope = htmlFiles.filter((f) => f.startsWith('blog/') || f === '404.html');
  for (const file of metaScope) {
    const counts = { title: 0, description: 0, canonical: [], ogUrl: [] };
    for (const node of walkNodes(parseHtmlFile(`${DIST}/${file}`))) {
      if (!isElement(node)) continue;
      const attr = (name) => node.attrs?.find((a) => a.name === name)?.value;
      if (node.tagName === 'title') counts.title += 1;
      if (node.tagName === 'meta' && attr('name') === 'description') counts.description += 1;
      if (node.tagName === 'link' && attr('rel') === 'canonical') counts.canonical.push(attr('href'));
      if (node.tagName === 'meta' && attr('property') === 'og:url') counts.ogUrl.push(attr('content'));
    }
    if (counts.title !== 1) fail(file, `expected exactly one <title>, found ${counts.title}`, 'every page carries one title.');
    if (counts.description !== 1) fail(file, `expected exactly one meta description, found ${counts.description}`, 'every page carries one description.');
    if (file === '404.html') {
      if (counts.canonical.length !== 0 || counts.ogUrl.length !== 0) {
        fail(file, 'the 404 must not claim a canonical or og:url', 'an error page has no canonical address.');
      }
    } else {
      const expected = pageUrl(file);
      if (counts.canonical.length !== 1 || counts.canonical[0] !== expected) {
        fail(file, `expected one canonical "${expected}", found [${counts.canonical.join(', ')}]`, 'each blog page canonicalises to its own trailing-slash URL.');
      }
      if (counts.ogUrl.length !== 1 || counts.ogUrl[0] !== expected) {
        fail(file, `expected one og:url "${expected}", found [${counts.ogUrl.join(', ')}]`, 'og:url matches the canonical exactly.');
      }
    }
  }

  return { violations, advisories: [] };
}

runAsMain(import.meta.url, 'verify:feeds', check);
