import fs from 'node:fs';

const files = {
  main: fs.readFileSync('src/main.tsx', 'utf8'),
  preview: fs.readFileSync('src/pages/PreviewFlowCommunity.tsx', 'utf8'),
  css: fs.readFileSync('src/batch7-flow-community.css', 'utf8'),
  report: fs.readFileSync('docs/BATCH_07_V9_V12_REPORT.md', 'utf8'),
};

const checks = [
  ['Batch 7 preview route', files.main.includes('/preview/flows-community')],
  ['Lucide 0.344 compatibility', !files.preview.includes('BriefcaseBusiness') && files.preview.includes('Store')],
  ['Batch 7 stylesheet loaded', files.main.includes("'./batch7-flow-community.css'")],
  ['SecureFlow visual language', files.preview.includes('One purpose. Several clear paths.')],
  ['Group authority boundary', files.preview.includes('eligibility, quorum and final approval come from SecurePayAPI')],
  ['Community is not ranking', files.preview.includes('Connection, not ranking')],
  ['No estimated earnings', files.preview.includes('No estimated earnings are shown')],
  ['Mobile treatment', files.css.includes('@media(max-width:720px)')],
  ['Batch report present', files.report.includes('Batch 7 — V9 SecureFlow / Group SecureFlow + V12 Community & Growth')],
];

const failed = checks.filter(([, ok]) => !ok);
for (const [name, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`);
if (failed.length) process.exit(1);
