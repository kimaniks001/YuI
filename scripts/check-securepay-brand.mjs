import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const src = path.join(root, 'src');
const allowedDirectIcon = new Set([path.normalize('src/components/LivingSecurePayMark.tsx'), path.normalize('src/pages/Home.tsx')]);
const allowedFullLogo = new Set([path.normalize('src/components/SecurePayLogo.tsx')]);
const failures = [];

function walk(d) {
  for (const n of fs.readdirSync(d)) {
    const f = path.join(d, n);
    const st = fs.statSync(f);
    if (st.isDirectory()) walk(f);
    else if (/\.(tsx?|css)$/.test(n)) inspect(f);
  }
}

function inspect(f) {
  const rel = path.normalize(path.relative(root, f));
  const t = fs.readFileSync(f, 'utf8');
  if (/WhatsApp_Image_2026-06-24_at_11\.55\.30_AM/.test(t)) failures.push(`${rel}: retired prototype logo reference`);
  if (t.includes('/assets/logos/securepay_icon_green.png') && !allowedDirectIcon.has(rel)) failures.push(`${rel}: direct SecurePay icon use; use LivingSecurePayMark`);
  if (t.includes('/assets/logos/securepay_logo_primary.png') && !allowedFullLogo.has(rel)) failures.push(`${rel}: direct full wordmark use; use SecurePayLogo`);
}

walk(src);

const markPath = path.join(src, 'components', 'LivingSecurePayMark.tsx');
const markCssPath = path.join(src, 'living-securepay-mark.css');
const mark = fs.readFileSync(markPath, 'utf8');
const markCss = fs.readFileSync(markCssPath, 'utf8');

for (const state of ['checking', 'active', 'action', 'success', 'caution', 'waiting', 'failure', 'restricted', 'recovering', 'complete']) {
  if (!mark.includes(`'${state}'`)) failures.push(`LivingSecurePayMark: missing frozen state '${state}'`);
}

if (!mark.includes("surface?: MarkSurface")) failures.push('LivingSecurePayMark: missing explicit surface contrast control');
if (!mark.includes("sp-living-mark--surface-${surface}")) failures.push('LivingSecurePayMark: surface class is not wired to the mark');
if (!markCss.includes('.sp-living-mark--surface-dark')) failures.push('living-securepay-mark.css: missing dark-surface inverse treatment');
if (!markCss.includes("filter:brightness(0) invert(1)")) failures.push('living-securepay-mark.css: dark surface must render official icon white');
if (!markCss.includes("--mark-ink:#3a7a1f")) failures.push('living-securepay-mark.css: cream/light mark must retain SecurePay green');
if (!markCss.includes("--mark-ink:#fff")) failures.push('living-securepay-mark.css: deep-green/dark mark must expose white orbit language');
if (!markCss.includes('@media(prefers-reduced-motion:reduce)')) failures.push('living-securepay-mark.css: reduced-motion treatment missing');

console.log('\n=== SecurePay brand + living mark guard ===');
if (failures.length) {
  failures.forEach(x => console.error(`FAIL: ${x}`));
  process.exit(1);
}

console.log('PASSED: official assets remain centralized; living mark preserves green-on-cream, white-on-green, status signs and reduced-motion semantics.');
