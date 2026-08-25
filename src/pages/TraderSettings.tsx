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
    setLoading(true); setError(null);
    const result = await getMyTraderSettings(session.accessToken);
    if (!result.ok || !result.data) { setError(result.error || 'Your settings could not be loaded.'); setLoading(false); return; }
    setSettings(result.data);
    setDraft({ notifyEmail: result.data.notifyEmail, notifySms: result.data.notifySms, notifyPush: result.data.notifyPush, marketingOptIn: result.data.marketingOptIn, profileVisibility: result.data.profileVisibility });
    setLoading(false);
  }, [session?.accessToken]);

  useEffect(() => { void load(); }, [load]);
  if (!user || !session) return <Navigate to="/" replace />;

  const save = async () => {
    if (!draft) return;
    setSaving(true); setMessage(null);
    const result = await updateMyTraderSettings(session.accessToken, draft);
    setSaving(false);
    if (!result.ok || !result.data) { setMessage(result.error || 'Settings were not changed.'); return; }
    setSettings(result.data); setMessage('Settings saved.');
  };
  const toggle = (key: keyof Pick<UpdateTraderSettingsRequest, 'notifyEmail' | 'notifySms' | 'notifyPush' | 'marketingOptIn'>) => setDraft(current => current ? { ...current, [key]: !current[key] } : current);

  return <TraderShell>
    <TraderPageHeader eyebrow="Settings" title={<>Your <span className="text-green-700">preferences</span></>} description="Choose your notifications, profile visibility and device atmosphere." />

    {loading && <TraderLoadingState label="Loading settings…" />}
    {error && <TraderErrorState title="Settings could not be loaded" detail={error} onRetry={() => void load()} />}

    {!loading && !error && draft && settings && <div className="space-y-5">
      {!settings.saved && <div className="trader-compact-state trader-compact-state--waiting"><span className="trader-compact-state-icon"><Save size={15} /></span><div><p className="trader-compact-state-eyebrow">Not saved yet</p><h2>Using SecurePay defaults</h2></div></div>}

      <section className="market-section-shell"><div className="mb-2 flex items-center gap-3"><span className="market-section-icon"><Bell size={17} /></span><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-green-700">Notifications</p><h2 className="market-section-title">How SecurePay reaches you</h2></div></div><div className="divide-y divide-ink/8"><ToggleRow icon={<Mail size={16} />} label="Email" checked={draft.notifyEmail} onChange={() => toggle('notifyEmail')} /><ToggleRow icon={<MessageSquareText size={16} />} label="SMS" checked={draft.notifySms} onChange={() => toggle('notifySms')} /><ToggleRow icon={<Bell size={16} />} label="Push" checked={draft.notifyPush} onChange={() => toggle('notifyPush')} /><ToggleRow icon={<MessageSquareText size={16} />} label="Marketing" checked={draft.marketingOptIn} onChange={() => toggle('marketingOptIn')} /></div></section>

      <section className="market-section-shell"><div className="flex items-center gap-3"><span className="market-section-icon"><Eye size={17} /></span><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-green-700">Privacy</p><h2 className="market-section-title">KS Profile</h2></div></div><label htmlFor="profile-visibility" className="sr-only">KS Profile visibility</label><select id="profile-visibility" value={draft.profileVisibility} onChange={event => setDraft({ ...draft, profileVisibility: event.target.value as 'PUBLIC' | 'PRIVATE' })} className="mt-3 min-h-11 w-full max-w-sm rounded-xl border border-ink/15 bg-white px-3 text-sm font-semibold"><option value="PUBLIC">Public profile</option><option value="PRIVATE">Private profile</option></select></section>

      <details className="trader-progressive"><summary><Sun size={14} /> Market atmosphere</summary><div><div className="b11-settings-theme-grid" aria-label="Market atmosphere">{themes.map(item => <button key={item.id} type="button" aria-pressed={theme === item.id} className={theme === item.id ? 'is-active' : ''} onClick={() => setTheme(item.id)}><strong>{item.name}</strong><span>{item.atmosphere}</span></button>)}</div><p className="mt-2 text-xs text-ink/45">This changes the look on this device only.</p></div></details>

      <div className="sticky bottom-[76px] z-20 flex items-center gap-3 rounded-2xl border border-green-700/10 bg-[#fffefb]/95 p-3 shadow-lg backdrop-blur md:static md:border-0 md:bg-transparent md:p-0 md:shadow-none"><button type="button" onClick={() => void save()} disabled={saving} className="sp-btn-primary inline-flex min-h-11 items-center gap-2 px-5 text-sm disabled:opacity-50"><Save size={16} /> {saving ? 'Saving…' : 'Save settings'}</button>{message && <p className="text-sm text-ink/60">{message}</p>}</div>
    </div>}
  </TraderShell>;
}

function ToggleRow({ icon, label, checked, onChange }: { icon: React.ReactNode; label: string; checked: boolean; onChange: () => void }) {
  return <div className="flex min-h-14 items-center justify-between gap-4 py-2"><div className="flex items-center gap-3 text-sm"><span className="text-green-700">{icon}</span><span className="font-medium">{label}</span></div><button type="button" role="switch" aria-checked={checked} onClick={onChange} className={`relative h-7 w-12 rounded-full transition-colors ${checked ? 'bg-green-700' : 'bg-ink/15'}`}><span className={`absolute top-1 size-5 rounded-full bg-white shadow-sm transition-transform ${checked ? 'left-6' : 'left-1'}`} /></button></div>;
}
