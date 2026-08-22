import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageCircle, X, ArrowRight } from 'lucide-react';
import '../r15-global.css';

const PLACEHOLDERS = [
  'How do I collect contributions?',
  'How do I hire a contractor safely?',
  'How does a KS Number work?',
  'Where does the money sit?',
  'What happens if there is a dispute?',
  'How do I pay after delivery?',
];

const SUGGESTIONS = [
  { label: 'Hire a contractor',      q: 'I want to hire a contractor.' },
  { label: 'Collect contributions',  q: 'I want to collect church contributions.' },
  { label: 'Buy land safely',        q: 'I want to buy land safely.' },
  { label: 'Pay after delivery',     q: 'I want to pay after delivery.' },
  { label: 'Estate contributions',   q: 'I want to manage estate contributions.' },
  { label: 'Welfare group',          q: 'I want to run a welfare group.' },
];

export default function FloatingAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [phIdx, setPhIdx] = useState(0);
  const [phVisible, setPhVisible] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const inTraderShell = location.pathname === '/dashboard'
    || location.pathname === '/profile'
    || location.pathname === '/actions'
    || location.pathname === '/agreements'
    || location.pathname.startsWith('/agreements/')
    || location.pathname.startsWith('/market');

  useEffect(() => {
    const interval = setInterval(() => {
      setPhVisible(false);
      setTimeout(() => {
        setPhIdx(i => (i + 1) % PLACEHOLDERS.length);
        setPhVisible(true);
      }, 350);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('open-ask-securepay', handler);
    return () => window.removeEventListener('open-ask-securepay', handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120);
  }, [open]);

  const go = (text: string) => {
    if (!text.trim()) return;
    setInput('');
    setOpen(false);
    navigate(`/create?q=${encodeURIComponent(text.trim())}`);
  };

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Ask SecurePay"
        className={`fixed right-5 z-[60] flex items-center gap-2 rounded-full py-2.5 pl-3.5 pr-4 transition-all duration-200 hover:-translate-y-0.5 hover:opacity-100 ${inTraderShell ? 'bottom-20 md:bottom-6' : 'bottom-6'}`}
        style={{
          background: 'rgba(22, 46, 10, 0.82)',
          border: '1px solid rgba(255, 255, 255, 0.13)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.10)',
          opacity: 0.85,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}>
        <MessageCircle size={14} className="flex-shrink-0 text-white/80" />
        <span className="whitespace-nowrap text-xs font-medium text-white/80">{open ? 'Close' : 'Ask SecurePay'}</span>
      </button>

      {open && (
        <div
          className={[
            'fixed z-50 flex flex-col overflow-hidden',
            'bottom-0 left-0 right-0 rounded-t-3xl',
            'max-h-[76vh]',
            'md:bottom-[72px] md:left-auto md:right-5',
            'md:w-[clamp(300px,32vw,420px)] md:rounded-2xl',
            'md:max-h-[540px]',
            'animate-glass-panel',
          ].join(' ')}
          style={{
            background: 'rgba(252, 252, 250, 0.82)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.60)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
          }}>
          <div className="flex flex-shrink-0 justify-center pb-1 pt-3 md:hidden"><div className="h-1 w-9 rounded-full bg-[#1a1a1a]/12" /></div>

          <div className="flex flex-shrink-0 items-center justify-between border-b border-[#1a1a1a]/6 px-5 py-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: 'rgba(58, 122, 31, 0.12)' }}><MessageCircle size={13} className="text-[#3a7a1f]" /></div>
              <span className="text-sm font-semibold text-[#1a1a1a]/80">Ask SecurePay</span>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close Ask SecurePay" className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-[#1a1a1a]/6" style={{ background: 'rgba(26,26,26,0.04)' }}><X size={13} className="text-[#1a1a1a]/40" /></button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-2 pt-5">
            <div className="mb-5">
              <p className="mb-1 text-xs font-medium text-[#1a1a1a]/35">SecurePay Guide</p>
              <p className="text-sm leading-relaxed text-[#1a1a1a]/65">Tell SecurePay what you need to do in the Market.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => go(s.q)} className="rounded-full border px-3 py-1.5 text-xs text-[#1a1a1a]/55 transition-all duration-150 hover:border-[#3a7a1f]/30 hover:bg-[#3a7a1f]/5 hover:text-[#3a7a1f]" style={{ borderColor: 'rgba(26,26,26,0.10)', background: 'rgba(26,26,26,0.03)' }}>{s.label}</button>
              ))}
            </div>
          </div>

          <div className="flex-shrink-0 px-5 pb-5 pt-3">
            <div className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 transition-all duration-150" style={{ background: 'rgba(26,26,26,0.05)', border: '1px solid rgba(26,26,26,0.08)' }}>
              <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && go(input)} placeholder={phVisible ? PLACEHOLDERS[phIdx] : ''} className="flex-1 bg-transparent text-sm text-[#1a1a1a]/70 placeholder-[#1a1a1a]/25 transition-all focus:outline-none focus:placeholder-[#1a1a1a]/15" style={{ caretColor: '#3a7a1f' }} />
              <button onClick={() => go(input)} disabled={!input.trim()} aria-label="Submit request" className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg transition-all duration-150 disabled:opacity-30" style={{ background: input.trim() ? '#3a7a1f' : 'rgba(26,26,26,0.08)' }}><ArrowRight size={12} className={input.trim() ? 'text-white' : 'text-[#1a1a1a]/30'} /></button>
            </div>
            <p className="mt-2.5 text-center text-[10px] text-[#1a1a1a]/20">Describe the trade. SecurePay will take you to the right journey.</p>
          </div>
        </div>
      )}
    </>
  );
}
