#!/usr/bin/env node
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, normalize, relative, resolve } from 'node:path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');

const ENTRYPOINTS = [
  'src/pages/Home.tsx',
  'src/pages/SignIn.tsx',
  'src/pages/Signup.tsx',
  'src/pages/KSActivation.tsx',
  'src/pages/CreateJourney.tsx',
  'src/pages/AgreementDetailWorkspace.tsx',
  'src/pages/SecurePayHome.tsx',
  'src/pages/MyMarket.tsx',
  'src/pages/MarketFlows.tsx',
  'src/pages/MarketStatements.tsx',
  'src/pages/TraderAgreements.tsx',
  'src/pages/TraderActionCentre.tsx',
  'src/pages/MoneySpace.tsx',
  'src/pages/TraderCommunity.tsx',
  'src/pages/TraderSettings.tsx',
  'src/pages/DeveloperJourney.tsx',
  'src/pages/SecureLinkJoin.tsx',
  'src/pages/PublicGroupSecureLink.tsx',
];

const FORBIDDEN = [
  { pattern: /@supabase\/supabase-js/, reason: 'imports Supabase client package' },
  { pattern: /(?:\.\.\/|\.\/)lib\/supabase/, reason: 'imports legacy Supabase adapter' },
  { pattern: /VITE_SUPABASE_/, reason: 'reads Supabase runtime environment variable' },
  { pattern: /functions\/v1\//, reason: 'calls a Supabase Edge Function directly' },
];

function resolveLocal(fromFile, specifier) {
  if (!specifier.startsWith('.')) return null;
  const base = resolve(dirname(fromFile), specifier);
  const candidates = extname(base)
    ? [base]
    : [base, `${base}.ts`, `${base}.tsx`, `${base}.js`, `${base}.jsx`, join(base, 'index.ts'), join(base, 'index.tsx')];
  return candidates.find(candidate => existsSync(candidate) && statSync(candidate).isFile()) ?? null;
}

const visited = new Set();
const violations = [];
function visit(file) {
  const full = normalize(file);
  if (visited.has(full) || !full.startsWith(SRC)) return;
  visited.add(full);
  const content = readFileSync(full, 'utf8');
  const rel = relative(ROOT, full).replace(/\\/g, '/');
  for (const rule of FORBIDDEN) if (rule.pattern.test(content)) violations.push(`${rel}: ${rule.reason}`);
  for (const match of content.matchAll(/(?:import\s+(?:[^'\"]+?\s+from\s+)?|export\s+[^'\"]*?from\s+)['\"]([^'\"]+)['\"]/g)) {
    const resolved = resolveLocal(full, match[1]);
    if (resolved) visit(resolved);
  }
}

for (const entry of ENTRYPOINTS) {
  const full = join(ROOT, entry);
  if (!existsSync(full)) violations.push(`${entry}: canonical entrypoint is missing`);
  else visit(full);
}

console.log('\n=== SecurePay canonical runtime audit ===');
console.log(`Canonical entrypoints: ${ENTRYPOINTS.length}`);
console.log(`Reachable local source files inspected: ${visited.size}`);
if (violations.length) {
  console.error(`FAILED (${violations.length})`);
  for (const violation of violations) console.error(` - ${violation}`);
  process.exit(1);
}
console.log('PASSED: canonical SecurePay trader/developer runtime is isolated from Supabase and direct Supabase Edge Function calls.\n');
