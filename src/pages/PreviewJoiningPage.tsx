import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarDays, Check, Clock3, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import LivingSecurePayMark from '../components/LivingSecurePayMark';

type JoiningState = 'invited' | 'ready' | 'joined' | 'confirmed' | 'group' | 'expired';

const states: Array<{ id: JoiningState; label: string }> = [
  { id: 'invited', label: 'Invitation' },
  { id: 'ready', label: 'Signed in' },
  { id: 'joined', label: 'Joined' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'group', label: 'Group invite' },
  { id: 'expired', label: 'Expired' },
];

const stateCopy: Record<JoiningState, {
  eyebrow: string;
  title: string;
  intro: string;
  role: string;
  amount: string;
  purpose: string;
  happened: string;
  means: string;
  next: string;
}> = {
  invited: {
    eyebrow: 'A trade is inviting you in',
    title: 'Sofa purchase and delivery to Ruiru',
    intro: 'Someone has shared an agreement with you. Read the trade before you decide what to do.',
    role: 'Buyer / payer',
    amount: 'KES 35,000',
    purpose: 'Buy a sofa set and have it delivered to Ruiru.',
    happened: 'You received an invitation to a proposed agreement.',
    means: 'You have not joined, accepted, funded or confirmed anything by opening this page.',
    next: 'Sign in with the KSNumber that should take this role, then review the exact invitation.',
  },
  ready: {
    eyebrow: 'SecurePay knows who is at the door',
    title: 'Sofa purchase and delivery to Ruiru',
    intro: 'You are signed in as KS4821. SecurePay can now ask the backend whether this invitation belongs to that identity.',
    role: 'Buyer / payer',
    amount: 'KES 35,000',
    purpose: 'Buy a sofa set and have it delivered to Ruiru.',
    happened: 'Your SecurePay identity is signed in for this invitation.',
    means: 'Signing in does not join the agreement or move money.',
    next: 'Join only if this is the role and trade you expected.',
  },
  joined: {
    eyebrow: 'You are now part of this trade',
    title: 'Sofa purchase and delivery to Ruiru',
    intro: 'SecurePay has recorded your participation in this invitation. Your exact agreement version still needs your own confirmation.',
    role: 'Buyer / payer',
    amount: 'KES 35,000',
    purpose: 'Buy a sofa set and have it delivered to Ruiru.',
    happened: 'Your KSNumber joined this invitation.',
    means: 'Joined is not the same as confirmed. It is not Payment Ready and no money has moved.',
    next: 'Read the exact joined version, then confirm your own participation if it is correct.',
  },
  confirmed: {
    eyebrow: 'Your part is clear',
    title: 'Sofa purchase and delivery to Ruiru',
    intro: 'You confirmed your own participation in this exact agreement version.',
    role: 'Buyer / payer',
    amount: 'KES 35,000',
    purpose: 'Buy a sofa set and have it delivered to Ruiru.',
    happened: 'Your participation in version 2 was confirmed.',
    means: 'This confirms only your side. It does not prove the other participant confirmed and does not create Payment Ready.',
    next: 'Open the agreement workspace to see what the trade now needs.',
  },
  group: {
    eyebrow: 'A group purpose is inviting you in',
    title: 'School trip contribution',
    intro: 'Parents are contributing toward one governed purpose. SecurePay keeps contribution intent separate from proof of payment.',
    role: 'Contributor',
    amount: 'You choose your contribution',
    purpose: 'Support transport and supplier costs for the school trip.',
    happened: 'You opened a Group SecureLink invitation.',
    means: 'Viewing the group does not record a contribution, approve governance or move money.',
    next: 'Review the purpose and organizer information, then sign in before recording any contribution intent.',
  },
  expired: {
    eyebrow: 'This doorway is no longer open',
    title: 'Invitation expired',
    intro: 'SecurePay will not quietly continue an expired invitation. Nothing new can be joined from this link.',
    role: 'Not active',
    amount: 'No new action available',
    purpose: 'The original proposal remains a historical invitation only.',
    happened: 'The invitation reached its backend expiry time.',
    means: 'The link cannot be used to join now. Expiry does not imply money moved or a trade completed.',
    next: 'Ask the person you are trading with to create or send a current invitation if the trade should continue.',
  },
};

function posture(state: JoiningState): { mark: 'guiding' | 'waiting' | 'success' | 'complete' | 'caution'; presence: 'polite' | 'present' | 'commanding' } {
  if (state === 'expired') return { mark: 'caution', presence: 'commanding' };
  if (state === 'confirmed') return { mark: 'complete', presence: 'present' };
  if (state === 'joined') return { mark: 'success', presence: 'present' };
  if (state === 'group') return { mark: 'guiding', presence: 'present' };
  return { mark: 'guiding', presence: 'polite' };
}

export default function PreviewJoiningPage() {
  const [state, setState] = useState<JoiningState>('invited');
  const content = stateCopy[state];
  const mark = useMemo(() => posture(state), [state]);

  return (
    <div className="b5-join-preview">
      <header className="b5-door-header">
        <div className="b5-door-header__inner">
          <Link to="/review" className="b5-door-back"><ArrowLeft size={15} /> Review room</Link>
          <LivingSecurePayMark state={mark.mark} size="md" presence={mark.presence} label={state === 'expired' ? 'This invitation needs attention' : 'SecurePay is guiding this invitation'} />
          <span className="b5-preview-pill">Preview · no backend writes</span>
        </div>
      </header>

      <main className="b5-door-shell">
        <section className="b5-fixture-strip" aria-label="Invitation review states">
          <p>Experience the doorway</p>
          <div>{states.map(item => <button key={item.id} type="button" data-selected={item.id === state} onClick={() => setState(item.id)}>{item.label}</button>)}</div>
        </section>

        <div className="b5-door-grid">
          <section className="b5-invite-card" data-state={state}>
            <div className="b5-invite-card__mark"><LivingSecurePayMark state={mark.mark} size="lg" presence={mark.presence} decorative /></div>
            <p className="b5-kicker">{content.eyebrow}</p>
            <h1>{content.title}</h1>
            <p className="b5-invite-intro">{content.intro}</p>

            <div className="b5-invite-facts">
              <div><span>Your role</span><strong>{content.role}</strong></div>
              <div><span>Money involved</span><strong>{content.amount}</strong></div>
              <div className="b5-invite-facts__wide"><span>What the trade is for</span><strong>{content.purpose}</strong></div>
            </div>

            <div className="b5-invite-party">
              <span className="b5-invite-party__avatar">MW</span>
              <div><strong>Mwangaza Furnishings · KS7314</strong><span>Example counterparty for visual review</span></div>
            </div>
            <p className="b5-source-note">Fixture only. The current live public invitation endpoint does not expose the inviter identity, so canonical SecurePay does not invent it.</p>
          </section>

          <aside className="b5-joining-story">
            <div className="b5-joining-step"><span>1</span><div><p>What happened</p><strong>{content.happened}</strong></div></div>
            <div className="b5-joining-step"><span>2</span><div><p>What it means</p><strong>{content.means}</strong></div></div>
            <div className="b5-joining-step b5-joining-step--next"><span>3</span><div><p>What can I do next?</p><strong>{content.next}</strong></div></div>

            {state === 'group' && <div className="b5-group-note"><UsersRound size={17} /><div><strong>Many people, one purpose</strong><span>Contribution intention and confirmed money remain visually separate.</span></div></div>}
            {state === 'expired' && <div className="b5-expiry-note"><Clock3 size={17} /><div><strong>Nothing to rescue silently</strong><span>SecurePay asks for a current invitation rather than extending authority in the browser.</span></div></div>}

            <button type="button" className="b5-primary-action" disabled={state === 'expired'}>
              {state === 'invited' ? 'Sign in to continue' : state === 'ready' ? 'Join this agreement' : state === 'joined' ? 'Confirm this version' : state === 'confirmed' ? 'Open agreement workspace' : state === 'group' ? 'Sign in to contribute' : 'Invitation expired'}
              {state !== 'expired' && (state === 'confirmed' ? <Check size={15} /> : <ArrowRight size={15} />)}
            </button>
            <p className="b5-action-safety">This visual review never joins, confirms, contributes or moves money. Live authority remains in SecurePayAPI.</p>
          </aside>
        </div>

        <section className="b5-door-principles">
          <div><CalendarDays size={17} /><strong>Expiry is visible</strong><span>An invitation has a real time boundary.</span></div>
          <div><UsersRound size={17} /><strong>Role comes before action</strong><span>Creator, payer and recipient are never assumed to be the same person.</span></div>
          <div><LivingSecurePayMark state="guiding" size="sm" presence="polite" decorative /><strong>SecurePay stays beside the decision</strong><span>The mark guides; it does not decorate or manufacture agreement truth.</span></div>
        </section>
      </main>
    </div>
  );
}
