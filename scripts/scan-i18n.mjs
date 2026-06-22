#!/usr/bin/env node
/* ============================================================
   Translation audit — lists visible text in index.html / events.html
   that is NOT wrapped in a [data-i18n] element, so untranslated copy can't
   sneak in. Brand/proper nouns and non-translatable tokens are filtered out.

   Run:  node scripts/scan-i18n.mjs
   A clean run prints "no untranslated text found" for each page. Anything it
   lists is either (a) copy you forgot to tag with data-i18n / route through
   t(), or (b) a new brand term to add to ALLOW below.

   Pair it with `node scripts/build-i18n.mjs`, which warns on data-i18n keys
   missing from i18n/id.json. See i18n/README.md.
   ============================================================ */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// Brand / proper nouns / codes that are intentionally NOT translated.
const ALLOW = [
  'Ubud Jungle', 'Ballers', 'UJB', 'King of', 'the', 'Jungle', 'King of the Jungle',
  'Welcome', 'to the', 'EST. 2026 · UBUD · BALI', 'EST. 2026 · UBUD · BALI · ID',
  'KING OF THE JUNGLE', 'KING OF THE JUNGLE · UBUD · BALI', 'SALAM HIJAU',
  'Liga Raya', 'Bali', 'BASILICO', 'Common Sense', 'Common Sense Trading', 'Futtos',
  'Vaniglia', 'EN', 'ID', 'GK', 'DEF', 'MID', 'FWD', 'ANY',
  'hello@ubudjungleballers.com', '!DOCTYPE html>',
];
const allow = new Set(ALLOW.map((s) => s.toLowerCase()));

function scan(file) {
  let html = readFileSync(join(ROOT, file), 'utf8')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<svg[\s\S]*?<\/svg>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');
  const out = [];
  const stack = [];
  let depth = 0; // >0 == inside a [data-i18n] subtree
  const re = /<\/?([a-zA-Z0-9]+)([^>]*?)\/?>|([^<]+)/g;
  let m;
  while ((m = re.exec(html))) {
    if (m[3] !== undefined) {
      const text = m[3].replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();
      if (depth === 0 && /[A-Za-z]{2,}/.test(text) && !allow.has(text.toLowerCase())) out.push(text);
      continue;
    }
    const tag = m[1].toLowerCase();
    const isVoid = /\/>$/.test(m[0]) || /^(img|input|br|hr|meta|link|source|area|col)$/.test(tag);
    if (m[0].startsWith('</')) {
      for (let s = stack.length - 1; s >= 0; s--) {
        if (stack[s].tag === tag) { if (stack[s].i18n) depth--; stack.splice(s, 1); break; }
      }
    } else if (!isVoid) {
      const i18n = /\bdata-i18n=/.test(m[2] || '');
      if (i18n) depth++;
      stack.push({ tag, i18n });
    }
  }
  return out;
}

let total = 0;
for (const f of ['index.html', 'events.html']) {
  const hits = scan(f);
  total += hits.length;
  if (!hits.length) console.log(`${f}: no untranslated text found ✓`);
  else {
    console.log(`${f}: ${hits.length} untagged string(s) — tag with data-i18n, route through t(), or add to ALLOW:`);
    for (const h of hits) console.log('  • ' + h);
  }
}
process.exit(total ? 1 : 0);
