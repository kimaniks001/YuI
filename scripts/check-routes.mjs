#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');
const main = readFileSync(join(SRC, 'main.tsx'), 'utf8');
const routes = [...main.matchAll(/<Route\s+path="([^"]+)"/g)].map(match => match[1]);

const literalRefs = [];
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) { walk(full); continue; }
    if (!/\.(tsx|ts)$/.test(name)) continue;
    const text = readFileSync(full, 'utf8');
    const rel = relative(ROOT, full).replace(/\\/g, '/');
    const patterns = [
      /\bto="(\/[^"]*)"/g,
      /\bto='(\/[^']*)'/g,
      /navigate\(\s*["'](\/[^"']*)["']/g,
      /href="(\/[^"]*)"/g,
      /href='(\/[^']*)'/g,
    ];
    for (const pattern of patterns) {
      for (const match of text.matchAll(pattern)) {
        const before = text.slice(0, match.index ?? 0);
        literalRefs.push({ ref: match[1], file: rel, line: before.split('\n').length });
      }
    }
  }
}
walk(SRC);

const ignored = new Set([
  // Deliberately hostile path in Signup's return-path safety documentation/test comment.
  '/securelink/join/../../admin',
]);

function routeMatches(ref) {
  const path = ref.split('?')[0].split('#')[0];
  return routes.some(route => {
    if (route === '*') return false;
    const escaped = route
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/:[^/]+/g, '[^/]+')
      .replace(/\\\*/g, '.*');
    return new RegExp(`^${escaped}$`).test(path);
  });
}

const missing = literalRefs.filter(item => !ignored.has(item.ref) && !routeMatches(item.ref));
console.log('\n=== YuI route integrity ===');
console.log(`Registered routes: ${routes.length}`);
console.log(`Literal internal references inspected: ${literalRefs.length}`);
if (missing.length) {
  console.error(`Missing route targets: ${missing.length}`);
  for (const item of missing) console.error(` - ${item.file}:${item.line} -> ${item.ref}`);
  process.exit(1);
}
console.log('PASSED: no literal internal link/navigation target points to an unregistered route.\n');
