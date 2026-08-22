import { useMemo, useState } from 'react';
import { ArrowRight, Check, FileText, Home, ListChecks, UsersRound } from 'lucide-react';
import LivingSecurePayMark from '../components/LivingSecurePayMark';

const TARGETS = [
  { id: 'a360', label: 'Android compact', width: 360, height: 800 },
  { id: 'i390', label: 'iPhone standard', width: 390, height: 844 },
  { id: 'a412', label: 'Android modern', width: 412, height: 915 },
  { id: 'i430', label: 'iPhone large', width: 430, height: 932 },
] as const;

type TargetId = typeof TARGETS[number]['id'];

const STRESS = [
  'Long trader name · Wanjiku Njeri wa Kamau & Sons Limited',
  'Large amount · KES 1,250,000 / month',
  'Natural language · “I want to renovate my mum’s house in Nyeri and pay the contractor, plumber and electrician as each part is confirmed.”',
  'Many people · 12 contributors · 4 recipients',
  'Keyboard open · primary action still reachable',
  'Reduced motion · no meaning depends on animation',
];

export default function PreviewResponsiveCertification() {
  const [targetId, setTargetId] = useState<TargetId>('i390');
  const target = useMemo(() => TARGETS.find(item => item.id === targetId) ?? TARGETS[1], [targetId]);

  return (
    <main className="b10-page b10-responsive-preview sp-responsive-guard">
      <header className="b10-hero">
        <div>
          <p className="b10-kicker">Batch 10 · V16 Responsive certification</p>
          <h1>The Market must remain itself on every phone.</h1>
          <p>Responsive design is not shrinking desktop. The priority, reading order, touch targets, money truth and SecurePay guidance must survive the smallest certified viewport.</p>
        </div>
        <LivingSecurePayMark state="success" size="lg" presence="present" label="SecurePay responsive rules are active" />
      </header>

      <section className="b10-room">
        <div className="b10-target-selector" aria-label="Certified viewport targets">
          {TARGETS.map(item => (
            <button key={item.id} type="button" className={targetId === item.id ? 'is-active' : ''} onClick={() => setTargetId(item.id)}>
              <strong>{item.width} × {item.height}</strong><span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="b10-cert-grid">
          <article className="b10-phone-stage" aria-label={`${target.label} responsive specimen`}>
            <div className="b10-phone-meta"><span>{target.label}</span><strong>{target.width} × {target.height}</strong></div>
            <div className="b10-phone-frame" style={{ width: target.width, maxWidth: '100%' }}>
              <div className="b10-phone-topbar">
                <LivingSecurePayMark state="resting" size="xs" presence="polite" />
                <span>My Market</span>
                <button type="button" aria-label="Account">WK</button>
              </div>
              <div className="b10-phone-content">
                <p className="b10-label">YOUR MARKET NEEDS YOU</p>
                <h2>Two things need your attention.</h2>
                <article className="b10-mobile-card b10-mobile-card--attention">
                  <span className="b10-mobile-icon"><FileText size={15} /></span>
                  <div><strong>Renovation agreement</strong><p>KES 1,250,000 · 4 recipients</p><small>Next: confirm the preparation milestone</small></div>
                  <ArrowRight size={15} />
                </article>
                <article className="b10-mobile-card">
                  <span className="b10-mobile-icon"><UsersRound size={15} /></span>
                  <div><strong>School trip contribution</strong><p>12 contributors · waiting peacefully</p><small>Nothing is required from you right now.</small></div>
                </article>

                <label className="b10-mobile-intent"><span>What do you want to do next?</span><textarea rows={3} defaultValue="I want to renovate my mum’s house in Nyeri and pay the contractor, plumber and electrician as each part is confirmed." /></label>

                <div className="b10-mobile-stress"><strong>Wanjiku Njeri wa Kamau & Sons Limited</strong><span>KS2145 · Ruiru, Kenya</span></div>
              </div>
              <nav className="b10-mobile-nav" aria-label="Specimen mobile navigation">
                <button type="button"><Home size={15} /><span>Home</span></button>
                <button type="button" className="is-active"><ListChecks size={15} /><span>Market</span></button>
                <button type="button"><FileText size={15} /><span>Agreements</span></button>
                <button type="button"><UsersRound size={15} /><span>Actions</span></button>
              </nav>
            </div>
          </article>

          <aside className="b10-cert-panel">
            <p className="b10-label">Stress certification</p>
            <h2>What must survive the small screen.</h2>
            <div className="b10-cert-list">
              {STRESS.map(item => <div key={item}><span><Check size={12} /></span><p>{item}</p></div>)}
            </div>
            <div className="b10-cert-law">
              <strong>Locked responsive law</strong>
              <p>44px minimum touch target. 16px mobile form controls to prevent accidental iOS zoom. No horizontal application scroll. Safe-area-aware bottom actions. Long names and KES amounts wrap without hiding meaning.</p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
