import { useMemo, useState } from 'react';
import { ArrowRight, Check, CircleDot, GraduationCap, Hammer, HeartHandshake, Network, PackageCheck, PaintRoller, Share2, Sparkles, Store, UsersRound, Wrench } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import LivingSecurePayMark from '../components/LivingSecurePayMark';

type FlowMode = 'secureflow' | 'group';
type CommunityMode = 'circle' | 'growth';

const allocations = [
  { name: 'Mwaura Painting', ks: 'KS4821', role: 'Painter', amount: 'KES 90,000', icon: PaintRoller, state: 'Work evidence ready' },
  { name: 'Ruiru Plumbing', ks: 'KS7750', role: 'Plumber', amount: 'KES 50,000', icon: Wrench, state: 'Waiting for work' },
  { name: 'Karis Electricals', ks: 'KS3194', role: 'Electrician', amount: 'KES 40,000', icon: Hammer, state: 'Identity confirmed' },
];

const communityPeople = [
  { initials: 'AM', name: 'Amina M.', relation: 'Traded with', detail: 'Furniture supplier' },
  { initials: 'JM', name: 'Joseph M.', relation: 'Introduced', detail: 'Building contractor' },
  { initials: 'WN', name: 'Wanjiku N.', relation: 'Traded with', detail: 'School services' },
  { initials: 'PO', name: 'Peter O.', relation: 'Circle', detail: 'Transport supplier' },
  { initials: 'LW', name: 'Lucy W.', relation: 'Introduced', detail: 'Digital services' },
];

export default function PreviewFlowCommunity() {
  const [flowMode, setFlowMode] = useState<FlowMode>('secureflow');
  const [communityMode, setCommunityMode] = useState<CommunityMode>('circle');

  const groupContributors = useMemo(() => ['KS2081', 'KS5102', 'KS4008', 'KS9273', 'KS6634', 'KS1185'], []);

  return (
    <main className="b7-page">
      <header className="b7-preview-banner">
        <div>
          <p className="b7-kicker">Batch 7 visual review · fixture only</p>
          <h1>Flows that make sense. Community that feels human.</h1>
          <p>These rooms demonstrate visual language only. They do not create payments, quorum, rewards, rankings or financial authority.</p>
        </div>
        <LivingSecurePayMark state="guiding" size="lg" presence="present" label="SecurePay is guiding this visual review" />
      </header>

      <section className="b7-room" aria-labelledby="b7-flow-title">
        <div className="b7-room-heading">
          <div>
            <p className="b7-kicker">V9 · SecureFlow / Group SecureFlow</p>
            <h2 id="b7-flow-title">One purpose. Several clear paths.</h2>
            <p>Complex distribution should read like a story: where value starts, the agreement it belongs to, who should receive what, and what still needs to happen.</p>
          </div>
          <div className="b7-segmented" aria-label="Flow preview mode">
            <button className={flowMode === 'secureflow' ? 'is-active' : ''} onClick={() => setFlowMode('secureflow')}>SecureFlow</button>
            <button className={flowMode === 'group' ? 'is-active' : ''} onClick={() => setFlowMode('group')}>Group SecureFlow</button>
          </div>
        </div>

        {flowMode === 'secureflow' ? (
          <div className="b7-flow-stage">
            <aside className="b7-origin-card">
              <span className="b7-story-icon"><Store size={21} /></span>
              <p className="b7-label">Payer</p>
              <strong>James · KS2145</strong>
              <span>One agreement funds the plan</span>
            </aside>

            <div className="b7-connector b7-connector--in"><span /></div>

            <article className="b7-purpose-card">
              <LivingSecurePayMark state="guiding" size="sm" presence="present" decorative />
              <p className="b7-label">Agreement purpose</p>
              <h3>Finish the house renovation</h3>
              <strong className="b7-money">KES 180,000</strong>
              <p>Three obligations. Three recipients. One agreement story.</p>
              <div className="b7-plan-state"><CircleDot size={14} /> Illustrative plan · not a live money state</div>
            </article>

            <div className="b7-branch" aria-hidden="true"><span /><i /><b /></div>

            <div className="b7-recipient-grid">
              {allocations.map(({ name, ks, role, amount, icon: Icon, state }, index) => (
                <article className="b7-recipient-card" key={ks}>
                  <div className="b7-recipient-top">
                    <span className="b7-story-icon"><Icon size={18} /></span>
                    <span className="b7-step">0{index + 1}</span>
                  </div>
                  <p className="b7-label">{role}</p>
                  <h4>{name}</h4>
                  <span className="b7-ks">{ks}</span>
                  <strong>{amount}</strong>
                  <p>{state}</p>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div className="b7-group-flow-stage">
            <div className="b7-contributor-pod">
              <div className="b7-pod-title"><UsersRound size={18} /><div><p className="b7-label">Contributors</p><strong>6 of 12 shown</strong></div></div>
              <div className="b7-contributor-dots">{groupContributors.map((item, index) => <span key={item} title={item}>{index + 1}</span>)}</div>
              <p>Contribution intentions stay attached to the exact group agreement. This preview does not imply payment.</p>
            </div>

            <div className="b7-flow-arrow"><ArrowRight size={18} /></div>

            <article className="b7-governed-purpose">
              <LivingSecurePayMark state="waiting" size="md" presence="present" label="SecurePay is waiting for the required group decisions" />
              <p className="b7-label">Governed purpose</p>
              <h3>School trip transport & meals</h3>
              <strong className="b7-money">KES 80,000</strong>
              <div className="b7-approval-demo">
                <span><Check size={13} /> 2 decisions recorded</span>
                <span>1 still required in this example</span>
              </div>
              <p className="b7-authority-note">In the live product, eligibility, quorum and final approval come from SecurePayAPI — never from this visual.</p>
            </article>

            <div className="b7-flow-arrow"><ArrowRight size={18} /></div>

            <div className="b7-mini-destinations">
              <Destination icon={PackageCheck} title="Bus company" amount="KES 45,000" />
              <Destination icon={GraduationCap} title="Meals supplier" amount="KES 25,000" />
              <Destination icon={HeartHandshake} title="Activity partner" amount="KES 10,000" />
            </div>
          </div>
        )}

        <div className="b7-flow-laws">
          <Law number="01" title="Direction is visible" body="People should see the movement pattern before learning the product name." />
          <Law number="02" title="Every branch keeps identity" body="Recipient, amount, purpose and state remain distinct." />
          <Law number="03" title="Governance sits before authority" body="A group visual never turns a browser into the quorum engine." />
        </div>
      </section>

      <section className="b7-room b7-community-room" aria-labelledby="b7-community-title">
        <div className="b7-room-heading">
          <div>
            <p className="b7-kicker">V12 · Community & Growth</p>
            <h2 id="b7-community-title">Your Market has people around it.</h2>
            <p>Community should make a trader feel connected and recognised without turning SecurePay into a popularity contest or social feed.</p>
          </div>
          <div className="b7-segmented" aria-label="Community preview mode">
            <button className={communityMode === 'circle' ? 'is-active' : ''} onClick={() => setCommunityMode('circle')}>Your Circle</button>
            <button className={communityMode === 'growth' ? 'is-active' : ''} onClick={() => setCommunityMode('growth')}>Growth</button>
          </div>
        </div>

        {communityMode === 'circle' ? (
          <div className="b7-circle-layout">
            <div className="b7-circle-visual" aria-label="Illustrative trader community connections">
              <div className="b7-circle-orbit b7-circle-orbit--one" />
              <div className="b7-circle-orbit b7-circle-orbit--two" />
              <div className="b7-circle-center">
                <LivingSecurePayMark state="resting" size="sm" presence="polite" decorative />
                <strong>KS2145</strong>
                <span>Your place</span>
              </div>
              {communityPeople.map((person, index) => (
                <div className={`b7-person-node b7-person-node--${index + 1}`} key={person.name}>
                  <span>{person.initials}</span>
                  <small>{person.name}</small>
                </div>
              ))}
            </div>

            <div className="b7-community-copy">
              <span className="b7-story-icon b7-story-icon--large"><Network size={23} /></span>
              <p className="b7-label">Connection, not ranking</p>
              <h3>People become context around your KSNumber.</h3>
              <p>SecurePay can show relationships it can prove — trades, introductions and Circle membership — without inventing a reputation score or declaring someone safe to trade with.</p>
              <div className="b7-relationship-list">
                {communityPeople.slice(0, 3).map(person => <div key={person.name}><span>{person.initials}</span><p><strong>{person.name}</strong><small>{person.relation} · {person.detail}</small></p></div>)}
              </div>
            </div>
          </div>
        ) : (
          <div className="b7-growth-layout">
            <article className="b7-growth-hero">
              <span className="b7-story-icon b7-story-icon--large"><Sparkles size={22} /></span>
              <p className="b7-label">Growth should look like a branch, not a leaderboard</p>
              <h3>You helped more traders find the Market.</h3>
              <p>Introductions can become visible relationships. Qualification and any reward appear only when SecurePay has backend evidence.</p>
              <button type="button"><Share2 size={16} /> Share your referral code</button>
            </article>

            <div className="b7-growth-tree" aria-label="Illustrative referral growth tree">
              <div className="b7-tree-root"><strong>You</strong><span>KS2145</span></div>
              <div className="b7-tree-line" />
              <div className="b7-tree-branches">
                <GrowthNode name="Amina" state="Activated" />
                <GrowthNode name="Joseph" state="Qualified" good />
                <GrowthNode name="Lucy" state="Joined" />
              </div>
              <p>Illustrative relationship states only. No estimated earnings are shown.</p>
            </div>
          </div>
        )}

        <div className="b7-community-law">
          <LivingSecurePayMark state="resting" size="sm" presence="polite" decorative />
          <p><strong>The agreement still decides the trade.</strong> Community can provide context, belonging and a path to growth. It never decides Payment Ready, settlement, release, dispute outcome or financial authority.</p>
        </div>
      </section>
    </main>
  );
}

function Destination({ icon: Icon, title, amount }: { icon: LucideIcon; title: string; amount: string }) {
  return <article><span className="b7-story-icon"><Icon size={17} /></span><div><p>{title}</p><strong>{amount}</strong></div></article>;
}

function Law({ number, title, body }: { number: string; title: string; body: string }) {
  return <article><span>{number}</span><div><strong>{title}</strong><p>{body}</p></div></article>;
}

function GrowthNode({ name, state, good = false }: { name: string; state: string; good?: boolean }) {
  return <div className="b7-growth-node"><span className={good ? 'is-good' : ''}>{name.charAt(0)}</span><strong>{name}</strong><small>{state}</small></div>;
}
