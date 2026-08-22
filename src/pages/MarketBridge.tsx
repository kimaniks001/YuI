import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Gamepad2, ShieldCheck, Trash2 } from 'lucide-react';
import TraderShell from '../components/trader/TraderShell';
import { useAuth } from '../lib/auth';
import {
  clearMarketDraftIntent,
  getWorldFromPath,
  marketSignInHref,
  readMarketDraftIntent,
  saveMarketDraftIntent,
} from '../lib/worldMode';

/** MW-19A — explicit simulation-to-Market boundary. Safe draft intent only. */
export default function MarketBridge() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [intentVersion, setIntentVersion] = useState(0);
  const currentWorld = getWorldFromPath(location.pathname);

  useEffect(() => {
    const source = new URLSearchParams(location.search).get('source');
    const sourcePath = new URLSearchParams(location.search).get('from');
    if ((source === 'trainer' || source === 'game') && sourcePath) {
      saveMarketDraftIntent(source, sourcePath, '/create');
      setIntentVersion(v => v + 1);
    }
  }, [location.search]);

  const intent = useMemo(() => readMarketDraftIntent(), [intentVersion]);

  function discard() {
    clearMarketDraftIntent();
    setIntentVersion(v => v + 1);
  }

  function continueReal() {
    const target = intent?.targetPath || '/create';
    clearMarketDraftIntent();
    navigate(target);
  }

  return <TraderShell>
    <div className="mx-auto max-w-3xl space-y-6 py-4 sm:py-8">
      <section className="rounded-3xl border border-green-700/12 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-2 text-green-700"><ShieldCheck size={19} /><span className="text-xs font-bold uppercase tracking-[0.18em]">Real Market boundary</span></div>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl">Ready to do this for real?</h1>
        <p className="mt-3 text-sm leading-6 text-ink/60">Trainer and Game can teach, rehearse and help shape an intention. They cannot create real agreement, money, payment, release, settlement, Master or reputation truth.</p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <Boundary title="What can cross" items={['The fact that you want to continue', 'A safe destination inside SecurePay', 'A draft intention that you must review again in Market']} />
        <Boundary title="What never crosses" danger items={['Game coins or Game balances', 'Simulated agreement or payment state', 'Game Master status or leaderboard standing', 'Simulated evidence, release or settlement truth']} />
      </section>

      {intent ? <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-2 text-ink/60">{intent.sourceWorld === 'game' ? <Gamepad2 size={18} /> : <CheckCircle2 size={18} />}<strong className="text-sm">Draft continuation from {intent.sourceWorld === 'game' ? 'Game' : 'Trainer'}</strong></div>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><div><dt className="text-xs font-semibold uppercase tracking-wide text-ink/40">Came from</dt><dd className="mt-1 break-all text-ink/70">{intent.sourcePath}</dd></div><div><dt className="text-xs font-semibold uppercase tracking-wide text-ink/40">Real Market destination</dt><dd className="mt-1 text-ink/70">{intent.targetPath}</dd></div></dl>
        <p className="mt-4 rounded-xl bg-[#f7f8f4] p-3 text-xs leading-5 text-ink/50">This is only navigation intent. SecurePay will ask for real identity, parties, payer, terms, evidence and any required financial authority again.</p>

        <div className="mt-5 flex flex-wrap gap-3">
          {user ? <button type="button" onClick={continueReal} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-green-700 px-5 text-sm font-semibold text-white">Review in Real Market <ArrowRight size={15} /></button> : <Link to={marketSignInHref('/market/continue')} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-green-700 px-5 text-sm font-semibold text-white">Sign in before going real <ArrowRight size={15} /></Link>}
          <button type="button" onClick={discard} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-ink/15 px-5 text-sm font-semibold text-ink/65"><Trash2 size={15} /> Discard draft</button>
        </div>
      </section> : <section className="rounded-2xl border border-ink/8 bg-white p-5 text-center shadow-sm sm:p-6"><p className="text-sm text-ink/55">There is no Trainer or Game draft waiting to enter the Real Market.</p><Link to="/" className="mt-3 inline-flex min-h-11 items-center rounded-full border border-green-700/20 px-5 text-sm font-semibold text-green-700">Go to Market</Link></section>}

      <p className="text-center text-xs text-ink/40">Current page classification: {currentWorld === 'market' ? 'REAL MARKET' : currentWorld.toUpperCase()}. Money should follow the agreement.</p>
    </div>
  </TraderShell>;
}

function Boundary({ title, items, danger = false }: { title: string; items: string[]; danger?: boolean }) {
  return <div className={`rounded-2xl border p-5 shadow-sm ${danger ? 'border-amber-200 bg-amber-50/60' : 'border-green-700/10 bg-green-50/50'}`}><p className={`text-xs font-bold uppercase tracking-[0.16em] ${danger ? 'text-amber-800' : 'text-green-700'}`}>{title}</p><ul className="mt-3 space-y-2">{items.map(item => <li key={item} className="flex gap-2 text-sm text-ink/65"><span aria-hidden="true">•</span><span>{item}</span></li>)}</ul></div>;
}
