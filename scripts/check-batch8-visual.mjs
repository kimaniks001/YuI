import fs from 'node:fs';

const files = {
  main: fs.readFileSync('src/main.tsx', 'utf8'),
  preview: fs.readFileSync('src/pages/PreviewReviewRecovery.tsx', 'utf8'),
  css: fs.readFileSync('src/batch8-review-recovery.css', 'utf8'),
  report: fs.readFileSync('docs/BATCH_08_V10_REPORT.md', 'utf8'),
};

const checks = [
  ['Batch 8 preview route', files.main.includes('/preview/review-recovery')],
  ['Batch 8 stylesheet loaded', files.main.includes("'./batch8-review-recovery.css'")],
  ['Resolution not courtroom', files.preview.includes('A resolution room, not a courtroom.')],
  ['Review authority boundary', files.preview.includes('it has not decided who is right') && files.preview.includes('does not decide who is right')],
  ['Three-part trader language', files.preview.includes('What happened') && files.preview.includes('What it means') && files.preview.includes('What you can do next')],
  ['Evidence does not imply proof', files.preview.includes('does not automatically prove either side')],
  ['Financial truth preserved', files.preview.includes('Payment confirmed ≠ Payment Ready') && files.preview.includes('Release requested ≠ settled')],
  ['Held exception represented', files.preview.includes('held exception')],
  ['Living SecurePay Mark used', files.preview.includes('LivingSecurePayMark')],
  ['Mobile treatment', files.css.includes('@media(max-width:620px)') && files.css.includes('min-height:44px')],
  ['Reduced motion treatment', files.css.includes('prefers-reduced-motion:reduce')],
  ['Batch report present', files.report.includes('Batch 8 — V10 Reviews, Issues & Recovery')],
];

const failed = checks.filter(([, ok]) => !ok);
for (const [name, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`);
if (failed.length) process.exit(1);
