export type MarketGameMode = 'solo' | 'duo' | 'room';
export type ProjectChoiceKind = 'agreement' | 'milestone' | 'rush';

export interface MarketGameHistoryEntry {
  id: string;
  at: string;
  kind: 'project' | 'partner' | 'badge';
  title: string;
  detail: string;
  capitalDelta: number;
  xpDelta: number;
}

export interface MarketGamePlayer {
  id: string;
  name: string;
  startingCapital: number;
  capital: number;
  xp: number;
  reputation: number;
  projectsCompleted: number;
  agreementFirstWins: number;
  partnerTrades: number;
  completedProjectIds: string[];
  badges: string[];
  history: MarketGameHistoryEntry[];
}

export interface MarketGameSession {
  id: string;
  version: 1;
  roomName: string;
  mode: MarketGameMode;
  createdAt: string;
  updatedAt: string;
  marketPassTestUnlocked: boolean;
  round: number;
  activePlayerIndex: number;
  players: MarketGamePlayer[];
}

export interface MarketProjectChoice {
  id: string;
  kind: ProjectChoiceKind;
  label: string;
  description: string;
  deltaPct: number;
  xp: number;
  reputation: number;
  lesson: string;
  outcome: string;
}

export interface MarketProject {
  id: string;
  category: 'Trade' | 'Build' | 'Digital' | 'Community' | 'Family';
  title: string;
  place: string;
  brief: string;
  commitment: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  partnerEligible: boolean;
  partnerRole?: string;
  choices: MarketProjectChoice[];
}

export const PLAY_MARKET_STORAGE_KEY = 'securepay.yui.play-market.v1';
export const PLAY_MARKET_LEADERBOARD_KEY = 'securepay.yui.play-market.leaderboard.v1';
export const MARKET_PASS_MONTHLY_KES = 100;

export const STARTING_CAPITAL_OPTIONS = [20_000, 100_000, 500_000, 1_000_000, 2_500_000] as const;

export const MARKET_LEVELS = [
  { level: 1, minXp: 0, name: 'Market Starter', note: 'Learn the rhythm of a clear trade.' },
  { level: 2, minXp: 300, name: 'Trader', note: 'Complete trades and keep dependable records.' },
  { level: 3, minXp: 750, name: 'Builder', note: 'Handle projects, suppliers and milestones.' },
  { level: 4, minXp: 1_400, name: 'Merchant', note: 'Grow repeat trade without losing clarity.' },
  { level: 5, minXp: 2_250, name: 'Project Lead', note: 'Coordinate several obligations well.' },
  { level: 6, minXp: 3_350, name: 'Market Maker', note: 'Create value across several relationships.' },
  { level: 7, minXp: 4_700, name: 'Market Elder', note: 'Stay fair when the market becomes difficult.' },
  { level: 8, minXp: 6_300, name: 'Master Trader', note: 'Build prosperity people can trust.' },
] as const;

export const MARKET_PROJECTS: MarketProject[] = [
  {
    id: 'cement-ruiru', category: 'Trade', title: '200 bags of cement', place: 'Ruiru',
    brief: 'A hardware wants commitment before delivery. Your site needs the cement this week and quantity matters.',
    commitment: 72_000, difficulty: 2, partnerEligible: true, partnerRole: 'delivery / supplier partner',
    choices: [
      { id: 'cement-clear', kind: 'agreement', label: 'Agree quantity + delivery evidence first', description: 'Record quantity, delivery point, photo and confirmation before money should move.', deltaPct: .16, xp: 190, reputation: 8, outcome: 'The delivery arrives correctly and your records make acceptance quick.', lesson: 'Specifications and evidence reduce expensive arguments.' },
      { id: 'cement-stage', kind: 'milestone', label: 'Split the commitment by delivery', description: 'Pay against two confirmed deliveries instead of one loose promise.', deltaPct: .12, xp: 160, reputation: 7, outcome: 'The split delivery gives you control while the supplier keeps working capital moving.', lesson: 'Milestones can balance supplier needs and buyer visibility.' },
      { id: 'cement-rush', kind: 'rush', label: 'Send quickly and sort details later', description: 'The price is attractive and the truck is supposedly already loading.', deltaPct: -.11, xp: 55, reputation: -4, outcome: 'Part of the load is disputed and replacing the shortfall costs you.', lesson: 'Speed is useful; unclear quantity is expensive.' },
    ],
  },
  {
    id: 'perimeter-wall', category: 'Build', title: 'Build a perimeter wall', place: 'Kiambu',
    brief: 'A mason can start tomorrow. Materials, labour and progress will stretch across several days.',
    commitment: 180_000, difficulty: 3, partnerEligible: true, partnerRole: 'materials / labour partner',
    choices: [
      { id: 'wall-clear', kind: 'agreement', label: 'Define scope, stages and proof', description: 'Foundation, walling and finish each get a visible completion condition.', deltaPct: .19, xp: 250, reputation: 10, outcome: 'Progress remains measurable and variations are discussed before they become bills.', lesson: 'A large job becomes manageable when work is broken into visible obligations.' },
      { id: 'wall-stage', kind: 'milestone', label: 'Fund the first milestone only', description: 'Commit enough to mobilize, then review the next stage.', deltaPct: .14, xp: 210, reputation: 8, outcome: 'You preserve liquidity while the project moves steadily.', lesson: 'Capital discipline matters as much as project ambition.' },
      { id: 'wall-rush', kind: 'rush', label: 'Give a large advance for a discount', description: 'The mason promises to finish faster if most money goes upfront.', deltaPct: -.16, xp: 70, reputation: -5, outcome: 'The schedule slips and you pay extra to restart work.', lesson: 'A discount is not valuable if responsibility becomes unclear.' },
    ],
  },
  {
    id: 'sacco-website', category: 'Digital', title: 'Build a SACCO website', place: 'Nairobi',
    brief: 'A developer offers design, development, testing and launch. The committee wants a working result, not screenshots.',
    commitment: 80_000, difficulty: 2, partnerEligible: true, partnerRole: 'design / development partner',
    choices: [
      { id: 'web-clear', kind: 'agreement', label: 'Turn the brief into four milestones', description: 'Design, development, testing and launch each have acceptance criteria.', deltaPct: .22, xp: 210, reputation: 9, outcome: 'The committee knows what it is reviewing and launch happens without a payment argument.', lesson: 'Digital work is easier to trust when deliverables are concrete.' },
      { id: 'web-stage', kind: 'milestone', label: 'Prototype before full commitment', description: 'Use a smaller first stage to confirm direction.', deltaPct: .15, xp: 175, reputation: 7, outcome: 'The prototype exposes a misunderstanding before it becomes expensive.', lesson: 'Early evidence protects both creator and customer.' },
      { id: 'web-rush', kind: 'rush', label: 'Pay for “complete website”', description: 'Keep the scope in chat and move fast.', deltaPct: -.09, xp: 60, reputation: -3, outcome: 'Everyone remembers the brief differently and rework eats the margin.', lesson: 'Creative work still needs shared meaning.' },
    ],
  },
  {
    id: 'solar-home', category: 'Build', title: 'Solar installation', place: 'Nyeri',
    brief: 'A household wants panels, inverter, batteries and commissioning. Technical specifications matter.',
    commitment: 240_000, difficulty: 4, partnerEligible: true, partnerRole: 'technical / supply partner',
    choices: [
      { id: 'solar-clear', kind: 'agreement', label: 'Lock specifications + commissioning evidence', description: 'Record equipment ratings, installation scope and test evidence.', deltaPct: .21, xp: 300, reputation: 11, outcome: 'The commissioned system matches the agreed capacity and the customer refers you.', lesson: 'Technical promises should become measurable conditions.' },
      { id: 'solar-stage', kind: 'milestone', label: 'Separate supply from commissioning', description: 'Confirm equipment first, then installation and testing.', deltaPct: .16, xp: 255, reputation: 9, outcome: 'A wrong component is caught before installation.', lesson: 'Good stages catch errors while they are still cheap to fix.' },
      { id: 'solar-rush', kind: 'rush', label: 'Take the cheapest full-package quote', description: 'The quote is short and the installer says “everything is included.”', deltaPct: -.18, xp: 75, reputation: -6, outcome: 'The system underperforms and replacement parts erase your margin.', lesson: 'Low price cannot replace clear specifications.' },
    ],
  },
  {
    id: 'estate-cctv', category: 'Community', title: 'Estate CCTV project', place: 'Varsityville',
    brief: 'Residents are contributing toward cameras and installation. People want progress and accountability.',
    commitment: 320_000, difficulty: 4, partnerEligible: true, partnerRole: 'installation / equipment partner',
    choices: [
      { id: 'cctv-clear', kind: 'agreement', label: 'Separate collection, approvals and installation', description: 'Give contributors a clear purpose and make project obligations visible.', deltaPct: .18, xp: 320, reputation: 12, outcome: 'Participation improves because people can see both the purpose and the work.', lesson: 'Governance and execution are different responsibilities.' },
      { id: 'cctv-stage', kind: 'milestone', label: 'Pilot one cluster first', description: 'Prove the installation pattern before scaling.', deltaPct: .13, xp: 260, reputation: 9, outcome: 'The pilot reveals a coverage gap before the full rollout.', lesson: 'A governed project can still learn in small steps.' },
      { id: 'cctv-rush', kind: 'rush', label: 'Buy equipment immediately', description: 'The supplier says stock may run out, so approvals can follow later.', deltaPct: -.13, xp: 80, reputation: -7, outcome: 'The equipment choice is challenged and trust in the project drops.', lesson: 'Urgency should not erase agreed authority.' },
    ],
  },
  {
    id: 'school-trip', category: 'Community', title: 'School trip logistics', place: 'Nakuru',
    brief: 'Parents are contributing for transport, meals and activities. Several obligations must work together.',
    commitment: 150_000, difficulty: 3, partnerEligible: true, partnerRole: 'transport / catering partner',
    choices: [
      { id: 'trip-clear', kind: 'agreement', label: 'Build one clear plan for all obligations', description: 'Separate transport, meals and activities while keeping one visible purpose.', deltaPct: .17, xp: 260, reputation: 10, outcome: 'Parents understand the plan and suppliers know exactly what they own.', lesson: 'Many contributors and many obligations need visible structure.' },
      { id: 'trip-stage', kind: 'milestone', label: 'Confirm suppliers before final collection', description: 'Get obligations and prices clear before asking for the last contribution.', deltaPct: .12, xp: 215, reputation: 8, outcome: 'The final amount is more accurate and fewer parents question the target.', lesson: 'Clarity before collection improves confidence.' },
      { id: 'trip-rush', kind: 'rush', label: 'Collect first, organize later', description: 'Start with a round amount and sort suppliers after.', deltaPct: -.10, xp: 65, reputation: -5, outcome: 'A late transport quote creates a shortfall and awkward extra requests.', lesson: 'A purpose is stronger when obligations are known.' },
    ],
  },
  {
    id: 'rental-renovation', category: 'Build', title: 'Renovate a rental house', place: 'Thika',
    brief: 'Painter, plumber and electrician must work in sequence. Budget overruns are the main risk.',
    commitment: 210_000, difficulty: 4, partnerEligible: true, partnerRole: 'specialist trade partner',
    choices: [
      { id: 'reno-clear', kind: 'agreement', label: 'Create a multi-obligation plan', description: 'Give each trade its own scope, evidence and amount.', deltaPct: .20, xp: 310, reputation: 11, outcome: 'Dependencies are visible and the house returns to market on time.', lesson: 'One payer can coordinate several obligations without losing traceability.' },
      { id: 'reno-stage', kind: 'milestone', label: 'Finish hidden work before finishes', description: 'Plumbing and electrical evidence comes before paint and closing surfaces.', deltaPct: .15, xp: 270, reputation: 9, outcome: 'A plumbing issue is corrected before it disappears behind finishes.', lesson: 'Evidence is strongest before work becomes hidden.' },
      { id: 'reno-rush', kind: 'rush', label: 'Let one foreman handle everything informally', description: 'One person will “sort the fundis” and send a final number.', deltaPct: -.17, xp: 75, reputation: -6, outcome: 'You cannot tell which trade caused the overrun and pay twice for rework.', lesson: 'Convenience should not erase responsibility.' },
    ],
  },
  {
    id: 'water-tank', category: 'Trade', title: '10,000L water tank delivery', place: 'Machakos',
    brief: 'A supplier has the tank in stock. The buyer wants the correct model delivered to the right site.',
    commitment: 95_000, difficulty: 2, partnerEligible: true, partnerRole: 'delivery partner',
    choices: [
      { id: 'tank-clear', kind: 'agreement', label: 'Match product + delivery confirmation', description: 'Record capacity, model, location and handover evidence.', deltaPct: .18, xp: 190, reputation: 8, outcome: 'The correct tank arrives and handover closes quickly.', lesson: 'Delivery and payment should stay connected.' },
      { id: 'tank-stage', kind: 'milestone', label: 'Verify stock before dispatch', description: 'Confirm the exact tank before committing the full amount.', deltaPct: .13, xp: 160, reputation: 7, outcome: 'The supplier catches a model mismatch before transport starts.', lesson: 'Small verification steps can prevent large logistics costs.' },
      { id: 'tank-rush', kind: 'rush', label: 'Pay from a product photo', description: 'The supplier says it is the same tank and transport is waiting.', deltaPct: -.08, xp: 55, reputation: -3, outcome: 'A smaller model arrives and return transport costs you.', lesson: 'A photo is useful evidence only when it proves the agreed thing.' },
    ],
  },
  {
    id: 'borehole', category: 'Build', title: 'Borehole project', place: 'Laikipia',
    brief: 'Mobilization, drilling, casing and testing make this a high-capital technical project.',
    commitment: 450_000, difficulty: 5, partnerEligible: true, partnerRole: 'technical project partner',
    choices: [
      { id: 'bore-clear', kind: 'agreement', label: 'Stage every technical milestone', description: 'Mobilization, drilling depth, casing and testing each have evidence.', deltaPct: .24, xp: 390, reputation: 14, outcome: 'The project stays visible through uncertainty and technical decisions are recorded.', lesson: 'Complex work needs more clarity, not more trust slogans.' },
      { id: 'bore-stage', kind: 'milestone', label: 'Fund mobilization + drilling first', description: 'Keep later obligations dependent on actual findings.', deltaPct: .17, xp: 320, reputation: 10, outcome: 'You adapt the casing plan to real ground conditions without losing accountability.', lesson: 'Good agreements can allow change without becoming vague.' },
      { id: 'bore-rush', kind: 'rush', label: 'Pay the full turnkey package', description: 'The driller promises a guaranteed fast result.', deltaPct: -.21, xp: 90, reputation: -8, outcome: 'Unexpected conditions trigger a costly dispute over what was included.', lesson: 'Complex risk should be allocated clearly before work begins.' },
    ],
  },
  {
    id: 'family-support', category: 'Family', title: 'Support Mum every month', place: 'Othaya',
    brief: 'Five siblings want a dependable monthly support plan without turning family money into drama.',
    commitment: 30_000, difficulty: 1, partnerEligible: true, partnerRole: 'family contribution partner',
    choices: [
      { id: 'family-clear', kind: 'agreement', label: 'Agree purpose, amount and visibility', description: 'Make the support plan simple enough that everyone can explain it.', deltaPct: .10, xp: 170, reputation: 10, outcome: 'The family knows what is expected and support becomes calmer.', lesson: 'Clarity can protect relationships as well as money.' },
      { id: 'family-stage', kind: 'milestone', label: 'Start small and review after a month', description: 'Agree one cycle, learn, then make the routine permanent.', deltaPct: .07, xp: 145, reputation: 8, outcome: 'The family adjusts the plan without blame and keeps contributing.', lesson: 'A good process can evolve while preserving shared meaning.' },
      { id: 'family-rush', kind: 'rush', label: 'Let everyone send “when they can”', description: 'Keep it informal so nobody feels pressured.', deltaPct: -.04, xp: 50, reputation: -4, outcome: 'Nobody can tell whether the month is covered and resentment grows.', lesson: 'Respectful structure can reduce family tension.' },
    ],
  },
];

const badgeDefinitions = [
  { id: 'first-clear', label: 'Agreement First', xp: 90, test: (p: MarketGamePlayer) => p.agreementFirstWins >= 1 },
  { id: 'three-projects', label: 'Project Builder', xp: 140, test: (p: MarketGamePlayer) => p.projectsCompleted >= 3 },
  { id: 'partner-trade', label: 'Better Together', xp: 110, test: (p: MarketGamePlayer) => p.partnerTrades >= 1 },
  { id: 'trusted-80', label: 'Trusted Hand', xp: 160, test: (p: MarketGamePlayer) => p.reputation >= 80 },
] as const;

function nowIso() { return new Date().toISOString(); }
function makeId(prefix: string) { return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`; }

export function formatDemoKes(amount: number) {
  return `KES ${Math.round(amount).toLocaleString('en-KE')}`;
}

export function levelForXp(xp: number) {
  return [...MARKET_LEVELS].reverse().find(level => xp >= level.minXp) ?? MARKET_LEVELS[0];
}

export function nextLevelForXp(xp: number) {
  return MARKET_LEVELS.find(level => level.minXp > xp) ?? null;
}

export function fairTraderScore(player: MarketGamePlayer) {
  const growthPct = player.startingCapital > 0 ? ((player.capital - player.startingCapital) / player.startingCapital) * 100 : 0;
  const growthPoints = Math.max(-500, Math.min(1_800, Math.round(growthPct * 10)));
  return Math.max(0, Math.round(player.xp + (player.reputation * 12) + (player.projectsCompleted * 90) + growthPoints));
}

export function capitalGrowthPct(player: MarketGamePlayer) {
  if (!player.startingCapital) return 0;
  return ((player.capital - player.startingCapital) / player.startingCapital) * 100;
}

export function createPlayer(name: string, startingCapital: number): MarketGamePlayer {
  return {
    id: makeId('player'),
    name: name.trim() || 'Trader',
    startingCapital,
    capital: startingCapital,
    xp: 0,
    reputation: 60,
    projectsCompleted: 0,
    agreementFirstWins: 0,
    partnerTrades: 0,
    completedProjectIds: [],
    badges: [],
    history: [],
  };
}

export function createSession(input: {
  roomName?: string;
  mode: MarketGameMode;
  players: Array<{ name: string; startingCapital: number }>;
  marketPassTestUnlocked?: boolean;
}): MarketGameSession {
  return {
    id: makeId('market'),
    version: 1,
    roomName: input.roomName?.trim() || 'Our Market',
    mode: input.mode,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    marketPassTestUnlocked: Boolean(input.marketPassTestUnlocked),
    round: 1,
    activePlayerIndex: 0,
    players: input.players.map(player => createPlayer(player.name, player.startingCapital)),
  };
}

export function readMarketSession(): MarketGameSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(PLAY_MARKET_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MarketGameSession;
    return parsed?.version === 1 && Array.isArray(parsed.players) ? parsed : null;
  } catch { return null; }
}

export function writeMarketSession(session: MarketGameSession) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PLAY_MARKET_STORAGE_KEY, JSON.stringify({ ...session, updatedAt: nowIso() }));
  } catch { /* Explorer state can remain in-memory if storage is unavailable. */ }
}

export function clearMarketSession() {
  if (typeof window === 'undefined') return;
  try { window.localStorage.removeItem(PLAY_MARKET_STORAGE_KEY); } catch { /* noop */ }
}

export interface LocalLeaderboardEntry {
  id: string;
  name: string;
  score: number;
  level: string;
  growthPct: number;
  projects: number;
  reputation: number;
  at: string;
}

export function recordSessionLeaderboard(session: MarketGameSession) {
  if (typeof window === 'undefined') return;
  try {
    const existingRaw = window.localStorage.getItem(PLAY_MARKET_LEADERBOARD_KEY);
    const existing = existingRaw ? JSON.parse(existingRaw) as LocalLeaderboardEntry[] : [];
    const current = session.players.map(player => ({
      id: player.id,
      name: player.name,
      score: fairTraderScore(player),
      level: levelForXp(player.xp).name,
      growthPct: capitalGrowthPct(player),
      projects: player.projectsCompleted,
      reputation: player.reputation,
      at: nowIso(),
    }));
    const byId = new Map(existing.map(entry => [entry.id, entry]));
    current.forEach(entry => byId.set(entry.id, entry));
    const next = [...byId.values()].sort((a, b) => b.score - a.score).slice(0, 40);
    window.localStorage.setItem(PLAY_MARKET_LEADERBOARD_KEY, JSON.stringify(next));
  } catch { /* noop */ }
}

export function readLocalLeaderboard(): LocalLeaderboardEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(PLAY_MARKET_LEADERBOARD_KEY);
    return raw ? JSON.parse(raw) as LocalLeaderboardEntry[] : [];
  } catch { return []; }
}

function awardBadges(player: MarketGamePlayer) {
  const awarded: string[] = [];
  for (const badge of badgeDefinitions) {
    if (player.badges.includes(badge.id) || !badge.test(player)) continue;
    player.badges.push(badge.id);
    player.xp += badge.xp;
    player.history.unshift({
      id: makeId('history'), at: nowIso(), kind: 'badge', title: badge.label,
      detail: `Badge earned · +${badge.xp} XP`, capitalDelta: 0, xpDelta: badge.xp,
    });
    awarded.push(badge.label);
  }
  return awarded;
}

export function executeMarketProject(
  session: MarketGameSession,
  projectId: string,
  choiceId: string,
  partnerId?: string,
) {
  const project = MARKET_PROJECTS.find(item => item.id === projectId);
  if (!project) throw new Error('Project not found.');
  const choice = project.choices.find(item => item.id === choiceId);
  if (!choice) throw new Error('Project choice not found.');

  const next: MarketGameSession = JSON.parse(JSON.stringify(session));
  const player = next.players[next.activePlayerIndex];
  if (!player) throw new Error('Active player not found.');
  if (player.completedProjectIds.includes(project.id)) throw new Error('You have already completed this project.');
  if (player.capital < project.commitment) throw new Error(`You need ${formatDemoKes(project.commitment)} Demo Capital to take this project.`);

  let partnerFee = 0;
  let partner: MarketGamePlayer | undefined;
  if (partnerId && project.partnerEligible && next.players.length > 1) {
    partner = next.players.find(item => item.id === partnerId && item.id !== player.id);
    if (partner) partnerFee = Math.max(1_000, Math.round(project.commitment * .04));
  }

  const projectDelta = Math.round(project.commitment * choice.deltaPct);
  const totalPlayerDelta = projectDelta - partnerFee;
  player.capital = Math.max(0, player.capital + totalPlayerDelta);
  player.xp += choice.xp;
  player.reputation = Math.max(0, Math.min(100, player.reputation + choice.reputation));
  player.projectsCompleted += 1;
  player.completedProjectIds.push(project.id);
  if (choice.kind === 'agreement') player.agreementFirstWins += 1;
  if (partner) player.partnerTrades += 1;
  player.history.unshift({
    id: makeId('history'), at: nowIso(), kind: 'project', title: project.title,
    detail: `${choice.label}. ${choice.outcome}`,
    capitalDelta: totalPlayerDelta,
    xpDelta: choice.xp,
  });

  if (partner && partnerFee > 0) {
    partner.capital += partnerFee;
    partner.xp += 70;
    partner.reputation = Math.min(100, partner.reputation + 3);
    partner.partnerTrades += 1;
    partner.history.unshift({
      id: makeId('history'), at: nowIso(), kind: 'partner', title: `Worked with ${player.name}`,
      detail: `${project.partnerRole ?? 'project partner'} on ${project.title}.`,
      capitalDelta: partnerFee,
      xpDelta: 70,
    });
    awardBadges(partner);
  }

  const awardedBadges = awardBadges(player);
  next.updatedAt = nowIso();
  if (next.players.length > 1) {
    const previousIndex = next.activePlayerIndex;
    next.activePlayerIndex = (previousIndex + 1) % next.players.length;
    if (next.activePlayerIndex === 0) next.round += 1;
  }
  recordSessionLeaderboard(next);
  writeMarketSession(next);

  return {
    session: next,
    project,
    choice,
    playerId: player.id,
    playerName: player.name,
    capitalDelta: totalPlayerDelta,
    partnerName: partner?.name,
    partnerFee,
    awardedBadges,
  };
}

export function demoKenyaLeaderboard(): LocalLeaderboardEntry[] {
  return [
    { id: 'demo-wanjiku', name: 'Wanjiku · Market Queen', score: 5_930, level: 'Market Elder', growthPct: 38.4, projects: 12, reputation: 93, at: '' },
    { id: 'demo-kamau', name: 'Kamau Hardware', score: 5_410, level: 'Market Elder', growthPct: 28.7, projects: 15, reputation: 91, at: '' },
    { id: 'demo-sam', name: 'Sam · Tech Translator', score: 4_780, level: 'Market Elder', growthPct: 64.2, projects: 9, reputation: 86, at: '' },
    { id: 'demo-fred', name: 'Fundi Fred', score: 4_310, level: 'Market Maker', growthPct: 31.5, projects: 13, reputation: 88, at: '' },
    { id: 'demo-mamasam', name: 'Mama Sam', score: 3_960, level: 'Market Maker', growthPct: 22.1, projects: 11, reputation: 95, at: '' },
  ];
}

export function badgeLabel(id: string) {
  return badgeDefinitions.find(badge => badge.id === id)?.label ?? id;
}
