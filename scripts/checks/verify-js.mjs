// verify:js — zero executable browser JavaScript in generated output (§13).
//
// Fails on, each classified precisely in its own category:
//   1. Browser JavaScript files: *.js, *.mjs, *.cjs under dist/.
//   2. Prohibited generated artefacts: source maps (*.map — evidence of an
//      unexpected toolchain path); WebAssembly (*.wasm — an unexpected
//      browser runtime artefact; never expected, listed so it can never
//      arrive unclassified).
//   3. In every HTML file (parsed with parse5): <script> elements classified
//      as executable browser JavaScript, module-resolution configuration
//      (importmap), or unapproved non-executable data script; astro-island
//      elements; rel="modulepreload"; inline event-handler attributes
//      (parser-verified as attributes); javascript: URLs.
//   4. In every SVG (SVG can script): <script>, event-handler attributes,
//      javascript: URLs.
//
// Permitted exceptions at launch: none. data-astro-cid-* attributes are
// CSS scoping, not runtime, and are untouched by these rules.

import {
  DIST,
  excerptAt,
  getAttr,
  isElement,
  listFiles,
  nodeLine,
  parseHtmlFile,
  readText,
  runAsMain,
  textLines,
  walkNodes,
} from './lib.mjs';

const JS_MIME = new Set([
  '',
  'module',
  'text/javascript',
  'application/javascript',
  'application/ecmascript',
  'text/ecmascript',
  'text/jscript',
]);

const URL_ATTRS = ['href', 'xlink:href', 'src', 'action', 'formaction', 'data'];

function classifyScript(node) {
  const type = (getAttr(node, 'type') ?? '').trim().toLowerCase();
  if (type === 'importmap') {
    return {
      pattern: 'module-resolution configuration (importmap <script>)',
      hint: 'importmaps configure browser module loading and are prohibited; no browser JavaScript may ship.',
    };
  }
  if (JS_MIME.has(type) || getAttr(node, 'src') !== undefined) {
    return {
      pattern: `executable browser JavaScript (<script${type ? ` type="${type}"` : ''}${getAttr(node, 'src') !== undefined ? ' src' : ''}>)`,
      hint: 'no executable browser JavaScript may ship; remove the script or the mechanism emitting it.',
    };
  }
  return {
    pattern: `unapproved non-executable data script (<script type="${type}">)`,
    hint: 'data scripts (e.g. application/ld+json) are prohibited by default; an exception requires an Editor-ruled allowlist entry.',
  };
}

function scanMarkup(file, path, violations) {
  const lines = textLines(readText(path));
  const doc = parseHtmlFile(path);
  const add = (node, pattern, hint) =>
    violations.push({ file: path, line: nodeLine(node), pattern, excerpt: excerptAt(lines, nodeLine(node)), hint });

  for (const node of walkNodes(doc)) {
    if (!isElement(node)) continue;
    const tag = node.tagName.toLowerCase();

    if (tag === 'script') {
      const { pattern, hint } = classifyScript(node);
      add(node, pattern, hint);
    }
    if (tag === 'astro-island') {
      add(node, 'astro-island element (island hydration)', 'a client:* directive or framework integration produced hydration output; none is permitted.');
    }
    if (tag === 'link') {
      const rel = (getAttr(node, 'rel') ?? '').toLowerCase().split(/\s+/);
      if (rel.includes('modulepreload')) {
        add(node, 'rel="modulepreload" (module preloading)', 'module preloading only exists to serve executable modules; none may ship.');
      }
    }
    for (const attr of node.attrs ?? []) {
      const name = attr.name.toLowerCase();
      if (/^on[a-z]+$/.test(name)) {
        add(node, `inline event-handler attribute (${name})`, 'event-handler attributes are executable JavaScript; remove them.');
      }
      if (URL_ATTRS.includes(name) && attr.value.replace(/[\s\u0000-\u0020]+/g, '').toLowerCase().startsWith('javascript:')) {
        add(node, `javascript: URL in ${name}`, 'javascript: URLs are executable; use a real target.');
      }
    }
  }
}

export async function check() {
  const violations = [];
  for (const file of listFiles(DIST)) {
    const path = `${DIST}/${file}`;
    if (/\.(js|mjs|cjs)$/i.test(file)) {
      violations.push({ file: path, line: 0, pattern: 'browser JavaScript file', excerpt: '', hint: 'no JavaScript files may exist in generated output.' });
    } else if (/\.map$/i.test(file)) {
      violations.push({ file: path, line: 0, pattern: 'source map — evidence of an unexpected toolchain path', excerpt: '', hint: 'no source maps are expected; find what emitted it.' });
    } else if (/\.wasm$/i.test(file)) {
      violations.push({ file: path, line: 0, pattern: 'WebAssembly — an unexpected browser runtime artefact', excerpt: '', hint: 'no browser runtime artefacts are expected; find what emitted it.' });
    } else if (/\.html?$/i.test(file) || /\.svg$/i.test(file)) {
      scanMarkup(file, path, violations);
    }
  }
  return { violations, advisories: [] };
}

runAsMain(import.meta.url, 'verify:js', check);
