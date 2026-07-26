// verify:self-contained — no third-party application resources (§12, §13).
//
// A distinct policy, not derived from zero-JS: the site loads no third-party
// application resources — scripts (already banned by verify:js), stylesheets
// and fonts — from any external origin. Checked in HTML resource attributes,
// inline style content and CSS files (url(http…), @import url(http…),
// fonts.googleapis/gstatic, unpkg.com, any external origin).
//
// Anchor navigation links (<a href>) are exempt: they are navigation, not
// resource loads. Whether publication media (article images, embedded media)
// must always be hosted locally is a separate, later editorial decision —
// external media resources are therefore reported as ADVISORY, not failure;
// the prohibition is confirmed policy for application resources only.

import {
  DIST,
  excerptAt,
  isElement,
  listFiles,
  nodeLine,
  parseHtmlFile,
  readText,
  runAsMain,
  textLines,
  walkNodes,
} from './lib.mjs';

const EXTERNAL = /^(https?:)?\/\//i;

// element → attributes that load resources, with their policy class
const APPLICATION = {
  link: ['href'],
  script: ['src'],
  iframe: ['src'],
  embed: ['src'],
  object: ['data'],
  use: ['href', 'xlink:href'],
};
const MEDIA = {
  img: ['src', 'srcset'],
  source: ['src', 'srcset'],
  video: ['src', 'poster'],
  audio: ['src'],
  track: ['src'],
};

function srcsetUrls(value) {
  return value.split(',').map((part) => part.trim().split(/\s+/)[0]).filter(Boolean);
}

function attrUrls(name, value) {
  return name.startsWith('srcset') ? srcsetUrls(value) : [value.trim()];
}

function scanCssText(css, path, startLine, violations) {
  const lines = css.split(/\r?\n/);
  // @import is tested first; a line reported as an external @import is not
  // additionally reported for the url() inside the same statement.
  const patterns = [
    { re: /@import\s+(url\(\s*)?['"]?\s*((https?:)?\/\/[^'")\s;]+)/gi, what: 'external stylesheet via @import' },
    { re: /url\(\s*['"]?\s*((https?:)?\/\/[^'")\s]+)/gi, what: 'external resource in CSS url()' },
  ];
  lines.forEach((text, i) => {
    for (const { re, what } of patterns) {
      re.lastIndex = 0;
      if (re.test(text)) {
        violations.push({
          file: path,
          line: startLine + i,
          pattern: what,
          excerpt: text.trim().slice(0, 120),
          hint: 'application resources (stylesheets, fonts) must be self-hosted; no external origin may be loaded.',
        });
        break;
      }
    }
  });
}

function scanHtml(path, violations, advisories) {
  const lines = textLines(readText(path));
  const doc = parseHtmlFile(path);
  const finding = (node, pattern, hint) => ({
    file: path,
    line: nodeLine(node),
    pattern,
    excerpt: excerptAt(lines, nodeLine(node)),
    hint,
  });

  for (const node of walkNodes(doc)) {
    if (!isElement(node)) continue;
    const tag = node.tagName.toLowerCase();

    for (const attr of node.attrs ?? []) {
      const name = attr.name.toLowerCase();
      if ((APPLICATION[tag] ?? []).includes(name)) {
        for (const url of attrUrls(name, attr.value)) {
          if (EXTERNAL.test(url)) {
            violations.push(finding(node, `third-party application resource (<${tag} ${name}="${url}">)`,
              'application resources must be self-hosted; serve it from this origin or remove it.'));
          }
        }
      }
      if ((MEDIA[tag] ?? []).includes(name.split(' ')[0]) || (MEDIA[tag] ?? []).includes(name)) {
        for (const url of attrUrls(name, attr.value)) {
          if (EXTERNAL.test(url)) {
            advisories.push(finding(node, `external media resource (<${tag} ${name}>) — advisory`,
              'remote publication media policy is a later editorial decision (§12); flagged for awareness.'));
          }
        }
      }
      if (name === 'style') {
        scanCssText(attr.value, path, nodeLine(node), violations);
      }
    }

    if (tag === 'style') {
      const text = (node.childNodes ?? []).map((c) => c.value ?? '').join('');
      scanCssText(text, path, node.sourceCodeLocation?.startLine ?? 1, violations);
    }
  }
}

export async function check() {
  const violations = [];
  const advisories = [];
  for (const file of listFiles(DIST)) {
    const path = `${DIST}/${file}`;
    if (/\.html?$/i.test(file)) scanHtml(path, violations, advisories);
    else if (/\.css$/i.test(file)) scanCssText(readText(path), path, 1, violations);
  }
  return { violations, advisories };
}

runAsMain(import.meta.url, 'verify:self-contained', check);
