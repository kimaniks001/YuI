import fs from 'node:fs';
const files={main:fs.readFileSync('src/main.tsx','utf8'),atmosphere:fs.readFileSync('src/lib/marketAtmosphere.tsx','utf8'),opening:fs.readFileSync('src/components/MarketOpeningRitual.tsx','utf8'),themes:fs.readFileSync('src/pages/PreviewMarketThemes.tsx','utf8'),certification:fs.readFileSync('src/pages/PreviewVisualCertification.tsx','utf8'),settings:fs.readFileSync('src/pages/TraderSettings.tsx','utf8'),css:fs.readFileSync('src/batch11-atmosphere-certification.css','utf8'),report:fs.readFileSync('docs/BATCH_11_V17_V18_REPORT.md','utf8')};
const ids=['market-day','green-market','town-market','evening-market'];
const checks=[
['Batch 11 stylesheet loaded',files.main.includes("'./batch11-atmosphere-certification.css'")],
['Market atmosphere provider wraps app',files.main.includes('MarketAtmosphereProvider')&&files.main.includes('MarketAtmosphereBackdrop')],
['Four stable themes',ids.every(id=>files.atmosphere.includes(`'${id}'`))],
['Theme preview DEV route',files.main.includes('/preview/themes')],
['Certification preview DEV route',files.main.includes('/preview/certification')],
['Opening uses Living Mark',files.opening.includes('LivingSecurePayMark')],
['Opening session scoped',files.opening.includes('sessionStorage')&&files.opening.includes('securepay.market.opening.seen.v1')],
['Opening supports Skip',files.opening.includes('Skip')],
['Reduced motion supported',files.css.includes('prefers-reduced-motion:reduce')],
['Theme does not override brand/status tokens',!files.css.includes('--sp-green:')&&!files.css.includes('--sp-orange:')&&!files.css.includes('--sp-success:')&&!files.css.includes('--sp-caution:')],
['Theme truth boundary explicit',files.themes.includes('Agreement, money, quorum, identity and settlement truth do not change with a theme.')],
['Settings exposes local atmosphere',files.settings.includes('Market atmosphere')&&files.settings.includes('this device')],
['Certification includes all eleven batches',Array.from({length:11},(_,i)=>String(i+1).padStart(2,'0')).every(v=>files.certification.includes(`batch: '${v}'`))],
['Final human/local build gate explicit',files.certification.includes('successful local')&&files.certification.includes('human approval')],
['Batch report present',files.report.includes('Batch 11 — V17 Market Atmosphere + V18 Full Visual Certification')],
];
const failed=checks.filter(([,ok])=>!ok);for(const [n,ok] of checks)console.log(`${ok?'PASS':'FAIL'} ${n}`);if(failed.length)process.exit(1);
