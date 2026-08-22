import fs from 'node:fs';

const read = file => fs.readFileSync(file, 'utf8');
const files = {
  main: read('src/main.tsx'),
  home: read('src/pages/TrainerHome.tsx'),
  session: read('src/pages/TrainerSession.tsx'),
  state: read('src/lib/trainerSession.ts'),
  client: read('src/api/securepayClient.ts'),
};

const checks = [
  ['Trainer root is intentional product', files.main.includes('<Route path="/trainer" element={<TrainerHome />} />')],
  ['Guided Plug session route exists', files.main.includes('<Route path="/trainer/session" element={<TrainerSession />} />')],
  ['Explorer map preserved as demo library', files.main.includes('<Route path="/trainer/map" element={<ExplorerMap />} />')],
  ['Role demos include Plug', files.home.includes('Plug / Trainer') && files.home.includes('Developer') && files.home.includes('Partner')],
  ['Journey picker covers SecureLink', files.home.includes('Buy or sell with a SecureLink')],
  ['Journey picker covers group/flow', files.home.includes('Many contributors → one purpose') && files.home.includes('One payer → many obligations')],
  ['Recovery demo is present', files.home.includes('Recover when something goes wrong') && files.home.includes('/trainer/recovery')],
  ['Store demo is present', files.home.includes('KS Store') && files.home.includes('/trainer/store')],
  ['Try It For Real re-authenticates', files.home.includes('saveMarketDraftIntent') && files.home.includes("marketSignInHref('/create')")],
  ['Guided session covers five teaching stages', files.state.includes("'identity-store'") && files.state.includes("'securelink'") && files.state.includes("'group-flow'") && files.state.includes("'evidence-recovery'") && files.state.includes("'real-market'")],
  ['Trainer progress is session-only', files.state.includes('sessionStorage') && files.state.includes('securepay.trainer.session.v1')],
  ['Authority laws are taught', files.session.includes('Creator is not automatically payer') && files.session.includes('Evidence is not automatic completion') && files.session.includes('SecurePay is not the judge')],
  ['Simulated truth cannot cross to Market', files.session.includes('Only draft intention may cross')],
  ['Live API remains blocked in Trainer', files.client.includes('isSimulatedWorldRuntime()')],
  ['Responsive Trainer layouts present', files.home.includes('sm:grid-cols-2') && files.home.includes('lg:grid-cols-5') && files.session.includes('lg:grid-cols-[0.75fr_1.25fr]')],
];

const failed = checks.filter(([, ok]) => !ok);
for (const [name, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`);
if (failed.length) process.exit(1);
console.log('Trainer foundation guard passed.');
