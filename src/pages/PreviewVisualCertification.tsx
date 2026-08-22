import { ArrowRight, Check, CircleDashed, Monitor, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import LivingSecurePayMark from '../components/LivingSecurePayMark';

const PHASES = [
  { batch: '01', phases: 'V0 + V1', title: 'Visual Constitution + Market Entrance', route: '/preview/home', state: 'locked' },
  { batch: '02', phases: 'V2 + V3', title: 'Identity Doorway + Agreement Creation', route: '/preview/create', state: 'locked' },
  { batch: '03', phases: 'V5 + V6', title: 'Trader Home + My Market', route: '/preview/market', state: 'locked' },
  { batch: '04', phases: 'V7', title: 'Agreement Workspace', route: '/preview/workspace', state: 'locked' },
  { batch: '05', phases: 'V4 + V11', title: 'Joining + KS Profile & Digital Store', route: '/preview/store', state: 'locked' },
  { batch: '06', phases: 'V8', title: 'Money Rooms', route: '/preview/money', state: 'locked' },
  { batch: '07', phases: 'V9 + V12', title: 'SecureFlow + Community & Growth', route: '/preview/flows-community', state: 'locked' },
  { batch: '08', phases: 'V10', title: 'Reviews, Issues & Recovery', route: '/preview/review-recovery', state: 'locked' },
  { batch: '09', phases: 'V13 + V14', title: 'Developer Market + Help & Trust', route: '/preview/developers', state: 'locked' },
  { batch: '10', phases: 'V15 + V16', title: 'System States + Responsive Certification', route: '/preview/responsive', state: 'checkpoint' },
  { batch: '11', phases: 'V17 + V18', title: 'Market Atmosphere + Full Visual Certification', route: '/preview/themes', state: 'current' },
] as const;

const CERTIFICATION = [
  'Official SecurePay mark and wordmark assets are fixed brand masters.',
  'Living Mark state communicates SecurePay posture without changing the symbol.',
  'Every exceptional state explains what happened, what it means and what comes next.',
  'Financial authority remains backend truth; visual state never manufactures Payment Ready or settlement.',
  'Canonical route integrity and legacy-presentation guards remain part of certification.',
  '360, 390, 412 and 430px phone targets remain the responsive certification baseline.',
  'Reduced motion, safe-area and minimum touch-target rules remain active.',
  'Final production certification still requires the local typecheck/build and human visual approval gate.',
];

export default function PreviewVisualCertification() {
  return (
    <main className="b11-page b11-certification-page">
      <header className="b11-hero b11-certification-hero">
        <div>
          <p className="b11-kicker">Batch 11 · V18 Full visual certification</p>
          <h1>One Market. One visual grammar. No orphan rooms.</h1>
          <p>This is the final visual checkpoint across the approved SecurePay rooms. It is a certification candidate, not a substitute for the final Mac build and human approval.</p>
        </div>
        <LivingSecurePayMark state="success" size="lg" presence="present" label="SecurePay visual certification candidate" />
      </header>

      <section className="b11-room">
        <div className="b11-cert-summary">
          <div><span>11</span><p>visual batches</p></div>
          <div><span>19</span><p>visual phases</p></div>
          <div><span>4</span><p>phone certification widths</p></div>
          <div><span>1</span><p>Market language</p></div>
        </div>

        <div className="b11-phase-list" aria-label="SecurePay visual phase matrix">
          {PHASES.map(item => (
            <Link key={item.batch} to={item.route} className="b11-phase-row">
              <span className={`b11-phase-status b11-phase-status--${item.state}`}>{item.state === 'locked' ? <Check size={12} /> : <CircleDashed size={12} />}</span>
              <span className="b11-phase-number">B{item.batch}</span>
              <span className="b11-phase-copy"><strong>{item.title}</strong><small>{item.phases}</small></span>
              <span className="b11-phase-state">{item.state === 'locked' ? 'Locked' : item.state === 'checkpoint' ? 'Responsive checkpoint' : 'Final review'}</span>
              <ArrowRight size={16} />
            </Link>
          ))}
        </div>
      </section>

      <section className="b11-cert-grid">
        <article className="b11-room">
          <div className="b11-cert-title"><Monitor size={20} /><div><p className="b11-label">Desktop continuity</p><h2>The room may change. The Market should not.</h2></div></div>
          <p className="b11-cert-copy">Headers, agreement hierarchy, Living Mark posture, cards, money language and action priority must remain recognisably SecurePay from the public entrance through the deepest operational room.</p>
          <Link to="/review" className="b11-cert-link">Open the complete review gallery <ArrowRight size={15} /></Link>
        </article>

        <article className="b11-room">
          <div className="b11-cert-title"><Smartphone size={20} /><div><p className="b11-label">Phone continuity</p><h2>Small rooms keep the same truth.</h2></div></div>
          <p className="b11-cert-copy">Mobile changes reading order and density, not authority or meaning. Long names, large KES amounts, many participants and keyboard-open states must remain usable.</p>
          <Link to="/preview/responsive" className="b11-cert-link">Open responsive certification <ArrowRight size={15} /></Link>
        </article>
      </section>

      <section className="b11-room b11-final-gate">
        <div><p className="b11-label">Final gate</p><h2>What “visually complete” will mean.</h2></div>
        <div className="b11-invariant-list">
          {CERTIFICATION.map(item => <div key={item}><span><Check size={12} /></span><p>{item}</p></div>)}
        </div>
        <div className="b11-candidate-note">
          <LivingSecurePayMark state="guiding" size="sm" presence="polite" />
          <p><strong>Current classification:</strong> visual certification candidate. It becomes the locked v1 visual baseline only after Batch 11 human approval and a successful local <code>npm run certify</code>.</p>
        </div>
      </section>
    </main>
  );
}
