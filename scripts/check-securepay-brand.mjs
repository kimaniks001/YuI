import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd(),src=path.join(root,'src');
const allowedDirectIcon=new Set([path.normalize('src/components/LivingSecurePayMark.tsx'),path.normalize('src/pages/Home.tsx')]);
const allowedFullLogo=new Set([path.normalize('src/components/SecurePayLogo.tsx')]);
const failures=[];
function walk(d){for(const n of fs.readdirSync(d)){const f=path.join(d,n),st=fs.statSync(f);if(st.isDirectory())walk(f);else if(/\.(tsx?|css)$/.test(n))inspect(f)}}
function inspect(f){const rel=path.normalize(path.relative(root,f)),t=fs.readFileSync(f,'utf8');if(/WhatsApp_Image_2026-06-24_at_11\.55\.30_AM/.test(t))failures.push(`${rel}: retired prototype logo reference`);if(t.includes('/assets/logos/securepay_icon_green.png')&&!allowedDirectIcon.has(rel))failures.push(`${rel}: direct SecurePay icon use; use LivingSecurePayMark`);if(t.includes('/assets/logos/securepay_logo_primary.png')&&!allowedFullLogo.has(rel))failures.push(`${rel}: direct full wordmark use; use SecurePayLogo`)}
walk(src);console.log('\n=== SecurePay brand presence guard ===');if(failures.length){failures.forEach(x=>console.error(`FAIL: ${x}`));process.exit(1)}console.log('PASSED: official icon is centralized through LivingSecurePayMark; full wordmark remains contained.');
