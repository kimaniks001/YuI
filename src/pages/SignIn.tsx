import { useState } from 'react';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { safeReturnPath } from '../routing/returnPath';
import LivingSecurePayMark from '../components/LivingSecurePayMark';

export default function SignIn({ previewMode = false }: { previewMode?: boolean }) {
  const { session, signIn, completeSignIn, resendChallenge, cancelChallenge, challenge } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = safeReturnPath(searchParams.get('returnTo'));
  const [ksNumber, setKsNumber] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [previewChallenge, setPreviewChallenge] = useState(false);

  // Only a genuine backend session counts as signed in. The public agreement
  // trial may expose a placeholder user to CreateJourney, but it must never
  // skip or redirect the real identity doorway.
  if (session && !previewMode) return <Navigate to={returnTo} replace />;
  const otpStep = previewMode ? previewChallenge : Boolean(challenge);

  const submitCredentials = async () => {
    if (!ksNumber.trim() || !password || loading) return;
    setError(''); setNotice('');
    if (previewMode) { setPreviewChallenge(true); return; }
    setLoading(true);
    const err = await signIn(ksNumber.trim(), password);
    setLoading(false);
    if (err) setError(err);
  };

  const verify = async () => {
    if (!otp.trim() || loading) return;
    setError(''); setNotice('');
    if (previewMode) { navigate('/preview/trader-home', { replace: true }); return; }
    setLoading(true);
    const err = await completeSignIn(otp.trim());
    setLoading(false);
    if (err) setError(err);
    else navigate(returnTo, { replace: true });
  };

  return (
    <div className="identity-doorway min-h-screen bg-[#fffdf8] flex flex-col">
      <div className="identity-doorway__glow identity-doorway__glow--a" aria-hidden="true" />
      <div className="identity-doorway__glow identity-doorway__glow--b" aria-hidden="true" />
      <header className="identity-doorway__header flex items-center justify-between px-4 sm:px-6 h-16 border-b border-[#e9e7e1]">
        <Link to={previewMode ? '/preview/home' : '/'} aria-label="SecurePay home" className="sp-living-mark-link">
          <LivingSecurePayMark state="resting" size="md" presence="polite" />
        </Link>
        <span className="identity-doorway__header-note">Your KSNumber is your identity in the Market.</span>
      </header>
      <main className="identity-doorway__main flex-1 flex items-center justify-center px-4 py-8">
        <section className="identity-doorway__layout">
          <aside className="identity-doorway__welcome" aria-label="SecurePay identity guidance">
            <LivingSecurePayMark state={otpStep ? 'guiding' : 'resting'} size="lg" presence="present" label={otpStep ? 'SecurePay is guiding verification' : 'SecurePay sign in'} />
            <p className="identity-doorway__eyebrow">Welcome to your Market</p>
            <h2>{otpStep ? 'One quick check, then you are in.' : 'Come back in as yourself.'}</h2>
            <p>{otpStep ? 'The code confirms that it is you returning. It does not move money or change an agreement.' : 'Your KSNumber carries your SecurePay identity into the agreements and trade you take part in.'}</p>
            <div className="identity-doorway__reassurance">
              <LivingSecurePayMark state="resting" size="xs" presence="polite" label="SecurePay reassurance" />
              <span>SecurePay will tell you clearly if something needs your attention.</span>
            </div>
          </aside>
          <div className="identity-doorway__card w-full max-w-sm space-y-5">
            <div className="space-y-2">
              <p className="identity-doorway__eyebrow">{otpStep ? 'Identity check' : 'Sign in'}</p>
              <h1 className="font-display text-3xl font-medium text-[#1a1a1a]">{otpStep ? 'Enter your code' : 'Welcome back'}</h1>
              <p className="text-sm text-[#1a1a1a]/50">{otpStep ? 'Complete verification to enter your Market.' : 'Use the KSNumber and password you return with.'}</p>
            </div>
          {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">{error}</div>}
          {notice && <div className="rounded-xl border border-[#3a7a1f]/15 bg-[#f4f8ef] px-3.5 py-3 text-sm text-[#315f1c]">{notice}</div>}
          {!otpStep ? <div className="space-y-3">
            <input aria-label="KSNumber" className="w-full px-4 py-3 rounded-xl border border-[#1a1a1a]/10 bg-white text-sm focus:outline-none focus:border-[#3a7a1f]/60 focus:ring-2 focus:ring-[#3a7a1f]/10" placeholder="KSNumber, e.g. KS2145" value={ksNumber} onChange={e => setKsNumber(e.target.value)} autoComplete="username" />
            <div className="relative">
              <input aria-label="Password" className="w-full px-4 py-3 pr-11 rounded-xl border border-[#1a1a1a]/10 bg-white text-sm focus:outline-none focus:border-[#3a7a1f]/60 focus:ring-2 focus:ring-[#3a7a1f]/10" placeholder="Password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && void submitCredentials()} autoComplete="current-password" />
              <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1a1a1a]/35">{showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
            </div>
            <button type="button" onClick={() => void submitCredentials()} disabled={loading || !ksNumber.trim() || !password} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#3a7a1f] px-5 text-sm font-semibold text-white disabled:opacity-40">Continue <ArrowRight size={16}/></button>
            <p className="text-center text-xs text-[#1a1a1a]/45">New to SecurePay? <Link to={previewMode ? '/preview/signup' : '/signup'} className="font-semibold text-[#3a7a1f] hover:underline">Create your KSNumber</Link></p>
          </div> : <div className="space-y-3">
            <input aria-label="Verification code" className="w-full px-4 py-3 rounded-xl border border-[#1a1a1a]/10 bg-white text-center font-mono tracking-[0.3em] text-sm focus:outline-none focus:border-[#3a7a1f]/60 focus:ring-2 focus:ring-[#3a7a1f]/10" placeholder="Code" value={otp} onChange={e => setOtp(e.target.value)} onKeyDown={e => e.key === 'Enter' && void verify()} autoComplete="one-time-code" />
            <button type="button" onClick={() => void verify()} disabled={loading || !otp.trim()} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#3a7a1f] px-5 text-sm font-semibold text-white disabled:opacity-40">Verify & continue <ArrowRight size={16}/></button>
            <div className="flex items-center justify-between text-xs">
              <button type="button" onClick={() => { if (previewMode) setPreviewChallenge(false); else cancelChallenge(); setOtp(''); setError(''); setNotice(''); }} className="text-[#1a1a1a]/45">Back</button>
              <button type="button" onClick={async () => { if (previewMode) { setNotice('A new code has been sent.'); return; } setLoading(true); const e=await resendChallenge(); setLoading(false); if (e) setError(e); else setNotice('A new code has been sent.'); }} className="font-semibold text-[#3a7a1f] hover:underline">Resend code</button>
            </div>
          </div>}
          </div>
        </section>
      </main>
    </div>
  );
}