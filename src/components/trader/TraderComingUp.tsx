import { useMemo, useState } from 'react';
import { ArrowRight, CalendarDays, Clock3, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { CurrentUserAgreementSummary } from '../../api/securepayTypes';
import { buildTraderPlanningWeek, collectTraderPlannerEvents } from '../../lib/traderPlanning';
import '../../trader-home.css';

export default function TraderComingUp({
  agreements,
  onUseDate,
}: {
  agreements: CurrentUserAgreementSummary[];
  onUseDate: (date: Date) => void;
}) {
  const events = useMemo(() => collectTraderPlannerEvents(agreements), [agreements]);
  const days = useMemo(() => buildTraderPlanningWeek(events), [events]);
  const firstDatedDay = days.find(day => day.events.length > 0)?.key;
  const [selectedKey, setSelectedKey] = useState(firstDatedDay ?? days[0]?.key ?? '');
  const selected = days.find(day => day.key === selectedKey) ?? days[0];

  if (!selected) return null;

  return (
    <section className="trader-coming-up" aria-labelledby="trader-coming-up-heading">
      <div className="trader-coming-up-head">
        <div>
          <p className="trader-home-kicker">Coming up</p>
          <h2 id="trader-coming-up-heading">Your next 7 days</h2>
        </div>
        <span className="trader-coming-up-scope"><CalendarDays size={13} /> Agreement dates only</span>
      </div>

      <div className="trader-coming-up-days" role="tablist" aria-label="SecurePay agreement commitments for the next seven days">
        {days.map((day, index) => {
          const selectedDay = day.key === selected.key;
          return (
            <button
              key={day.key}
              type="button"
              role="tab"
              aria-selected={selectedDay}
              onClick={() => setSelectedKey(day.key)}
              className={`trader-coming-up-day${selectedDay ? ' is-selected' : ''}${day.events.some(event => event.attention) ? ' has-attention' : ''}`}
            >
              <span>{index === 0 ? 'Today' : day.date.toLocaleDateString('en-KE', { weekday: 'short' })}</span>
              <strong>{day.date.getDate()}</strong>
              <small>{day.events.length ? `${day.events.length} due` : '0 SecurePay'}</small>
            </button>
          );
        })}
      </div>

      <div className="trader-coming-up-detail" role="tabpanel">
        <div className="trader-coming-up-date">
          <strong>{selected.date.toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'short' })}</strong>
          <button type="button" onClick={() => onUseDate(selected.date)}><Plus size={14} /> Plan on this day</button>
        </div>

        {selected.events.length ? (
          <div className="trader-coming-up-events">
            {selected.events.slice(0, 2).map(event => (
              <Link key={`${event.agreementId}:${event.deadline.toISOString()}:${event.reason}`} to={`/agreements/${encodeURIComponent(event.agreementId)}`} className={`trader-coming-up-event${event.attention ? ' is-attention' : ''}`}>
                <span className="trader-coming-up-time"><Clock3 size={13} /> {event.deadline.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}</span>
                <span className="trader-coming-up-event-copy"><strong>{event.title}</strong><small>{event.reason}</small></span>
                <ArrowRight size={15} />
              </Link>
            ))}
            {selected.events.length > 2 && <Link to="/agreements" className="trader-coming-up-more">+{selected.events.length - 2} more <ArrowRight size={13} /></Link>}
          </div>
        ) : (
          <div className="trader-coming-up-clear">
            <span>No SecurePay agreement commitments are recorded for this day.</span>
            <button type="button" onClick={() => onUseDate(selected.date)}>Use this date <ArrowRight size={13} /></button>
          </div>
        )}
      </div>
    </section>
  );
}
