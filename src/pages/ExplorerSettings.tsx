import { Link } from 'react-router-dom';
import { ArrowRight, GraduationCap, Moon, ShieldCheck, Sun } from 'lucide-react';
import LivingSecurePayMark from '../components/LivingSecurePayMark';
import { useMarketAtmosphere } from '../lib/marketAtmosphere';

export default function ExplorerSettings() {
  const { theme, setTheme, themes } = useMarketAtmosphere();
  return (
    <main className="yui-settings-page">
      <section className="yui-settings-hero">
        <LivingSecurePayMark state="guiding" size="md" presence="present" />
        <div><p>YUI v1 · EXPLORER SETTINGS</p><h1>Your training Market.</h1><span>These settings affect only this browser experience. They do not alter identity, agreements, money, permissions or backend state.</span></div>
      </section>

      <section className="yui-settings-card">
        <div className="yui-settings-heading"><Sun size={20} /><div><h2>Market atmosphere</h2><p>Choose the mood of the Market. Meaning never changes with the theme.</p></div></div>
        <div className="yui-settings-themes">
          {themes.map(item => <button key={item.id} type="button" aria-pressed={theme === item.id} className={theme === item.id ? 'is-active' : ''} onClick={() => setTheme(item.id)}><span>{item.id === 'evening-market' ? <Moon size={17} /> : <Sun size={17} />}</span><strong>{item.name}</strong><small>{item.atmosphere}</small></button>)}
        </div>
      </section>

      <section className="yui-settings-grid">
        <article><ShieldCheck size={20} /><div><strong>Live API</strong><span>Blocked in YUI v1 Explorer</span></div></article>
        <article><GraduationCap size={20} /><div><strong>Authentication</strong><span>Not required for training</span></div></article>
        <article><LivingSecurePayMark state="resting" size="xs" presence="polite" /><div><strong>Money actions</strong><span>Disabled by design</span></div></article>
      </section>

      <div className="yui-settings-actions"><Link to="/explore">Open all rooms <ArrowRight size={14} /></Link><Link to="/">Back to the Market <ArrowRight size={14} /></Link></div>
    </main>
  );
}
