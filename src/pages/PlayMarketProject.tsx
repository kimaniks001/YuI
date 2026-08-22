import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  CheckCircle2,
  Handshake,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';
import LivingSecurePayMark from '../components/LivingSecurePayMark';
import {
  MARKET_PROJECTS,
  executeMarketProject,
  formatDemoKes,
  readMarketSession,
  type MarketGameSession,
} from '../lib/playMarket';

export default function PlayMarketProject() {
  const { projectId } = useParams();
  const [session, setSession] = useState<MarketGameSession | null>(() => readMarketSession());
  const [partnerId, setPartnerId] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<ReturnType<typeof executeMarketProject> | null>(null);
  const project = useMemo(() => MARKET_PROJECTS.find(item => item.id === projectId), [projectId]);

  if (!session || !project) {
    return <main className="play-market-page"><section className="play-market-empty"><LivingSecurePayMark state="guiding" size="lg" presence="present" /><h1>That project is not available.</h1><p>Return to the project board and choose another task.</p><Link to="/play/market" className="play-market-primary"><ArrowLeft size={15} /> Project board</Link></section></main>;
  }

  const player = session.players[session.activePlayerIndex];
  const partners = session.players.filter(item => item.id !== player.id);
  const alreadyDone = player.completedProjectIds.includes(project.id);
  const canAfford = player.capital >= project.commitment;
  const partnerFee = partnerId ? Math.max(1_000, Math.round(project.commitment * .04)) : 0;

  const choose = (choiceId: string) => {
    setError('');
    try {
      const nextResult = executeMarketProject(session, project.id, choiceId, partnerId || undefined);
      setSession(nextResult.session);
      setResult(nextResult);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'This project could not be completed.');
    }
  };

  if (result) {
    const positive = result.capitalDelta >= 0;
    return <main className="play-market-page play-market-result-page">
      <section className="play-market-result">
        <LivingSecurePayMark state="complete" size="lg" presence="present" />
        <p className="play-market-kicker">PROJECT COMPLETE · EXPLORER RESULT</p>
        <h1>{result.choice.outcome}</h1>
        <div className="play-market-result-numbers">
          <article><span>CAPITAL RESULT</span><strong className={positive ? 'is-positive' : 'is-negative'}>{result.capitalDelta >= 0 ? '+' : ''}{formatDemoKes(result.capitalDelta)}</strong></article>
          <article><span>XP EARNED</span><strong>+{result.choice.xp}</strong></article>
          <article><span>REPUTATION</span><strong>{result.choice.reputation >= 0 ? '+' : ''}{result.choice.reputation}</strong></article>
        </div>
        {result.partnerName && <div className="play-market-partner-result"><Handshake size={18} /><span><strong>{result.partnerName}</strong> earned {formatDemoKes(result.partnerFee)} Demo Capital as your {result.project.partnerRole ?? 'project partner'}.</span></div>}
        <blockquote><strong>What this teaches:</strong> {result.choice.lesson}</blockquote>
        {result.awardedBadges.length > 0 && <div className="play-market-earned"><CheckCircle2 size={18} /><span>Badge earned: <strong>{result.awardedBadges.join(', ')}</strong></span></div>}
        {session.players.length > 1 && <p className="play-market-next-turn">The Market now passes to <strong>{result.session.players[result.session.activePlayerIndex].name}</strong>.</p>}
        <div className="play-market-result-actions"><Link to="/play/market" className="play-market-primary">Return to the Market <ArrowRight size={16} /></Link><Link to="/play/leaderboard" className="play-market-secondary">See leaderboard</Link></div>
        <small>Demo result only. This page does not create an agreement, move money or declare real SecurePay financial truth.</small>
      </section>
    </main>;
  }

  return (
    <main className="play-market-page play-market-project-page">
      <header className="play-market-project-head">
        <Link to="/play/market" className="play-market-back"><ArrowLeft size={14} /> Project board</Link>
        <p className="play-market-kicker">{project.category.toUpperCase()} PROJECT · {project.place.toUpperCase()}</p>
        <h1>{project.title}</h1>
        <p>{project.brief}</p>
        <div className="play-market-project-facts">
          <article><Banknote size={17} /><span><small>DEMO CAPITAL NEEDED</small><strong>{formatDemoKes(project.commitment)}</strong></span></article>
          <article><Target size={17} /><span><small>DIFFICULTY</small><strong>{project.difficulty}/5</strong></span></article>
          <article><ShieldCheck size={17} /><span><small>YOUR CAPITAL</small><strong>{formatDemoKes(player.capital)}</strong></span></article>
        </div>
      </header>

      {!canAfford && <div className="play-market-project-warning"><Banknote size={18} /><div><strong>You do not have enough Demo Capital for this project yet.</strong><span>Build your capital on smaller projects first. Starting capital affects what you can take on, but the leaderboard still rewards efficiency rather than raw wealth.</span></div></div>}
      {alreadyDone && <div className="play-market-project-warning"><CheckCircle2 size={18} /><div><strong>You already completed this project.</strong><span>Each trader gets one attempt at each project in this test deck.</span></div></div>}

      {partners.length > 0 && project.partnerEligible && <section className="play-market-partner-picker">
        <div><Users size={20} /><span><p>TRADE WITH ANOTHER PLAYER</p><h2>Bring someone into the project.</h2><small>Optional. A partner receives 4% of the project commitment as Demo Capital and earns reputation/XP. This is how a multiplayer Market becomes an economy, not just a race.</small></span></div>
        <label><span>Project partner</span><select value={partnerId} onChange={event => setPartnerId(event.target.value)}><option value="">No player partner this time</option>{partners.map(partner => <option value={partner.id} key={partner.id}>{partner.name} · {project.partnerRole}</option>)}</select></label>
        {partnerId && <p className="play-market-partner-fee"><Handshake size={15} /> Partner trade: {formatDemoKes(partnerFee)} Demo Capital moves to that player if you complete the project.</p>}
      </section>}

      <section className="play-market-decisions">
        <div className="play-market-section-head"><div><p>YOUR DECISION</p><h2>How will you structure the trade?</h2><span>There is no hidden “correct answer” button. Read the trade-off and choose the approach you are prepared to live with.</span></div><Sparkles size={22} /></div>
        <div className="play-market-choice-grid">
          {project.choices.map(choice => (
            <article className={`play-market-choice is-${choice.kind}`} key={choice.id}>
              <span className="play-market-choice-type">{choice.kind === 'agreement' ? 'AGREEMENT FIRST' : choice.kind === 'milestone' ? 'CONTROLLED STEP' : 'RUSH THE DEAL'}</span>
              <h3>{choice.label}</h3>
              <p>{choice.description}</p>
              <div className="play-market-choice-impact"><span>Potential Explorer effect</span><strong className={choice.deltaPct >= 0 ? 'is-positive' : 'is-negative'}>{choice.deltaPct >= 0 ? '+' : ''}{Math.round(choice.deltaPct * 100)}% project result</strong><small>+{choice.xp} XP · {choice.reputation >= 0 ? '+' : ''}{choice.reputation} reputation</small></div>
              <button type="button" disabled={!canAfford || alreadyDone} onClick={() => choose(choice.id)}>Choose this approach <ArrowRight size={15} /></button>
            </article>
          ))}
        </div>
        {error && <p className="play-market-error">{error}</p>}
      </section>

      <section className="play-market-project-truth"><LivingSecurePayMark state="resting" size="xs" presence="polite" /><span><strong>Game rule:</strong> these outcomes teach decision-making; they are not predictions or guarantees about real trade. Real SecurePay states will come only from the real API and financial rails.</span></section>
    </main>
  );
}
