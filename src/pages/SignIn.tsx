import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import SecurePayLogo from '../components/SecurePayLogo';
import LivingSecurePayMark from '../components/LivingSecurePayMark';
import { useAuth } from '../lib/auth';
import { loadCreationIntent } from '../lib/creationIntent';
import { safeReturnPath } from '../routing/returnPath';

export default function SignIn({ previewMode = false }: { previewMode?: boolean }) {
  const { session, signIn, completeSignIn, resendChallenge, cancelChallenge, challenge } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const savedIntent = useMemo(() => loadCreationIntent(), []);
  const returnTo = safeReturnPath(searchParams.get('returnTo'), savedIntent ? '/create/journey' : '/dashboard');
  const [ksNumber, setKsNumber] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [previewChallenge, setPreviewChallenge] = useState(false);

  // A public creation trial is not a real session. Only backend-authenticated
  // identity may cross this doorway into protected Market rooms.
  if (session && !previewMode) return <Navigate to={returnTo} replace />;

  const otpStep = previewMode ? previewChallenge : Boolean(challenge);

  const submitCredentials = async () => {
    if (!ksNumber.trim() || !password || loading) return;
    setError('');
    setNotice('');
    if (previewMode) {
      setPreviewChallenge(true);
      return;
    }
    setLoading(true);
    const err = await signIn(ksNumber.trim(), password);
    setLoading(false);
    if (err) setError(err);
  };

  const verify = async () => {
    if (!otp.trim() || loading) return;
    setError('');
    setNotice('');
    if (previewMode) {
      navigate('/preview/trader-home', { replace: true });
      return;
    }
    setLoading(true);
    const err = await completeSignIn(otp.trim());
    setLoading(false);
    if (err) setError(err);
    else navigate(returnTo, { replace: true });
  };

  const backFromOtp = () => {
    if (previewMode) setPreviewChallenge(false);
    else cancelChallenge();
    setOtp('');
    setError('');
    setNotice('');
  };

  const resend = async () => {
    setError('');
    if (previewMode) {
      setNotice('A new code has been sent.');
      return;
    }
    setLoading(true);
    const err = await resendChallenge();
    setLoading(false);
    if (err) setError(err);
    else setNotice('A new code has been sent.');
  };

  return (
    <div className="identity-doorway">
      <div className="identity-doorway__dark-ground" aria-hidden="true" />
      <div className="identity-doorway__atmosphere" aria-hidden="true" />

      <header className="identity-doorway__header">
        <Link to={previewMode ? '/preview/home' : '/'} aria-label="SecurePay home" className="identity-doorway__logo">
          <SecurePayLogo size="header" />
        </Link>
        <div className="identity-doorway__header-actions">
          {savedIntent && (
            <span className="identity-context-chip" title={savedIntent.statement}>
              <i aria-hidden="true" />
              <span>{savedIntent.what}{savedIntent.amount !== 'To be confirmed' ? ` · ${savedIntent.amount}` : ''}</span>
              <b>Saved</b>
            </span>
          )}
          <Link to={previewMode ? '/preview/home' : '/'} className="identity-back-link">
            <ArrowLeft size={14} /> Back
          </Link>
        </div>
      </header>

      <main className="identity-doorway__main">
        <section className="identity-doorway__layout">
          <div className="identity-doorway__editorial">
            <span className="identity-doorway__eyebrow">Enter the Market</span>
            <h1>{otpStep ? 'One quick check, then you are in.' : 'Come back in as yourself.'}</h1>
            <p>
              {otpStep
                ? 'The code confirms that it is you returning. It does not move money or change an agreement.'
                : 'Your KSNumber carries your SecurePay identity into the agreements and trade you take part in.'}
            </p>

            {savedIntent ? (
              <div className="identity-saved-purpose">
                <LivingSecurePayMark state="active" size="sm" surface="light" label="Your agreement intention is saved" />
                <div>
                  <span>Your agreement is still here.</span>
                  <strong>{savedIntent.what}</strong>
                  <p>After identity, SecurePay takes you back to what you were already doing.</p>
                </div>
              </div>
            ) : (
              <div className="identity-doorway__reassurance">
                <LivingSecurePayMark state="resting" size="sm" surface="light" decorative />
                <div>
                  <strong>Your KSNumber is your Market identity.</strong>
                  <span>SecurePay will tell you clearly when something needs your attention.</span>
                </div>
              </div>
            )}
          </div>

          <section className="identity-auth-panel sp-surface-dark" aria-labelledby="identity-panel-title">
            <div className="identity-auth-panel__atmosphere" aria-hidden="true" />
            <div className="identity-auth-panel__inner">
              <div className="identity-panel-mark">
                <LivingSecurePayMark
                  state={loading ? 'checking' : otpStep ? 'guiding' : 'resting'}
                  size="md"
                  presence="present"
                  surface="dark"
                  label={loading ? 'SecurePay is checking your identity' : otpStep ? 'SecurePay is guiding verification' : 'SecurePay sign in'}
                />
                <div>
                  <span>{loading ? 'Checking' : otpStep ? 'Identity check' : 'SecurePay identity'}</span>
                  <strong>{loading ? 'Establishing the current truth.' : 'Your KSNumber brings you back as you.'}</strong>
                </div>
              </div>

              <div className="identity-panel-heading">
                <span>{otpStep ? 'Confirmation code' : 'Sign in'}</span>
                <h2 id="identity-panel-title">{otpStep ? 'Enter your code.' : 'Welcome back.'}</h2>
                <p>{otpStep ? 'Complete the identity check to continue.' : 'Use the KSNumber and password you return with.'}</p>
              </div>

              {error && (
                <div role="alert" className="identity-message identity-message--error">
                  <LivingSecurePayMark state="caution" size="xs" surface="dark" decorative />
                  <span>{error}</span>
                </div>
              )}
              {notice && <div className="identity-message identity-message--notice">{notice}</div>}

              {!otpStep ? (
                <div className="identity-form">
                  <label>
                    <span>KSNumber</span>
                    <input
                      aria-label="KSNumber"
                      placeholder="KSNumber, e.g. KS2145"
                      value={ksNumber}
                      onChange={event => setKsNumber(event.target.value)}
                      autoComplete="username"
                      autoFocus
                    />
                  </label>

                  <label>
                    <span>Password</span>
                    <div className="identity-password-field">
                      <input
                        aria-label="Password"
                        placeholder="Password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={event => setPassword(event.target.value)}
                        onKeyDown={event => event.key === 'Enter' && void submitCredentials()}
                        autoComplete="current-password"
                      />
                      <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(value => !value)}>
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </label>

                  <button type="button" className="identity-primary" onClick={() => void submitCredentials()} disabled={loading || !ksNumber.trim() || !password}>
                    Continue <ArrowRight size={17} />
                  </button>

                  <div className="identity-form-footer">
                    <Link to={previewMode ? '/preview/help' : '/help'}>Need help signing in?</Link>
                    <span>New here? <Link to={previewMode ? '/preview/signup' : '/signup'}>Create your KSNumber</Link></span>
                  </div>
                </div>
              ) : (
                <div className="identity-form">
                  <label>
                    <span>Confirmation code</span>
                    <input
                      aria-label="Verification code"
                      className="identity-otp"
                      placeholder="000000"
                      inputMode="numeric"
                      value={otp}
                      onChange={event => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                      onKeyDown={event => event.key === 'Enter' && void verify()}
                      autoComplete="one-time-code"
                      autoFocus
                    />
                  </label>

                  <button type="button" className="identity-primary" onClick={() => void verify()} disabled={loading || !otp.trim()}>
                    Verify & continue <ArrowRight size={17} />
                  </button>

                  <div className="identity-otp-actions">
                    <button type="button" onClick={backFromOtp}>Back</button>
                    <button type="button" onClick={() => void resend()}>Resend code</button>
                  </div>
                </div>
              )}

              <p className="identity-panel-truth">Identity checks do not fund, release or change an agreement.</p>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}
