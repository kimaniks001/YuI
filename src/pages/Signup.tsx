import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Copy, Check, Phone, Mail } from 'lucide-react';
import { useAuth } from '../lib/auth';
import type { SecurePaySignupChannelType } from '../api/securepayTypes';
import {
  FormPage,
  Stepper,
  Input,
  PrimaryButton,
  GhostButton,
  Alert,
  GreenCard,
  HelperText,
} from '../components/ds';
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

// Resume support for SecureLink invitation join (Phase 3 UI Slice 3): a
// counterparty without an account yet who reaches Signup from the invitation
// page should land back on that exact invitation after finishing signup,
// instead of the generic SecurePay Home every other signup entry point uses.
//
// Strictly allowlisted to exactly one segment after /securelink/join/ — no
// further slashes, so `../../admin`-style traversal can never smuggle a
// different internal route past this check. This was a real gap: a plain
// `startsWith('/securelink/join/')` check is fooled by react-router's
// `navigate()`, which resolves `..` segments even in a leading-slash path —
// `navigate('/securelink/join/../../admin')` genuinely lands on `/admin`
// (verified directly), even though the string passes a naive prefix test.
// `next` is attacker-controlled query input; react-router's `navigate()`
// only ever manipulates same-origin SPA history (it cannot itself cause a
// cross-origin redirect), but an unvalidated path can still smuggle the
// visitor to an unintended internal route, which this regex closes.
const SIGNUP_RESUME_PATH = /^\/securelink\/join\/[^/]+$/;

function safeSignupResumePath(next: string | null): string {
  if (next && SIGNUP_RESUME_PATH.test(next)) return next;
  return '/dashboard';
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

  // Live countdown for the OTP step only (expiry + initial resend cooldown,
  // both taken straight from the server response — never fabricated). `now`
  // is re-synced the instant this step is entered, not just once at mount —
  // otherwise the first render after a slow name/contact/password fill-in
  // would briefly show a stale (over-estimated) countdown until the first
  // 1s tick corrected it.
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

  const goTo = (event: Parameters<typeof nextSignupStep>[1]) => {
    setError('');
    setNotice('');
    setStep((s) => nextSignupStep(s, event));
  };

  const handleNameSubmit = () => {
    const err = validateSignupName(displayName);
    if (err) { setError(err); return; }
    goTo('submit');
  };

  const handleContactSubmit = () => {
    const err = validateSignupDestination(channelType, destination);
    if (err) { setError(err); return; }
    goTo('submit');
  };

  const handleCreateAccount = async () => {
    const err = validateSignupPassword(password, confirmPassword);
    if (err) { setError(err); return; }
    setError('');
    if (previewMode) { setPreviewExpiresAt(Date.now() + 5 * 60 * 1000); goTo('submit'); return; }
    setLoading(true);
    const startErr = await startSignup(displayName.trim(), channelType, destination.trim(), password);
    setLoading(false);
    if (startErr) { setError(startErr); return; }
    goTo('submit');
  };

  const handleVerify = async () => {
    const err = validateSignupOtp(otp);
    if (err) { setError(err); return; }
    setError('');
    if (previewMode) { setKsNumber('KS2145'); goTo('verified'); return; }
    setLoading(true);
    const result = await completeSignup(otp.trim());
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    setKsNumber(result.ksNumber);
    goTo('verified');
  };

  const handleResend = async () => {
    setError('');
    setNotice('');
    if (previewMode) { setPreviewExpiresAt(Date.now() + 5 * 60 * 1000); setNotice('A new code has been sent.'); return; }
    setResending(true);
    const err = await resendSignupOtp();
    setResending(false);
    if (err) { setError(err); return; }
    setNotice('A new code has been sent.');
  };

  // Safe retry: an invalid/expired challenge can never be recovered by
  // resubmitting the same token (ADR-0017 §L/§M) — the only way forward is a
  // fresh /start call. Name, contact and password stay filled in.
  const handleStartOver = () => {
    cancelSignup();
    setOtp('');
    setNotice('');
    goTo('restart');
  };

  const handleBack = () => goTo('back');

  const handleCopyKs = async () => {
    if (!ksNumber) return;
    try {
      await navigator.clipboard.writeText(ksNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be denied by the browser — not worth surfacing
      // as an error; the number is already visible on screen.
    }
  };

  // ── Completion screen ────────────────────────────────────────────────
  if (step === 'done') {
    return (
      <FormPage title="Welcome to the Market" subtitle="Your KSNumber is now your SecurePay identity." trustNote={false} reviewMode={previewMode} markState="complete">
        <div className="text-center space-y-6">
          <div>
            <p className="text-sm text-ink/55 mb-3">
              Your identity has been created. Keep this number close — it is how SecurePay knows you.
            </p>
            <GreenCard className="inline-block">
              <p className="text-sm font-semibold text-green-800 mb-1">You're now</p>
              <p className="font-mono text-3xl font-bold text-green-700 tracking-wide">{ksNumber}</p>
            </GreenCard>
          </div>
          <button
            type="button"
            onClick={handleCopyKs}
            className="inline-flex items-center gap-1.5 text-xs text-green-600 font-semibold hover:underline"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? 'Copied' : 'Copy KS Number'}
          </button>
          <Alert variant="info">
            <p className="text-xs">
              This is your SecurePay identity, not a bank account. You can find it again from SecurePay Home.
            </p>
          </Alert>
          <PrimaryButton
            onClick={() => navigate(previewMode ? '/preview/activate' : safeSignupResumePath(searchParams.get('next')))}
            className="w-full"
            size="lg"
          >
            Continue to SecurePay
          </PrimaryButton>
        </div>
      </FormPage>
    );
  }

  return (
    <FormPage
      title="Create your KSNumber"
      subtitle="We will take this one clear step at a time. Nothing here moves money."
      backHref={step === 'name' ? (previewMode ? '/preview/home' : '/') : undefined}
      trustNote={false}
      reviewMode={previewMode}
      markState={step === 'otp' ? 'guiding' : 'resting'}
    >
      <div className="mb-6">
        <Stepper steps={STEPPER_STEPS} current={signupStepIndex(step)} />
      </div>

      <div className="space-y-4 max-w-sm">
        {step === 'name' && (
          <>
            <div className="identity-step-intro"><LivingSecurePayMark state="resting" size="md" presence="polite" label="SecurePay identity" /><div><p className="identity-step-kicker">Start with you</p><p className="text-sm text-ink/55">What should people see as your name on SecurePay?</p></div></div>
            <Input
              label="Full name"
              placeholder="e.g. Wanjiku Kamau"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
              autoFocus
              autoComplete="name"
              hint="Use the name you normally use when trading or dealing with others."
            />
          </>
        )}

        {step === 'contact' && (
          <>
            <p className="text-sm text-ink/55">Where should SecurePay send your one-time verification code?</p>
            <div className="flex bg-cream-warm rounded-2xl p-1 gap-1">
              {(['SMS', 'EMAIL'] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => { setChannelType(c); setDestination(''); setError(''); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                    channelType === c ? 'bg-white text-ink shadow-sm' : 'text-ink/40 hover:text-ink/60'
                  }`}
                >
                  {c === 'SMS' ? <Phone size={13} /> : <Mail size={13} />}
                  {c === 'SMS' ? 'Phone' : 'Email'}
                </button>
              ))}
            </div>
            <Input
              label={channelType === 'SMS' ? 'Phone number' : 'Email address'}
              type={channelType === 'SMS' ? 'tel' : 'email'}
              inputMode={channelType === 'SMS' ? 'tel' : 'email'}
              placeholder={channelType === 'SMS' ? '+254712345678' : 'you@example.com'}
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleContactSubmit()}
              autoFocus
              autoComplete={channelType === 'SMS' ? 'tel' : 'email'}
              hint={channelType === 'SMS' ? 'Include the country code, for example +254.' : 'Use an address you can open now.'}
            />
          </>
        )}

        {step === 'password' && (
          <>
            <p className="text-sm text-ink/55">Create a password you will use with your KS Number when you return.</p>
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateAccount()}
                autoFocus
                autoComplete="new-password"
                hint={`At least ${SIGNUP_PASSWORD_MIN_LENGTH} characters, with a letter and a number.`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-[38px] text-ink/30 hover:text-ink/60 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <Input
              label="Confirm password"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateAccount()}
              autoComplete="new-password"
              hint="Type the same password again so we can catch mistakes."
            />
          </>
        )}

        {step === 'otp' && (
          <>
            <p className="text-sm text-ink/55">
              Enter the code we sent to{' '}
              <span className="font-semibold text-ink/75">{maskedDestination}</span>.
            </p>
            <Input
              label="Verification code"
              inputMode="numeric"
              autoComplete="one-time-code"
              className="text-center tracking-[0.3em] font-mono"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              autoFocus
              disabled={codeExpired}
              hint="This confirms you can access the phone or email you chose. It does not activate financial features."
            />
            <div className="flex items-center justify-between text-xs text-ink/40">
              <span>
                {codeExpired
                  ? 'This code has expired.'
                  : `Code expires in ${formatMmSs(expiresIn)}`}
              </span>
              <button
                type="button"
                onClick={handleResend}
                disabled={resending || resendIn > 0}
                className="text-green-600 font-semibold hover:underline disabled:opacity-40 disabled:no-underline"
              >
                {resendIn > 0 ? `Resend in ${formatMmSs(resendIn)}` : resending ? 'Sending…' : 'Resend code'}
              </button>
            </div>
          </>
        )}

        {error && <Alert variant="danger">{error}</Alert>}
        {notice && <Alert variant="success">{notice}</Alert>}

        {step === 'name' && (
          <PrimaryButton onClick={handleNameSubmit} className="w-full" size="lg">
            Continue
          </PrimaryButton>
        )}
        {step === 'contact' && (
          <>
            <PrimaryButton onClick={handleContactSubmit} className="w-full" size="lg">
              Continue
            </PrimaryButton>
            <GhostButton onClick={handleBack} className="w-full">Back</GhostButton>
          </>
        )}
        {step === 'password' && (
          <>
            <PrimaryButton onClick={handleCreateAccount} loading={loading} className="w-full" size="lg">
              Create account
            </PrimaryButton>
            <GhostButton onClick={handleBack} className="w-full" disabled={loading}>Back</GhostButton>
          </>
        )}
        {step === 'otp' && (
          <>
            <PrimaryButton
              onClick={handleVerify}
              loading={loading}
              disabled={codeExpired}
              className="w-full"
              size="lg"
            >
              Verify code
            </PrimaryButton>
            <GhostButton onClick={handleStartOver} className="w-full" disabled={loading}>
              Start over
            </GhostButton>
          </>
        )}

        <HelperText className="text-center">
          By continuing you agree to SecurePay's terms of service.
        </HelperText>
      </div>
    </FormPage>
  );
}
