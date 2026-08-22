import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User, LogIn, LogOut, Shield, ChevronDown, Settings,
  AlertTriangle, Eye, EyeOff, CheckCircle,
  Zap, FileText, CreditCard, Star, Store, Package, ArrowRight,
  Users,
} from 'lucide-react';
import { useAuth } from '../lib/auth';

// ─── Sign-in modal ────────────────────────────────────────────────────────────
// Sign-in matches the current SecurePayAPI contract: KS Number + password
// always produces an OTP challenge first — there is no single-step login and
// no email-based login. See src/api/securepayAuth.ts for the full contract.
// Account creation is Phase 2 public signup (ADR-0017) — a separate, staged
// name/contact/password/OTP journey with more steps than this compact modal
// suits, so it lives at its own route (src/pages/Signup.tsx) rather than a
// tab inside this modal; this is the "Create account" entry point into it.
function AuthModal({ onClose }: { onClose: () => void }) {
  const { signIn, completeSignIn, resendChallenge, cancelChallenge, challenge } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'forgot'>('signin');
  const [ksNumber, setKsNumber] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const submit = async () => {
    setError(''); setSuccess(''); setLoading(true);
    const err = await signIn(ksNumber.trim(), password);
    setLoading(false);
    if (err) { setError(err); return; }
    // A challenge is now pending — the OTP step renders below. Not signed in yet.
  };

  const verify = async () => {
    setError(''); setLoading(true);
    const err = await completeSignIn(otp.trim());
    setLoading(false);
    if (err) { setError(err); return; }
    onClose();
    // One authenticated SecurePay shell: after the compact sign-in flow,
    // enter the trader's signed-in Home. Public pages that need a preserved
    // return path use the dedicated /signin route instead.
    navigate('/dashboard');
  };

  const resend = async () => {
    setError(''); setSuccess(''); setLoading(true);
    const err = await resendChallenge();
    setLoading(false);
    if (err) { setError(err); return; }
    setSuccess('A new code has been sent.');
  };

  const backToCredentials = () => {
    cancelChallenge();
    setOtp(''); setError(''); setSuccess('');
  };

  // Password recovery requires an in-app OTP step this build doesn't
  // implement yet — fail closed rather than starting a flow with no way to
  // finish it. See docs/ui/LEGACY_SUPABASE_RETAINED_GAPS.md.
  const forgotUnavailable = () => {
    setError('');
    setSuccess('');
    setError('Password recovery isn’t available from this app yet. Please contact SecurePay support to reset your password.');
  };

  const isForgot = mode === 'forgot';
  const isOtpStep = mode === 'signin' && !!challenge;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
        {/* Top gradient strip */}
        <div className="h-1.5 bg-gradient-to-r from-[#3a7a1f] via-[#3a7a1f]/70 to-[#e87c1e]" />

        <div className="p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-2xl bg-[#3a7a1f]/10 flex items-center justify-center mx-auto mb-4">
              <Shield size={22} className="text-[#3a7a1f]" />
            </div>
            <h2 className="font-display text-xl font-medium text-[#1a1a1a]">
              {isOtpStep ? 'Enter your code' : isForgot ? 'Reset your password' : 'Welcome back'}
            </h2>
            <p className="text-sm text-[#1a1a1a]/45">
              {isOtpStep ? 'We sent a verification code for this sign-in.'
                : isForgot ? 'Password recovery options for your account'
                : 'Sign in with your KS Number'}
            </p>
          </div>

          {/* Create-account entry point — hidden on forgot screen and the OTP step */}
          {!isForgot && !isOtpStep && (
            <div className="text-center">
              <span className="text-xs text-[#1a1a1a]/45">New to SecurePay? </span>
              <Link
                to="/signup"
                onClick={onClose}
                className="text-xs text-[#3a7a1f] font-semibold hover:underline"
              >
                Create account
              </Link>
            </div>
          )}

          {/* OTP step */}
          {isOtpStep ? (
            <div className="space-y-3">
              <input
                type="text"
                inputMode="numeric"
                className="w-full px-4 py-3 rounded-xl border border-[#1a1a1a]/10 text-sm text-center tracking-[0.3em] font-mono focus:outline-none focus:border-[#3a7a1f]/50 focus:ring-2 focus:ring-[#3a7a1f]/10 transition-all"
                placeholder="Verification code"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && verify()}
                autoFocus
                autoComplete="one-time-code"
              />
              <button type="button" onClick={resend} className="text-[10px] text-[#3a7a1f] font-semibold hover:underline">
                Resend code
              </button>
            </div>
          ) : !isForgot ? (
            /* Fields */
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-[#1a1a1a]/10 text-sm focus:outline-none focus:border-[#3a7a1f]/50 focus:ring-2 focus:ring-[#3a7a1f]/10 transition-all"
                  placeholder="KS Number (e.g. KS2145)"
                  value={ksNumber}
                  onChange={e => setKsNumber(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submit()}
                  autoFocus
                  autoComplete="username"
                />
              </div>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-[#1a1a1a]/10 text-sm focus:outline-none focus:border-[#3a7a1f]/50 focus:ring-2 focus:ring-[#3a7a1f]/10 transition-all"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submit()}
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#1a1a1a]/30 hover:text-[#1a1a1a]/60 transition-colors">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          ) : null}

          {!isForgot && !isOtpStep && (
            <div className="flex items-center justify-between -mt-2">
              <p className="text-[10px] text-[#1a1a1a]/35">
                Your KS Number, e.g. <span className="font-mono font-semibold text-[#3a7a1f]">KS2145</span>
              </p>
              <button
                type="button"
                onClick={() => { setMode('forgot'); setError(''); setSuccess(''); setPassword(''); }}
                className="text-[10px] text-[#3a7a1f] font-semibold hover:underline flex-shrink-0 ml-3"
              >
                Forgot password?
              </button>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3.5 py-3">
              <AlertTriangle size={13} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 leading-relaxed">{error}</p>
            </div>
          )}
          {success && (
            <div className="flex items-start gap-2 bg-[#f6faf2] border border-[#3a7a1f]/15 rounded-xl px-3.5 py-3">
              <CheckCircle size={13} className="text-[#3a7a1f] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[#1a1a1a]/70 leading-relaxed">{success}</p>
            </div>
          )}

          <button
            onClick={isOtpStep ? verify : isForgot ? forgotUnavailable : submit}
            disabled={loading || (isOtpStep ? !otp : isForgot ? false : (!ksNumber || !password))}
            className="w-full py-3.5 rounded-full bg-[#3a7a1f] hover:bg-[#2d6018] text-white font-semibold text-sm disabled:opacity-40 transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Please wait…</>
              : isOtpStep ? <><Shield size={15} />Verify code</>
              : isForgot ? <><ArrowRight size={15} />Continue</>
              : <><LogIn size={15} />Sign in</>}
          </button>

          {isOtpStep && (
            <button
              type="button"
              onClick={backToCredentials}
              className="w-full text-center text-xs text-[#1a1a1a]/40 hover:text-[#1a1a1a]/60 transition-colors"
            >
              Back
            </button>
          )}

          {isForgot && (
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(''); setSuccess(''); }}
              className="w-full text-center text-xs text-[#1a1a1a]/40 hover:text-[#1a1a1a]/60 transition-colors"
            >
              Back to sign in
            </button>
          )}

          <p className="text-center text-[10px] text-[#1a1a1a]/25 leading-relaxed">
            By continuing you agree to SecurePay's terms of service
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main dropdown ────────────────────────────────────────────────────────────
export default function AccountDropdown() {
  const { user, signOut, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [ksProfile, setKsProfile] = useState<{ ks_display: string; full_name: string; verification_status: string; identity_status: string; trust_deposit_balance: number; activation_status: string } | null>(null);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Fetch linked KS profile via SecurePay adapter. No confirmed adapter returns
  // this full trader-profile shape yet (getCurrentUser returns SecurePayUser,
  // not ks_display/verification_status/etc.) — retained gap, safe empty rather
  // than querying Supabase.
  useEffect(() => {
    setKsProfile(null);
  }, [user?.email]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleToggle = () => {
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        const panelW = Math.min(300, window.innerWidth - 24);
        setPanelStyle({ position: 'fixed', top: rect.bottom + 8, right: 12, width: panelW, zIndex: 9999 });
      } else {
        setPanelStyle({});
      }
    }
    setOpen(v => !v);
  };

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    navigate('/');
  };

  if (loading) return <div className="w-9 h-9 rounded-full bg-[#1a1a1a]/5 animate-pulse" />;

  // ── Not signed in ──
  if (!user) return (
    <>
      <button
        onClick={() => setShowAuth(true)}
        className="flex items-center gap-1.5 text-sm font-medium text-[#1a1a1a]/60 hover:text-[#1a1a1a] border border-[#1a1a1a]/10 hover:border-[#1a1a1a]/25 px-4 py-2.5 rounded-full transition-all duration-200"
      >
        <User size={13} />
        <span className="hidden sm:inline">Sign in</span>
      </button>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );

  // ── Signed in ──
  const initials = ksProfile?.ks_display
    ? ksProfile.ks_display.replace('KS', '')
    : (user.email ?? '?').slice(0, 1).toUpperCase();
  const primaryLabel = ksProfile?.ks_display ?? user.email?.split('@')[0] ?? 'Account';

  return (
    <>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      <div ref={ref} className="relative">
        {/* Trigger button */}
        <button
          onClick={handleToggle}
          className={`flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border transition-all duration-200 group ${open ? 'border-[#3a7a1f]/40 bg-[#f6faf2]' : 'border-[#1a1a1a]/10 hover:border-[#1a1a1a]/20 bg-white'}`}
        >
          {/* Avatar — shows KS number digits */}
          <div className="w-7 h-7 rounded-full bg-[#1e4d10] flex items-center justify-center flex-shrink-0">
            {ksProfile
              ? <span className="text-[9px] font-bold text-[#e87c1e] leading-none">{initials}</span>
              : <span className="text-white text-[10px] font-bold">{initials}</span>}
          </div>
          <span className="text-sm font-semibold text-[#1a1a1a]/75 hidden sm:inline max-w-[110px] truncate">
            {primaryLabel}
          </span>
          <ChevronDown size={13} className={`text-[#1a1a1a]/40 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown panel */}
        {open && (
          <div
            className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-[#1a1a1a]/6 overflow-hidden animate-fade-in"
            style={Object.keys(panelStyle).length
              ? panelStyle
              : { position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 288, zIndex: 50 }
            }
          >
            {/* Identity header */}
            <div className="bg-gradient-to-br from-[#1e4d10] to-[#253f12] px-5 py-4 border-b border-white/5">
              <div className="flex items-start gap-3">
                {/* KS avatar */}
                <div className="w-11 h-11 rounded-xl bg-white/10 flex flex-col items-center justify-center flex-shrink-0 border border-white/10">
                  {ksProfile ? (
                    <>
                      <span className="text-white/40 text-[7px] font-bold tracking-widest leading-none">KS</span>
                      <span className="font-bold text-sm leading-tight" style={{ color: '#e87c1e' }}>{ksProfile.ks_display.replace('KS', '')}</span>
                    </>
                  ) : (
                    <span className="text-white/60 text-sm font-bold">{(user.email ?? '?').slice(0, 1).toUpperCase()}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  {ksProfile ? (
                    <>
                      <p className="font-bold text-white text-sm truncate">{ksProfile.ks_display}</p>
                      <p className="text-xs text-white/45 truncate mt-0.5">{ksProfile.full_name}</p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold text-white text-sm truncate">{user.email?.split('@')[0]}</p>
                      <p className="text-xs text-white/40 truncate mt-0.5">{user.email}</p>
                    </>
                  )}
                  {ksProfile && (
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      {ksProfile.verification_status === 'verified' ? (
                        <span className="inline-flex items-center gap-0.5 bg-[#3a7a1f] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                          <CheckCircle size={7} />Verified
                        </span>
                      ) : ksProfile.verification_status === 'pending' ? (
                        <span className="text-[8px] bg-amber-400/20 text-amber-300 font-bold px-1.5 py-0.5 rounded-full">Under Review</span>
                      ) : (
                        <span className="text-[8px] bg-white/10 text-white/40 font-bold px-1.5 py-0.5 rounded-full">Starter</span>
                      )}
                      <span className="text-[8px] bg-white/8 text-white/35 font-medium px-1.5 py-0.5 rounded-full">{ksProfile.activation_status ?? 'Active'}</span>
                    </div>
                  )}
                  {ksProfile && ksProfile.trust_deposit_balance > 0 && (
                    <p className="text-[9px] text-white/30 mt-1">
                      Trust deposit: <span className="font-semibold text-[#3a7a1f]">KES {ksProfile.trust_deposit_balance.toLocaleString()}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="p-2 space-y-0.5">

              {/* My SecurePay Home */}
              <Link
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#f6faf2] transition-colors group"
              >
                <div className="w-8 h-8 rounded-xl bg-[#3a7a1f]/10 flex items-center justify-center flex-shrink-0">
                  <User size={14} className="text-[#3a7a1f]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#1a1a1a]">My SecurePay Home</p>
                  <p className="text-[10px] text-[#1a1a1a]/35">Links, trust trail, builder status</p>
                </div>
              </Link>

              {/* My Network — only shown if they have a KS number */}
              {ksProfile && (
                <Link
                  to="/community"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#f6faf2] transition-colors group"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#3a7a1f]/10 flex items-center justify-center flex-shrink-0">
                    <Users size={14} className="text-[#3a7a1f]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#1a1a1a]">My Network</p>
                    <p className="text-[10px] text-[#1a1a1a]/35">Trust network · rewards · invite</p>
                  </div>
                </Link>
              )}

              {/* SecureTools */}
              <Link
                to="/developers"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#f6faf2] transition-colors group"
              >
                <div className="w-8 h-8 rounded-xl bg-[#3a7a1f]/10 flex items-center justify-center flex-shrink-0">
                  <Package size={14} className="text-[#3a7a1f]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#1a1a1a]">Business Solutions</p>
                  <p className="text-[10px] text-[#1a1a1a]/35">RestOrder, chama, events & more</p>
                </div>
              </Link>

              {/* My Store — primary CTA for KS holders */}
              {ksProfile ? (
                <Link
                  to={`/ks/${ksProfile.ks_display.toLowerCase()}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gradient-to-r from-[#3a7a1f]/8 to-transparent hover:from-[#3a7a1f]/14 border border-[#3a7a1f]/12 transition-all group mb-1"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#3a7a1f] flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Store size={15} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1a1a1a]">My Store & Profile</p>
                    <p className="text-[10px] text-[#1a1a1a]/40 truncate">{ksProfile.ks_display.toLowerCase()}.securepay.ke</p>
                  </div>
                  <ArrowRight size={13} className="text-[#3a7a1f]/40 group-hover:text-[#3a7a1f] group-hover:translate-x-0.5 transition-all" />
                </Link>
              ) : (
                <Link
                  to="/signup"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gradient-to-r from-[#e87c1e]/8 to-transparent hover:from-[#e87c1e]/14 border border-[#e87c1e]/12 transition-all group mb-1"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#e87c1e] flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Shield size={15} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#1a1a1a]">Set up my Store</p>
                    <p className="text-[10px] text-[#1a1a1a]/40">Get a KS Number — free</p>
                  </div>
                  <span className="text-[9px] font-bold bg-[#e87c1e] text-white px-1.5 py-0.5 rounded-full flex-shrink-0">Free</span>
                </Link>
              )}

              {/* Add Product SecureLink — only shown if they have a KS profile */}
              {ksProfile && (
                <Link
                  to={`/ks/${ksProfile.ks_display.toLowerCase()}#add-product`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#f6faf2] transition-colors group"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#3a7a1f]/10 flex items-center justify-center flex-shrink-0">
                    <Package size={14} className="text-[#3a7a1f]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#1a1a1a]">Add product &amp; create SecureLink</p>
                    <p className="text-[10px] text-[#1a1a1a]/35">List item · generate link · share QR</p>
                  </div>
                </Link>
              )}

              <Link
                to="/create"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#f6faf2] transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-[#3a7a1f]/10 flex items-center justify-center flex-shrink-0">
                  <Zap size={14} className="text-[#3a7a1f]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#1a1a1a]">New SecureLink</p>
                  <p className="text-[10px] text-[#1a1a1a]/35">Trade, service or collection</p>
                </div>
              </Link>

              {ksProfile?.verification_status !== 'verified' && (
                <Link
                  to="/verify"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#f6faf2] transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <Star size={14} className="text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#1a1a1a]">Get Verified</p>
                    <p className="text-[10px] text-[#1a1a1a]/35">Unlock unlimited trading</p>
                  </div>
                  {ksProfile?.verification_status === 'unverified' && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                  )}
                </Link>
              )}
            </div>

            {/* Divider */}
            <div className="mx-4 border-t border-[#1a1a1a]/5" />

            {/* Admin section */}
            <div className="p-2">
              <p className="px-3 pt-1.5 pb-1 text-[9px] font-bold uppercase tracking-[0.15em] text-[#1a1a1a]/25">
                Account
              </p>

              <Link
                to="/create"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#fafaf8] transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-[#1a1a1a]/5 flex items-center justify-center flex-shrink-0">
                  <CreditCard size={14} className="text-[#1a1a1a]/50" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#1a1a1a]">Collections</p>
                  <p className="text-[10px] text-[#1a1a1a]/35">Chama, harambee, rent</p>
                </div>
              </Link>

              <Link
                to="/help"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#fafaf8] transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-[#1a1a1a]/5 flex items-center justify-center flex-shrink-0">
                  <Star size={14} className="text-[#1a1a1a]/50" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#1a1a1a]">Plans & pricing</p>
                  <p className="text-[10px] text-[#1a1a1a]/35">KES 100/mo · what's included</p>
                </div>
              </Link>

              <Link
                to="/verify"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#fafaf8] transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-[#1a1a1a]/5 flex items-center justify-center flex-shrink-0">
                  <FileText size={14} className="text-[#1a1a1a]/50" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#1a1a1a]">Verification</p>
                  <p className="text-[10px] text-[#1a1a1a]/35">Manage your KS status</p>
                </div>
              </Link>

              <button
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#fafaf8] transition-colors opacity-50 cursor-not-allowed"
                disabled
              >
                <div className="w-8 h-8 rounded-xl bg-[#1a1a1a]/5 flex items-center justify-center flex-shrink-0">
                  <Settings size={14} className="text-[#1a1a1a]/50" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-[#1a1a1a]">Settings</p>
                  <p className="text-[10px] text-[#1a1a1a]/35">Coming soon</p>
                </div>
              </button>
            </div>

            {/* Divider */}
            <div className="mx-4 border-t border-[#1a1a1a]/5" />

            {/* Sign out */}
            <div className="p-2">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 transition-colors group text-left"
              >
                <div className="w-8 h-8 rounded-xl bg-[#1a1a1a]/5 group-hover:bg-red-100 flex items-center justify-center flex-shrink-0 transition-colors">
                  <LogOut size={14} className="text-[#1a1a1a]/40 group-hover:text-red-500 transition-colors" />
                </div>
                <p className="text-sm font-medium text-[#1a1a1a]/60 group-hover:text-red-600 transition-colors">Sign out</p>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
