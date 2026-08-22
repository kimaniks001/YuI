import { useCallback, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Bell, Eye, Mail, MessageSquareText, Save, Sun } from 'lucide-react';
import TraderShell from '../components/trader/TraderShell';
import TraderPageHeader from '../components/trader/TraderPageHeader';
import { TraderErrorState, TraderLoadingState } from '../components/trader/TraderStates';
import { getMyTraderSettings, updateMyTraderSettings } from '../api/r11TraderEndpoints';
import type { TraderSettingsResponse, UpdateTraderSettingsRequest } from '../api/r11TraderTypes';
import { useAuth } from '../lib/auth';
import { useMarketAtmosphere } from '../lib/marketAtmosphere';

export default function TraderSettings() {
  const { user, session } = useAuth();
  const { theme, setTheme, themes } = useMarketAtmosphere();
  const [settings, setSettings] = useState<TraderSettingsResponse | null>(null);
  const [draft, setDraft] = useState<UpdateTraderSettingsRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    setError(null);
    const result = await getMyTraderSettings(session.accessToken);
    if (!result.ok || !result.data) {
      setError(result.error || 'Your settings could not be loaded.');
      setLoading(false);
      return;
    }
    setSettings(result.data);
    setDraft({
      notifyEmail: result.data.notifyEmail,
      notifySms: result.data.notifySms,
      notifyPush: result.data.notifyPush,
      marketingOptIn: result.data.marketingOptIn,
      profileVisibility: result.data.profileVisibility,
    });
    setLoading(false);
  }, [session?.accessToken]);

  useEffect(() => { void load(); }, [load]);

  if (!user || !session) return <Navigate to="/" replace />;

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    setMessage(null);
    const result = await updateMyTraderSettings(session.accessToken, draft);
    setSaving(false);
    if (!result.ok || !result.data) {
      setMessage(result.error || 'Your settings could not be saved. Nothing was changed.');
      return;
    }
    setSettings(result.data);
    setMessage('Settings saved.');
  };

  const toggle = (key: keyof Pick<UpdateTraderSettingsRequest, 'notifyEmail' | 'notifySms' | 'notifyPush' | 'marketingOptIn'>) => {
    setDraft(current => current ? { ...current, [key]: !current[key] } : current);
  };

  return <TraderShell>
    <TraderPageHeader
      eyebrow="Your preferences"
      title="Settings"
      description="Choose how SecurePay communicates with you and whether your KS Profile is public. Financial, settlement and security authority are not configurable here."
    />

    <section className="b11-settings-atmosphere rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex gap-3"><Sun className="mt-0.5 text-green-700" /><div><h2 className="font-display text-2xl">Market atmosphere</h2><p className="mt-1 text-sm text-ink/55">Choose the atmosphere on this device. It changes mood only — never agreement, identity, money or status truth.</p></div></div>
      <div className="b11-settings-theme-grid mt-5" aria-label="Market atmosphere">
        {themes.map(item => <button key={item.id} type="button" aria-pressed={theme === item.id} className={theme === item.id ? 'is-active' : ''} onClick={() => setTheme(item.id)}><strong>{item.name}</strong><span>{item.atmosphere}</span></button>)}
      </div>
    </section>

    {loading && <TraderLoadingState />}
    {error && <TraderErrorState title="Settings could not be loaded" detail={error} onRetry={() => void load()} />}

    {!loading && !error && draft && settings && <div className="space-y-6">
      {!settings.saved && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">These are SecurePay's explicit default preferences. They have not been saved for your account yet.</div>}

      <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex gap-3"><Bell className="mt-0.5 text-green-700" /><div><h2 className="font-display text-2xl">Notifications</h2><p className="mt-1 text-sm text-ink/55">Choose the channels SecurePay may use for account and trade notifications.</p></div></div>
        <div className="mt-5 divide-y divide-ink/8">
          <ToggleRow icon={<Mail size={17} />} label="Email notifications" checked={draft.notifyEmail} onChange={() => toggle('notifyEmail')} />
          <ToggleRow icon={<MessageSquareText size={17} />} label="SMS notifications" checked={draft.notifySms} onChange={() => toggle('notifySms')} />
          <ToggleRow icon={<Bell size={17} />} label="Push notifications" checked={draft.notifyPush} onChange={() => toggle('notifyPush')} />
        </div>
      </section>

      <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex gap-3"><Eye className="mt-0.5 text-green-700" /><div><h2 className="font-display text-2xl">Privacy & communication</h2><p className="mt-1 text-sm text-ink/55">Control the settings the backend actually supports today.</p></div></div>
        <div className="mt-5 space-y-5">
          <ToggleRow icon={<MessageSquareText size={17} />} label="Marketing communication" checked={draft.marketingOptIn} onChange={() => toggle('marketingOptIn')} />
          <div className="border-t border-ink/8 pt-5">
            <label htmlFor="profile-visibility" className="text-sm font-semibold">KS Profile visibility</label>
            <p className="mt-1 text-xs text-ink/45">This preference records whether your public profile should be PUBLIC or PRIVATE. It does not change agreement or payment authority.</p>
            <select id="profile-visibility" value={draft.profileVisibility} onChange={event => setDraft({ ...draft, profileVisibility: event.target.value as 'PUBLIC' | 'PRIVATE' })} className="mt-3 min-h-11 w-full max-w-sm rounded-xl border border-ink/15 bg-white px-3 text-sm">
              <option value="PUBLIC">Public</option>
              <option value="PRIVATE">Private</option>
            </select>
          </div>
        </div>
      </section>

      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <button type="button" onClick={() => void save()} disabled={saving} className="sp-btn-primary inline-flex min-h-11 items-center gap-2 px-5 text-sm disabled:opacity-50"><Save size={16} /> {saving ? 'Saving…' : 'Save settings'}</button>
        {message && <p className="text-sm text-ink/60">{message}</p>}
      </div>
    </div>}
  </TraderShell>;
}

function ToggleRow({ icon, label, checked, onChange }: { icon: React.ReactNode; label: string; checked: boolean; onChange: () => void }) {
  return <div className="flex min-h-16 items-center justify-between gap-4 py-3"><div className="flex items-center gap-3 text-sm"><span className="text-green-700">{icon}</span><span className="font-medium">{label}</span></div><button type="button" role="switch" aria-checked={checked} onClick={onChange} className={`relative h-7 w-12 rounded-full transition-colors ${checked ? 'bg-green-700' : 'bg-ink/15'}`}><span className={`absolute top-1 size-5 rounded-full bg-white shadow-sm transition-transform ${checked ? 'left-6' : 'left-1'}`} /></button></div>;
}
