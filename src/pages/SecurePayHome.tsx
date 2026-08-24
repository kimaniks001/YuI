import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Copy,
  Gift,
  Handshake,
  LayoutGrid,
  RefreshCw,
  Store,
  UsersRound,
  WalletCards,
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useTraderWorkspace } from '../lib/useTraderWorkspace';
import { getMyCircle, getMyReferralHistory } from '../api/r11TraderEndpoints';
import type { CircleProfileResponse, ReferralHistoryResponse } from '../api/r11TraderTypes';
import type { CurrentUserAgreementSummary } from '../api/securepayTypes';
import TraderShell from '../components/trader/TraderShell';
import TraderAgreementCard from '../components/trader/TraderAgreementCard';
import TraderComingUp, { countComingUpThisWeek } from '../components/trader/TraderComingUp';
import { TraderLoadingState } from '../components/trader/TraderStates';
import { createCreationIntentFromText, saveCreationIntent } from '../lib/creationIntent';
import { agreementStatusLabel } from '../lib/agreementStateLanguage';
import { formatDecimalMinorMoney } from '../lib/formatMinorMoney';

function greeting(name?: string | null): string {
  const hour = new Date().getHours();
  const part = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  return name ? `${part}, ${name}` : part;
}

function safeDeadline(agreement: CurrentUserAgreementSummary): Date | null {
  const values = [
    ...agreement.nextActions.map(action => action.deadline),
    agreement.nextDeadline,
  ].filter((value): value is string => Boolean(value));

  const parsed = values
    .map(value => new Date(value))
    .filter(value => !Number.isNaN(value.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());

  return parsed[0] ?? null;
}

function sortByNearestDeadline(items: CurrentUserAgreementSummary[]): CurrentUserAgreementSummary[] {
  return [...items].sort((a, b) => {
    const aDeadline = safeDeadline(a)?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const bDeadline = safeDeadline(b)?.getTime() ?? Number.MAX_SAFE_INTEGER;
    return aDeadline - bDeadline;
  });
}

export default function SecurePayHome() {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const { state, agreements, activity, activityAvailable, retry } = useTraderWorkspace();
  const [circle, setCircle] = useState<CircleProfileResponse | null>(null);
  const [referrals, setReferrals] = useState<ReferralHistoryResponse | null>(null);
  const [agreementDraft, setAgreementDraft] = useState('');
  const agreementInputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!session?.accessToken) return;
    let cancelled = false;
    void Promise.all([
      getMyCircle(session.accessToken),
      getMyReferralHistory(session.accessToken),
    ]).then(([circleResult, referralResult]) => {
      if (cancelled) return;
      if (circleResult.ok && circleResult.data) setCircle(circleResult.data);
      if (referralResult.ok && referralResult.data) setReferrals(referralResult.data);
    });
    return () => { cancelled = true; };
  }, [session?.accessToken]);

  if (!user) return <Navigate to="/" replace />;

  const name = user.displayName?.trim();
  const active = agreements.filter(item => !['CANCELLED', 'EXPIRED'].includes(item.status.toUpperCase()));
  const attention = sortByNearestDeadline(active.filter(item => item.attentionRequired));
  const comingUpCount = countComingUpThisWeek(active);
  const primaryAgreement = attention[0] ?? sortByNearestDeadline(active.filter(item => safeDeadline(item) !== null))[0] ?? active[0] ?? null;
  const primaryAction = primaryAgreement?.nextActions[0] ?? null;
  const primaryDeadline = primaryAgreement ? safeDeadline(primaryAgreement) : null;
  const primaryAmount = primaryAgreement?.proposedAmountMinor != null && primaryAgreement.currency
    ? formatDecimalMinorMoney(primaryAgreement.currency, primaryAgreement.proposedAmountMinor)
    : null;

  const situation = attention.length > 0
    ? {
        title: `${attention.length} agreement${attention.length === 1 ? '' : 's'} need${attention.length === 1 ? 's' : ''} you.`,
        detail: attention.length === 1
          ? 'SecurePay has an authoritative next action waiting for you.'
          : 'SecurePay has authoritative next actions waiting for you.',
      }
    : active.length > 0
      ? {
          title: 'Nothing urgent is showing.',
          detail: `${active.length} active agreement${active.length === 1 ? ' is' : 's are'} still moving.`,
        }
      : {
          title: 'Ready when you are.',
          detail: 'Start with what you want to agree.',
        };

  const startAgreement = () => {
    const statement = agreementDraft.trim();
    if (!statement) return;
    const intent = createCreationIntentFromText(statement);
    saveCreationIntent(intent);
    navigate('/create/journey', { state: { intent } });
  };

  const usePlanningDate = (date: Date) => {
    const label = date.toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long' });
    setAgreementDraft(`I want to plan an agreement for ${label}`);
    window.requestAnimationFrame(() => {
      document.getElementById('start-agreement')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      agreementInputRef.current?.focus();
    });
  };

  return <TraderShell actionCount={attention.length}>
    {state === 'loading' && <TraderLoadingState />}

    {state === 'error' && (
      <section className="trader-home-inline-error" role="alert">
        <div><strong>We couldn’t load your agreements.</strong><span>Nothing was changed.</span></div>
        <button type="button" onClick={retry}><RefreshCw size={14} /> Try again</button>
      </section>
    )}

    {state === 'ready' && <div className="trader-home-space">
      <section className="trader-home-today" aria-labelledby="trader-home-title">
        <div className="trader-home-topline">
          <div className="min-w-0">
            <p className="trader-home-kicker">{greeting(name)}</p>
            <h1 id="trader-home-title">{situation.title}</h1>
            <p className="trader-home-situation-copy">{situation.detail}</p>
          </div>
          {user.ksNumber && (
            <button
              type="button"
              className="trader-home-identity-chip"
              onClick={() => void navigator.clipboard.writeText(user.ksNumber!)}
              aria-label={`Copy KSNumber ${user.ksNumber}`}
            >
              <span>{user.ksNumber}</span><Copy size={13} />
            </button>
          )}
        </div>

        <nav className="trader-home-situation-strip" aria-label="Your agreement situation">
          <Link to="/actions" className={attention.length ? 'has-attention' : ''}><span>Need you</span><strong>{attention.length}</strong></Link>
          <Link to="/agreements"><span>Active</span><strong>{active.length}</strong></Link>
          <a href="#coming-up"><span>This week</span><strong>{comingUpCount}</strong></a>
          <a href="#recent-activity"><span>Recent</span><strong>{activityAvailable ? activity.length : '—'}</strong></a>
        </nav>

        <div className="trader-home-now-grid">
          {primaryAgreement ? (
            <Link
              to={`/agreements/${encodeURIComponent(primaryAgreement.agreementId)}`}
              className={`trader-home-focus${primaryAgreement.attentionRequired ? ' is-attention' : ''}`}
            >
              <div className="trader-home-focus-copy">
                <span className="trader-home-focus-badge">{primaryAgreement.attentionRequired ? 'Needs you' : 'In focus'}</span>
                <h2>{primaryAgreement.title}</h2>
                <p>{primaryAction?.reason || agreementStatusLabel(primaryAgreement.status)}</p>
              </div>
              <div className="trader-home-focus-meta">
                {primaryDeadline && <span><CalendarDays size={13} /> {primaryDeadline.toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}{' · '}{primaryDeadline.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}</span>}
                {primaryAmount && <strong>{primaryAmount}</strong>}
                <em>{primaryAgreement.attentionRequired ? 'Review now' : 'View agreement'} <ArrowRight size={14} /></em>
              </div>
            </Link>
          ) : (
            <div className="trader-home-calm">
              <CheckCircle2 size={19} />
              <div><strong>No active agreements yet.</strong><span>Your next agreement can start in your own words.</span></div>
            </div>
          )}

          <form
            id="start-agreement"
            className="trader-home-agreement-entry"
            aria-label="Start an agreement from your own words"
            onSubmit={event => {
              event.preventDefault();
              startAgreement();
            }}
          >
            <div>
              <label htmlFor="signed-in-agreement-entry">What would you like to agree?</label>
              <textarea
                ref={agreementInputRef}
                id="signed-in-agreement-entry"
                value={agreementDraft}
                onChange={event => setAgreementDraft(event.target.value)}
                onKeyDown={event => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    startAgreement();
                  }
                }}
                rows={2}
                maxLength={420}
                placeholder="I’m buying a fridge for KES 45,000…"
                aria-label="What would you like to agree today?"
              />
            </div>
            <button type="submit" disabled={!agreementDraft.trim()} aria-label="Start this agreement"><ArrowRight size={21} /></button>
          </form>
        </div>

        <div id="coming-up">
          <TraderComingUp agreements={active} onUseDate={usePlanningDate} />
        </div>
      </section>

      <section className="trader-home-section" aria-labelledby="home-active-agreements">
        <div className="trader-home-section-head">
          <div><p className="trader-home-kicker">Your agreements</p><h2 id="home-active-agreements">Active now</h2></div>
          <Link to="/agreements">See all <ArrowRight size={14} /></Link>
        </div>
        {active.length ? (
          <div className="trader-home-agreement-list">
            {sortByNearestDeadline(active).slice(0, 2).map(item => <TraderAgreementCard key={item.agreementId} agreement={item} compact />)}
          </div>
        ) : (
          <button type="button" className="trader-home-empty-action" onClick={() => agreementInputRef.current?.focus()}>
            <Handshake size={18} /><span><strong>No active agreements.</strong><small>Start one above whenever you’re ready.</small></span><ArrowRight size={14} />
          </button>
        )}
      </section>

      <section className="trader-home-section" aria-labelledby="around-your-trade">
        <div className="trader-home-section-head">
          <div><p className="trader-home-kicker">Around you</p><h2 id="around-your-trade">Your trade, one swipe away</h2></div>
        </div>
        <div className="trader-home-around-rail">
          <HomeRailLink to="/market" icon={<LayoutGrid size={18} />} label="My Market" value={`${active.length} active`} />
          <HomeRailLink to="/store" icon={<Store size={18} />} label="Your Store" value="Open studio" />
          <HomeRailLink to="/money" icon={<WalletCards size={18} />} label="Money" value="Account & settlement" />
          <HomeRailLink to="/community" icon={<UsersRound size={18} />} label="Your Circle" value={circle ? `${circle.activatedReferredTraderCount} active` : 'Community'} />
          <HomeRailLink to="/referrals" icon={<Gift size={18} />} label="Referrals" value={referrals ? `${referrals.totalReferred} introduced` : 'Your introductions'} life />
        </div>
      </section>

      <section id="recent-activity" className="trader-home-section" aria-labelledby="home-recent-activity">
        <div className="trader-home-section-head">
          <div><p className="trader-home-kicker">Recently</p><h2 id="home-recent-activity">What just happened</h2></div>
        </div>
        {!activityAvailable ? (
          <div className="trader-home-activity-unavailable"><span>Recent activity is unavailable. Your agreements are unchanged.</span><button type="button" onClick={retry}>Retry</button></div>
        ) : activity.length ? (
          <ul className="trader-home-activity-list">
            {activity.slice(0, 2).map(item => (
              <li key={item.id}>
                <span className="trader-home-activity-dot" />
                <div><strong>{item.description}</strong><time>{new Date(item.timestamp).toLocaleString('en-KE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</time></div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="trader-home-calm compact"><Clock3 size={17} /><span>No recent movement recorded.</span></div>
        )}
      </section>
    </div>}
  </TraderShell>;
}

function HomeRailLink({ to, icon, label, value, life = false }: { to: string; icon: React.ReactNode; label: string; value: string; life?: boolean }) {
  return (
    <Link to={to} className={`trader-home-around-card${life ? ' is-life' : ''}`}>
      <span className="trader-home-around-icon">{icon}</span>
      <strong>{label}</strong>
      <small>{value}</small>
      <ArrowRight size={14} />
    </Link>
  );
}
