// Pure step-transition and field-validation logic for the Phase 2 signup
// wizard (src/pages/Signup.tsx: name → contact → password → OTP → done).
// Deliberately dependency-free (no React, no adapter imports) so it can be
// exercised directly under plain Node — see
// scripts/validate-signup-wizard-transitions.mjs. Keep in sync with how
// Signup.tsx actually drives its step state; this is the single source of
// truth for "what screen comes next," not a parallel copy of it.

export type SignupWizardStep = 'name' | 'contact' | 'password' | 'otp' | 'done';

// Password policy mirrors the backend's current configured signup policy
// (DefaultPasswordPolicy / AuthenticationSecurityProperties.signup(),
// password-min-length: 10 — length + at least one letter + one digit).
// This is a client-side pre-check only, purely to avoid a round trip for an
// obviously-too-weak password; the backend's WEAK_PASSWORD response remains
// authoritative and is always surfaced as-is if this check somehow drifts
// from the server's configured minimum.
export const SIGNUP_PASSWORD_MIN_LENGTH = 10;

export const SIGNUP_WIZARD_STEPS: readonly SignupWizardStep[] = ['name', 'contact', 'password', 'otp'];

export function signupStepIndex(step: SignupWizardStep): number {
  return SIGNUP_WIZARD_STEPS.indexOf(step as (typeof SIGNUP_WIZARD_STEPS)[number]);
}

export function validateSignupName(displayName: string): string | null {
  return displayName.trim() ? null : 'Please tell us your name.';
}

export function validateSignupDestination(
  channelType: 'EMAIL' | 'SMS',
  destination: string
): string | null {
  const value = destination.trim();
  if (!value) {
    return channelType === 'EMAIL' ? 'Please enter your email address.' : 'Please enter your phone number.';
  }
  if (channelType === 'EMAIL' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return 'Please enter a valid email address.';
  }
  if (channelType === 'SMS' && !/^\+?[0-9]{7,15}$/.test(value)) {
    return 'Please enter a valid phone number.';
  }
  return null;
}

export function validateSignupPassword(password: string, confirmPassword: string): string | null {
  if (password.length < SIGNUP_PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${SIGNUP_PASSWORD_MIN_LENGTH} characters long.`;
  }
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return 'Password must contain at least one letter and one digit.';
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match.';
  }
  return null;
}

export function validateSignupOtp(otp: string): string | null {
  return otp.trim() ? null : 'Enter the code we sent you.';
}

export type SignupWizardEvent = 'submit' | 'back' | 'verified' | 'restart';

// Guards which step is reachable next given the current step and a UI
// event. 'restart' is the safe-retry path used when a signup challenge has
// become invalid/expired (ADR-0017 §L generic error) — it always returns to
// 'password' rather than forcing the user to re-enter name/contact, since
// only a fresh /start call (not a fresh identity) is needed.
export function nextSignupStep(step: SignupWizardStep, event: SignupWizardEvent): SignupWizardStep {
  if (event === 'restart') return 'password';
  if (event === 'verified') return step === 'otp' ? 'done' : step;
  if (event === 'submit') {
    if (step === 'name') return 'contact';
    if (step === 'contact') return 'password';
    if (step === 'password') return 'otp';
    return step;
  }
  if (event === 'back') {
    if (step === 'contact') return 'name';
    if (step === 'password') return 'contact';
    if (step === 'otp') return 'password';
    return step;
  }
  return step;
}
