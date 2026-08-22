import fs from 'node:fs';

const files = {
  main: fs.readFileSync('src/main.tsx', 'utf8'),
  statePreview: fs.readFileSync('src/pages/PreviewSystemStates.tsx', 'utf8'),
  responsivePreview: fs.readFileSync('src/pages/PreviewResponsiveCertification.tsx', 'utf8'),
  stateRoom: fs.readFileSync('src/components/SystemStateRoom.tsx', 'utf8'),
  apiError: fs.readFileSync('src/components/api/ErrorState.tsx', 'utf8'),
  apiLoading: fs.readFileSync('src/components/api/LoadingState.tsx', 'utf8'),
  traderStates: fs.readFileSync('src/components/trader/TraderStates.tsx', 'utf8'),
  notFound: fs.readFileSync('src/pages/NotFoundPage.tsx', 'utf8'),
  css: fs.readFileSync('src/batch10-system-responsive.css', 'utf8'),
  report: fs.readFileSync('docs/BATCH_10_V15_V16_REPORT.md', 'utf8'),
};

const checks = [
  ['Batch 10 stylesheet loaded', files.main.includes("'./batch10-system-responsive.css'")],
  ['System-state preview is DEV-only route', files.main.includes('/preview/system-states')],
  ['Responsive certification is DEV-only route', files.main.includes('/preview/responsive')],
  ['System state grammar includes happened / meaning / next / money', files.stateRoom.includes('What happened') && files.stateRoom.includes('What it means') && files.stateRoom.includes('What you can do next') && files.stateRoom.includes('Money')],
  ['System-state preview covers offline and authority failures', files.statePreview.includes("id: 'offline'") && files.statePreview.includes("id: 'forbidden'") && files.statePreview.includes("id: 'server'")],
  ['System-state preview covers empty/waiting/no-record states', files.statePreview.includes("id: 'empty'") && files.statePreview.includes("id: 'participant'") && files.statePreview.includes("id: 'statements'")],
  ['Unknown financial truth is protected', files.statePreview.includes('Unknown is not failed, confirmed, Payment Ready or settled.')],
  ['Shared API states use the common room', files.apiError.includes('SystemStateRoom') && files.apiLoading.includes('SystemStateRoom')],
  ['Trader states use the common room', files.traderStates.includes('SystemStateRoom')],
  ['404 uses intention-first Market actions', files.notFound.includes('Start an agreement') && !files.notFound.includes('Create Collection')],
  ['Responsive targets include 360/390/412/430', ['360', '390', '412', '430'].every(value => files.responsivePreview.includes(`width: ${value}`))],
  ['Responsive stress cases include long name and large amount', files.responsivePreview.includes('Wanjiku Njeri wa Kamau & Sons Limited') && files.responsivePreview.includes('KES 1,250,000 / month')],
  ['Mobile keyboard and reduced motion are explicit', files.responsivePreview.includes('Keyboard open') && files.responsivePreview.includes('Reduced motion')],
  ['No horizontal application scroll contract', files.css.includes('overflow-x:clip')],
  ['iOS form zoom prevention', files.css.includes('font-size:16px!important')],
  ['Safe-area bottom support', files.css.includes('env(safe-area-inset-bottom)')],
  ['Exact certification media checkpoints', ['430', '412', '390', '360'].every(value => files.css.includes(`max-width:${value}px`))],
  ['Reduced motion support', files.css.includes('prefers-reduced-motion:reduce')],
  ['Batch report present', files.report.includes('Batch 10 — V15 System & Failure States + V16 Responsive Certification')],
];

const failed = checks.filter(([, ok]) => !ok);
for (const [name, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`);
if (failed.length) process.exit(1);
