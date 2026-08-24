import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BadgeCheck, Check, Copy, Eye, EyeOff, FileCheck2, Link2, Mail, Phone, Store } from 'lucide-react';
import { useAuth } from '../lib/auth';
import type { SecurePaySignupChannelType } from '../api/securepayTypes';
import { FormPage, Stepper, Input, PrimaryButton, GhostButton, Alert, GreenCard, HelperText } from '../components/ds';
import {
  SIGNUP_PASSWORD_MIN_LENGTH,
  signupStepIndex,
  nextSignupStep,
  validateSignupName,
  validateSignupDestination,
  validateSignupPassword,
  validateSignupOtp,
  type SignupWizardStep,
} from '../lib/signupWizard';
import LivingSecurePayMark from '../components/LivingSecurePayMark';

const STEPPER_STEPS = [
  { id: 'name', label: 'Name' },
  { id: 'contact', label: 'Contact' },
  { id: 'password', label: 'Password' },
  { id: 'otp', label: 'Verify' },
];

function remainingSeconds(iso: string | null, now: number): number {
  if (!iso) return 0;
  const target = new Date(iso).getTime();
  if (Number.isNaN(target)) return 0;
  return Math.max(0, Math.floor((target - now) / 1000));
}
function formatMmSs(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

const SIGNUP_RESUME_PATH = /^\/securelink\/join\/[^/]+$/;
function safeSignupResumePath(next: string | null): string {
  if (next && SIGNUP_RESUME_PATH.test(next)) return next;
  return '/dashboard';
}

function KsNumberValueCard() {
  return <section className="rounded-[22px] border border-green-700/12 bg-[#f4f8ef] p-4" aria-label="What your KSNumber gives you">
    <div className="flex items-start gap-3"><LivingSecurePayMark state="guiding" size="sm" presence="polite" /><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-green-700">More than a login</p><h2 className="mt-1 font-display text-xl">Your KSNumber becomes your place in SecurePay.</h2></div></div>
    <div className="mt-3 grid gap-2">
      <ValueRow icon={<Store size={15} />} title="Your Digital Store" text="A public business home you can shape and share." />
      <ValueRow icon={<Link2 size={15} />} title="Your own SecurePay address" text="Your store can live at securepay.ke/KS…" />
      <ValueRow icon={<FileCheck2 size={15} />} title="Your agreement identity" text="The same identity follows the agreements you take part in." />
    </div>
    <p className="mt-3 text-[11px] leading-5 text-ink/45">Creating a KSNumber does not itself move money or create an agreement.</p>
  </section>;
}
function ValueRow({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <div className="flex gap-2.5 rounded-xl bg-white/75 p-2.5"><span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-700">{icon}</span><div><strong className="block text-xs text-ink/75">{title}</strong><span className="mt-0.5 block text-[11px] leading-4 text-ink/48">{text}</span></div></div>;
}

export default function Signup({ previewMode = false }: { previewMode?: boolean }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { startSignup, resendSignupOtp, completeSignup, cancelSignup, signupChallenge } = useAuth();
  const [step, setStep] = useState<SignupWizardStep>('name');
  const [displayName, setDisplayName] = useState('');
  const [channelType, setChannelType] = useState<SecurePaySignupChannelType>('SMS');
  const [destination, setDestination] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [ksNumber, setKsNumber] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [previewExpiresAt, setPreviewExpiresAt] = useState(() => Date.now() + 5 * 60 * 1000);

  useEffect(() => {
    if (step !== 'otp') return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [step]);

  const expiresIn = previewMode ? Math.max(0, Math.floor((previewExpiresAt - now) / 1000)) : remainingSeconds(signupChallenge?.expiresAt ?? null, now);
  const resendIn = previewMode ? 0 : remainingSeconds(signupChallenge?.resendAvailableAt ?? null, now);
  const codeExpired = step === 'otp' && (previewMode ? expiresIn <= 0 : signupChallenge != null && expiresIn <= 0);
  const maskedDestination = previewMode ? (channelType === 'SMS' ? destination.replace(/.(?=.{4})/g, '•') : destination.replace(/(^.).*(@.*$)/, '$1••••$2')) : signupChallenge?.maskedDestination;

  const goTo = (event: Parameters<typeof nextSignupStep>[1]) => { setError(''); setNotice(''); setStep((s) => nextSignupStep(s, event)); };
  const handleNameSubmit = () => { const err = validateSignupName(displayName); if (err) { setError(err); return; } goTo('submit'); };
  const handleContactSubmit = () => { const err = validateSignupDestination(channelType, destination); if (err) { setError(err); return; } goTo('submit'); };
  const handleCreateAccount = async () => {
    const err = validateSignupPassword(password, confirmPassword); if (err) { setError(err); return; }
    setError('');
    if (previewMode) { setPreviewExpiresAt(Date.now() + 5 * 60 * 1000); goTo('submit'); return; }
    setLoading(true); const startErr = await startSignup(displayName.trim(), channelType, destination.trim(), password); setLoading(false);
    if (startErr) { setError(startErr); return; } goTo('submit');
  };
  const handleVerify = async () => {
    const err = validateSignupOtp(otp); if (err) { setError(err); return; }
    setError('');
    if (previewMode) { setKsNumber('KS2145'); goTo('verified'); return; }
    setLoading(true); const result = await completeSignup(otp.trim()); setLoading(false);
    if (result.error) { setError(result.error); return; } setKsNumber(result.ksNumber); goTo('verified');
  };
  const handleResend = async () => {
    setError(''); setNotice('');
    if (previewMode) { setPreviewExpiresAt(Date.now() + 5 * 60 * 1000); setNotice('A new code has been sent.'); return; }
    setResending(true); const err = await resendSignupOtp(); setResending(false);
    if (err) { setError(err); return; } setNotice('A new code has been sent.');
  };
  const handleStartOver = () => { cancelSignup(); setOtp(''); setNotice(''); goTo('restart'); };
  const handleBack = () => goTo('back');
  const handleCopyKs = async () => {
    if (!ksNumber) return;
    try { await navigator.clipboard.writeText(ksNumber); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* visible value remains copyable manually */ }
  };
  const handleCopyStore = async () => {
    if (!ksNumber) return;
    try { await navigator.clipboard.writeText(`https://securepay.ke/${ksNumber}`); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* visible value remains copyable manually */ }
  };

  if (step === 'done') {
    return <FormPage title="Welcome to the Market" subtitle="Your KSNumber is your SecurePay identity — and your public Store address." trustNote={false} reviewMode={previewMode} markState="complete">
      <div className="space-y-5 text-center">
        <div><p className="mb-3 text-sm text-ink/55">Keep this number close. You will use it across SecurePay.</p><GreenCard className="inline-block"><p className="mb-1 text-sm font-semibold text-green-800">You're now</p><p className="font-mono text-3xl font-bold tracking-wide text-green-700">{ksNumber}</p></GreenCard></div>
        <button type="button" onClick={handleCopyKs} className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-600 hover:underline">{copied ? <Check size={13} /> : <Copy size={13} />}{copied ? 'Copied' : 'Copy KSNumber'}</button>
        {ksNumber && <section className="rounded-[22px] border border-green-700/12 bg-[#f4f8ef] p-4 text-left"><div className="flex items-start gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-green-700"><Store size={17} /></span><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[0.13em] text-green-700">Your Digital Store address</p><p className="mt-1 break-all font-display text-xl">securepay.ke/{ksNumber}</p><p className="mt-1 text-xs leading-5 text-ink/48">Build your public Store, add products or services, choose its look and share this address with customers.</p></div></div><button type="button" onClick={handleCopyStore} className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-full border border-green-700/12 bg-white px-3 text-xs font-semibold text-green-700"><Copy size={13} /> Copy Store address</button></section>}
        <Alert variant="info"><p className="text-xs">Your KSNumber is an identity, not a bank account. Store presentation does not create a sale or move money.</p></Alert>
        <PrimaryButton onClick={() => navigate(previewMode ? '/preview/activate' : safeSignupResumePath(searchParams.get('next')))} className="w-full" size="lg">Continue to SecurePay</PrimaryButton>
      </div>
    </FormPage>;
  }

  return <FormPage title="Create your KSNumber" subtitle="Your identity, your Digital Store address and the name that follows your agreements." backHref={step === 'name' ? (previewMode ? '/preview/home' : '/') : undefined} trustNote={false} reviewMode={previewMode} markState={step === 'otp' ? 'guiding' : 'resting'}>
    <div className="mb-6"><Stepper steps={STEPPER_STEPS} current={signupStepIndex(step)} /></div>
    <div className="max-w-sm space-y-4">
      {step === 'name' && <><KsNumberValueCard /><div className="identity-step-intro"><LivingSecurePayMark state="resting" size="md" presence="polite" label="SecurePay identity" /><div><p className="identity-step-kicker">Start with you</p><p className="text-sm text-ink/55">What should people see as your name on SecurePay?</p></div></div><Input label="Full name" placeholder="e.g. Wanjiku Kamau" value={displayName} onChange={(e) => setDisplayName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()} autoFocus autoComplete="name" hint="Use the name you normally use when trading or dealing with others." /></>}

      {step === 'contact' && <><p className="text-sm text-ink/55">Where should SecurePay send your one-time verification code?</p><div className="flex gap-1 rounded-2xl bg-cream-warm p-1">{(['SMS', 'EMAIL'] as const).map((c) => <button key={c} type="button" onClick={() => { setChannelType(c); setDestination(''); setError(''); }} className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-medium transition-all duration-200 ${channelType === c ? 'bg-white text-ink shadow-sm' : 'text-ink/40 hover:text-ink/60'}`}>{c === 'SMS' ? <Phone size={13} /> : <Mail size={13} />}{c === 'SMS' ? 'Phone' : 'Email'}</button>)}</div><Input label={channelType === 'SMS' ? 'Phone number' : 'Email address'} type={channelType === 'SMS' ? 'tel' : 'email'} inputMode={channelType === 'SMS' ? 'tel' : 'email'} placeholder={channelType === 'SMS' ? '+254712345678' : 'you@example.com'} value={destination} onChange={(e) => setDestination(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleContactSubmit()} autoFocus autoComplete={channelType === 'SMS' ? 'tel' : 'email'} hint={channelType === 'SMS' ? 'Include the country code, for example +254.' : 'Use an address you can open now.'} /></>}

      {step === 'password' && <><p className="text-sm text-ink/55">Create a password you will use with your KSNumber when you return.</p><div className="relative"><Input label="Password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCreateAccount()} autoFocus autoComplete="new-password" hint={`At least ${SIGNUP_PASSWORD_MIN_LENGTH} characters, with a letter and a number.`} /><button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3.5 top-[38px] text-ink/30 transition-colors hover:text-ink/60" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button></div><Input label="Confirm password" type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCreateAccount()} autoComplete="new-password" hint="Type the same password again so we can catch mistakes." /></>}

      {step === 'otp' && <><p className="text-sm text-ink/55">Enter the code we sent to <span className="font-semibold text-ink/75">{maskedDestination}</span>.</p><Input label="Verification code" inputMode="numeric" autoComplete="one-time-code" className="text-center font-mono tracking-[0.3em]" value={otp} onChange={(e) => setOtp(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleVerify()} autoFocus disabled={codeExpired} hint="This confirms you can access the phone or email you chose. It does not activate financial features." /><div className="flex items-center justify-between text-xs text-ink/40"><span>{codeExpired ? 'This code has expired.' : `Code expires in ${formatMmSs(expiresIn)}`}</span><button type="button" onClick={handleResend} disabled={resending || resendIn > 0} className="font-semibold text-green-600 hover:underline disabled:opacity-40 disabled:no-underline">{resendIn > 0 ? `Resend in ${formatMmSs(resendIn)}` : resending ? 'Sending…' : 'Resend code'}</button></div></>}

      {error && <Alert variant="danger">{error}</Alert>}{notice && <Alert variant="success">{notice}</Alert>}
      {step === 'name' && <PrimaryButton onClick={handleNameSubmit} className="w-full" size="lg">Continue</PrimaryButton>}
      {step === 'contact' && <><PrimaryButton onClick={handleContactSubmit} className="w-full" size="lg">Continue</PrimaryButton><GhostButton onClick={handleBack} className="w-full">Back</GhostButton></>}
      {step === 'password' && <><PrimaryButton onClick={handleCreateAccount} loading={loading} className="w-full" size="lg">Create account</PrimaryButton><GhostButton onClick={handleBack} className="w-full" disabled={loading}>Back</GhostButton></>}
      {step === 'otp' && <><PrimaryButton onClick={handleVerify} loading={loading} disabled={codeExpired} className="w-full" size="lg">Verify code</PrimaryButton><GhostButton onClick={handleStartOver} className="w-full" disabled={loading}>Start over</GhostButton></>}
      <HelperText className="text-center">By continuing you agree to SecurePay's terms of service.</HelperText>
    </div>
  </FormPage>;
}
