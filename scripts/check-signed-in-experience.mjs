import fs from 'node:fs';

const read = path => fs.readFileSync(path, 'utf8');
const fail = message => { console.error(`Signed-in experience check failed: ${message}`); process.exitCode = 1; };

const protectedPages = [
  'src/pages/SecurePayHome.tsx',
  'src/pages/MyMarket.tsx',
  'src/pages/MarketFlows.tsx',
  'src/pages/MarketStatements.tsx',
  'src/pages/StoreOwnerStudio.tsx',
  'src/pages/StoreSharingStudio.tsx',
  'src/pages/PlugDashboard.tsx',
  'src/pages/TraderAgreements.tsx',
  'src/pages/AgreementDetailWorkspace.tsx',
  'src/pages/AgreementConsultation.tsx',
  'src/pages/AgreementRecovery.tsx',
  'src/pages/TraderActionCentre.tsx',
  'src/pages/MoneySpace.tsx',
  'src/pages/TraderCommunity.tsx',
  'src/pages/TraderReferrals.tsx',
  'src/pages/TraderCircles.tsx',
  'src/pages/TraderOpportunities.tsx',
  'src/pages/TraderMasters.tsx',
  'src/pages/TraderSettings.tsx',
  'src/pages/DeveloperJourney.tsx',
];

for (const path of protectedPages) {
  const source = read(path);
  if (!source.includes('TraderShell')) fail(`${path} is outside the signed-in TraderShell identity`);
}

const shell = read('src/components/trader/TraderShell.tsx');
const header = read('src/components/trader/TraderPageHeader.tsx');
const states = read('src/components/trader/TraderStates.tsx');
const css = read('src/trader-system-wide.css');
const market = read('src/pages/MyMarket.tsx');
const agreements = read('src/pages/TraderAgreements.tsx');
const actions = read('src/pages/TraderActionCentre.tsx');
const money = read('src/pages/MoneySpace.tsx');
const statements = read('src/pages/MarketStatements.tsx');
const store = read('src/pages/StoreOwnerStudio.tsx');
const plug = read('src/pages/PlugDashboard.tsx');

if (!shell.includes('trader-system-wide') || !shell.includes('trader-account-ks')) fail('shared trader shell is missing the compact signed-in identity standard');
if (!header.includes('trader-page-identity') || !header.includes('About this page')) fail('shared page header no longer provides compact KS identity + progressive page explanation');
if (states.includes('SystemStateRoom')) fail('daily trader states have regressed to the verbose doctrine state room');
if (!css.includes('.trader-system-wide .b10-system-state')) fail('specialist legacy state rooms are not compacted inside the real Market');
if (!css.includes('section>p.text-sm.leading-6')) fail('mobile signed-in legacy prose no longer has a density guard');

if (!market.includes("type MarketView = 'attention' | 'waiting' | 'active' | 'completed'")) fail('My Market is no longer a single selectable situation view');
if (!market.includes('setView(id)')) fail('My Market summary counts are no longer actionable filters');
if (!agreements.includes('counts[item]')) fail('Agreements filters lost their at-a-glance counts');
if (!actions.includes('actionCount={totalElements}')) fail('Action Centre no longer carries backend attention into shared navigation');
if (!money.includes('How settlement accounts work') || !money.includes('What is not available here yet')) fail('Money doctrine is no longer progressively disclosed');
if (!statements.includes('How to read this statement')) fail('Statement doctrine is no longer progressively disclosed');
if (!store.includes("type StoreView = 'overview' | 'design' | 'offers' | 'profile'")) fail('KS Store has regressed from the task-first owner Studio');
if (!store.includes("setView('design')") || !store.includes("setView('offers')") || !store.includes("setView('profile')")) fail('KS Store task tabs are not all reachable');
if (!plug.includes("type PlugView = 'overview' | 'people' | 'help'")) fail('Plug workspace has regressed to one long page');

if (!process.exitCode) console.log(`Signed-in experience guard passed across ${protectedPages.length} protected page modules.`);
