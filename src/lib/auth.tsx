// ═══════════════════════════════════════════════════════════════
// AUTH BRIDGE
//
// SecurePayAPI is the ONLY authentication source — there is no Supabase
// fallback. Login matches the current backend contract exactly (verified
// against ~/SecurePayAPI's AuthenticationController): KS Number + password
// always produces a pending MFA challenge, never an authenticated session
// directly. A session exists only after the OTP challenge is completed.
//
//   signIn(ksNumber, password)   -> sets `challenge` (NOT signed in yet)
//   completeSignIn(otpProof)     -> sets `session` (this is when auth succeeds)
//   resendChallenge()            -> resend the OTP for the pending challenge
//   cancelChallenge()            -> abandon the pending challenge
//
// Phase 2 public signup (ADR-0017) is a separate, structurally distinct
// staged journey — see src/api/securepayAuth.ts for the full backend
// contract:
//   startSignup(name, channelType, destination, password)
//                                 -> sets `signupChallenge` (NOT signed in yet)
//   completeSignup(otp)          -> sets `session` (this is when the identity
//                                    is created and auth succeeds), returns
//                                    the newly issued ksNumber once
//   resendSignupOtp()            -> resend the OTP for the pending signup challenge
//   cancelSignup()                -> abandon the pending signup challenge
//
// Public creation trial:
//   A visitor may shape an agreement before signing in. `trialMode` exposes a
//   deliberately non-authoritative placeholder user ONLY so CreateJourney can
//   render its question engine. It is not a session, has no KSNumber/token and
//   must never unlock protected Market routes. When a real backend write is
//   attempted, securepayClient requests authentication and this trial identity
//   is removed so CreateJourney's existing inline auth gate takes over in place.
//
// Rules:
//   - No production secrets, internal tokens, or provider credentials.
//   - Tokens live only in memory (React state) — cleared on reload.
//   - No localStorage / sessionStorage / cookies for tokens.
//   - Failed auth surfaces a safe error to the UI; a pending challenge is
//     never treated as a signed-in session.
//   - Trial mode is presentation-only and never equivalent to authentication.
// ═══════════════════════════════════════════════════════════════
import { createContext, useContext, useEffect, useState } from 'react';
import type {
  SecurePaySession,
  SecurePayUser,
  SecurePayLoginChallenge,
  SecurePaySignupChallenge,
  SecurePaySignupChannelType,
} from '../api/securepayTypes';
import {
  securePayBeginLogin,
  securePayCompleteLogin,
  securePayResendLoginOtp,
  securePayStartSignup,
  securePayResendSignupOtp,
  securePayVerifySignup,
  securePayLogout,
  securePayIsConfigured,
} from '../api/securepayAuth';
import { getAuthBoundaryMetadata } from '../integration/authBoundary';
import {
  CREATION_AUTH_COMPLETED_EVENT,
  CREATION_AUTH_REQUIRED_EVENT,
  CREATION_TRIAL_ENDED_EVENT,
  CREATION_TRIAL_STARTED_EVENT,
  loadCreationIntent,
} from './creationIntent';

export interface CompleteSignupResult {
  error: string | null;
  ksNumber: string | null;
}

interface AuthCtx {
  session: SecurePaySession | null;
  user: SecurePayUser | null;
  loading: boolean;
  challenge: SecurePayLoginChallenge | null;
  signIn: (ksNumber: string, password: string) => Promise<string | null>;
  completeSignIn: (otpProof: string) => Promise<string | null>;
  resendChallenge: () => Promise<string | null>;
  cancelChallenge: () => void;
  signupChallenge: SecurePaySignupChallenge | null;
  startSignup: (
    displayName: string,
    channelType: SecurePaySignupChannelType,
    destination: string,
    password: string
  ) => Promise<string | null>;
  resendSignupOtp: () => Promise<string | null>;
  completeSignup: (otp: string) => Promise<CompleteSignupResult>;
  cancelSignup: () => void;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({
  session: null, user: null, loading: false, challenge: null,
  signIn: async () => null,
  completeSignIn: async () => null,
  resendChallenge: async () => null,
  cancelChallenge: () => {},
  signupChallenge: null,
  startSignup: async () => null,
  resendSignupOtp: async () => null,
  completeSignup: async () => ({ error: 'Not available.', ksNumber: null }),
  cancelSignup: () => {},
  signOut: async () => {},
});

function initialCreationTrialMode(): boolean {
  if (typeof window === 'undefined') return false;
  if (!window.location.pathname.startsWith('/create')) return false;
  return loadCreationIntent() !== null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<SecurePaySession | null>(null);
  const [challenge, setChallenge] = useState<SecurePayLoginChallenge | null>(null);
  const [signupChallenge, setSignupChallenge] = useState<SecurePaySignupChallenge | null>(null);
  const [trialMode, setTrialMode] = useState(initialCreationTrialMode);

  // Sessions are in-memory only and never persisted — there is nothing to
  // restore on mount, so there is no async "loading" phase.
  const loading = false;

  useEffect(() => {
    const startTrial = () => setTrialMode(true);
    const endTrial = () => setTrialMode(false);
    const requireAuthentication = () => setTrialMode(false);

    window.addEventListener(CREATION_TRIAL_STARTED_EVENT, startTrial);
    window.addEventListener(CREATION_TRIAL_ENDED_EVENT, endTrial);
    window.addEventListener(CREATION_AUTH_REQUIRED_EVENT, requireAuthentication);
    return () => {
      window.removeEventListener(CREATION_TRIAL_STARTED_EVENT, startTrial);
      window.removeEventListener(CREATION_TRIAL_ENDED_EVENT, endTrial);
      window.removeEventListener(CREATION_AUTH_REQUIRED_EVENT, requireAuthentication);
    };
  }, []);

  const signIn = async (ksNumber: string, password: string): Promise<string | null> => {
    if (!securePayIsConfigured()) {
      return getAuthBoundaryMetadata().sessionUnavailableMessage;
    }
    const result = await securePayBeginLogin(ksNumber, password);
    if (!result.ok || !result.data) return result.error ?? 'Sign-in failed.';
    // A challenge was created — the user is NOT authenticated yet.
    setChallenge(result.data);
    return null;
  };

  const completeSignIn = async (otpProof: string): Promise<string | null> => {
    if (!challenge) return 'No sign-in in progress.';
    const result = await securePayCompleteLogin(challenge.challengeToken, otpProof);
    if (!result.ok || !result.data) {
      return result.error ?? 'Verification failed. Please check the code and try again.';
    }
    setSession(result.data);
    setChallenge(null);
    setTrialMode(false);

    // A creation request may be waiting while the inline auth gate is visible.
    // Give securepayClient the freshly issued token directly so that exact
    // request can resume without losing the visitor's completed trial answers.
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(CREATION_AUTH_COMPLETED_EVENT, {
        detail: { accessToken: result.data.accessToken },
      }));
    }
    return null;
  };

  const resendChallenge = async (): Promise<string | null> => {
    if (!challenge) return 'No sign-in in progress.';
    const result = await securePayResendLoginOtp(challenge.challengeToken);
    return result.ok ? null : (result.error ?? 'Could not resend the code.');
  };

  const cancelChallenge = () => setChallenge(null);

  // STEP 1 — POST /api/v1/auth/signup/start (ADR-0017 public self-onboarding)
  const startSignup = async (
    displayName: string,
    channelType: SecurePaySignupChannelType,
    destination: string,
    password: string
  ): Promise<string | null> => {
    if (!securePayIsConfigured()) {
      return getAuthBoundaryMetadata().sessionUnavailableMessage;
    }
    const result = await securePayStartSignup(displayName, channelType, destination, password);
    if (!result.ok || !result.data) return result.error ?? 'Could not start signup.';
    // A signup challenge was created — the user is NOT signed in yet.
    setSignupChallenge(result.data);
    return null;
  };

  const resendSignupOtp = async (): Promise<string | null> => {
    if (!signupChallenge) return 'No signup in progress.';
    const result = await securePayResendSignupOtp(signupChallenge.signupChallengeToken);
    return result.ok ? null : (result.error ?? 'Could not resend the code.');
  };

  // STEP 2 — POST /api/v1/auth/signup/verify. Only this call can create the
  // identity, issue a KSNumber, and produce a session. Returns the ksNumber
  // once so the signup UI can reveal it on the completion screen.
  const completeSignup = async (otp: string): Promise<CompleteSignupResult> => {
    if (!signupChallenge) return { error: 'No signup in progress.', ksNumber: null };
    const result = await securePayVerifySignup(signupChallenge.signupChallengeToken, otp);
    if (!result.ok || !result.data) {
      return {
        error: result.error ?? 'Verification failed. Please check the code and try again.',
        ksNumber: null,
      };
    }
    setSession(result.data);
    setSignupChallenge(null);
    setTrialMode(false);
    return { error: null, ksNumber: result.data.user.ksNumber ?? null };
  };

  const cancelSignup = () => setSignupChallenge(null);

  const signOut = async () => {
    if (securePayIsConfigured()) {
      await securePayLogout();
    }
    setSession(null);
    setChallenge(null);
    setSignupChallenge(null);
    setTrialMode(false);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(CREATION_TRIAL_ENDED_EVENT));
    }
  };

  const trialUser: SecurePayUser | null = !session && trialMode
    ? { id: 'securepay-public-trial', displayName: 'Guest trader' }
    : null;

  return (
    <Ctx.Provider value={{
      session, user: session?.user ?? trialUser, loading, challenge,
      signIn, completeSignIn, resendChallenge, cancelChallenge,
      signupChallenge, startSignup, resendSignupOtp, completeSignup, cancelSignup,
      signOut,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);