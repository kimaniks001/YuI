/**
 * SecurePay Design System — Components
 *
 * Import from this file for all shared UI across the platform.
 * Every component here uses the "sp-*" CSS class system from index.css
 * and Tailwind tokens from tailwind.config.js.
 */

import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, Info, XCircle, X, HelpCircle, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import LivingSecurePayMark from '../LivingSecurePayMark';
import AccountDropdown from '../AccountDropdown';
import { SecurePayFooter } from '../securepay';

// ─── Brand tokens (JS mirror of Tailwind colors) ─────────────────────────────
export const colors = {
  green: {
    950: '#0f2a07', 900: '#1e4d10', 800: '#255e13', 700: '#2d6018',
    600: '#3a7a1f', 500: '#4a8f28', 400: '#6aab3e', 300: '#8dc468',
    200: '#b8dda0', 100: '#dff0d2', 50: '#f0f7eb', 25: '#f6faf2',
  },
  orange: {
    900: '#7c3200', 800: '#a34200', 700: '#c96a10', 600: '#e87c1e',
    500: '#f09444', 400: '#f5aa6a', 300: '#f8c294', 200: '#fbd9bb',
    100: '#fdeedd', 50: '#fef6ed',
  },
  ink: {
    DEFAULT: '#1a1a1a', 90: '#2a2a2a', 80: '#3a3a3a', 70: '#4f4f4f',
    60: '#666666', 50: '#808080', 40: '#9a9a9a', 30: '#b3b3b3',
    20: '#cccccc', 10: '#e5e5e5', 5: '#f2f2f0',
  },
  cream: {
    DEFAULT: '#fafaf8', warm: '#f5f4ef', ivory: '#f0ede4', sand: '#e8e3d8',
  },
} as const;

// ─── Page containers ──────────────────────────────────────────────────────────
export function PageContainer({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`sp-container ${className}`}>{children}</div>;
}
export function PageContainerSm({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`sp-container-sm ${className}`}>{children}</div>;
}
export function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`sp-section ${className}`}>{children}</section>;
}
export function SectionSm({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`sp-section-sm ${className}`}>{children}</section>;
}

// ─── Typography ───────────────────────────────────────────────────────────────
interface TextProps { children: React.ReactNode; className?: string; }

export function HeroHeading({ children, className = '' }: TextProps) {
  return <h1 className={`sp-hero ${className}`}>{children}</h1>;
}
export function HeroItalic({ children, className = '' }: TextProps) {
  return <span className={`sp-hero-italic block ${className}`}>{children}</span>;
}
export function SectionHeading({ children, className = '' }: TextProps) {
  return <h2 className={`sp-heading ${className}`}>{children}</h2>;
}
export function CardHeading({ children, className = '' }: TextProps) {
  return <h3 className={`text-base font-semibold text-ink ${className}`}>{children}</h3>;
}
export function SectionLabel({ children, className = '' }: TextProps) {
  return <p className={`sp-label ${className}`}>{children}</p>;
}
export function BodyText({ children, className = '' }: TextProps) {
  return <p className={`sp-body ${className}`}>{children}</p>;
}
export function BodySm({ children, className = '' }: TextProps) {
  return <p className={`sp-body-sm ${className}`}>{children}</p>;
}
export function Caption({ children, className = '' }: TextProps) {
  return <p className={`sp-caption ${className}`}>{children}</p>;
}
export function HelperText({ children, className = '' }: TextProps) {
  return <p className={`sp-helper-text ${className}`}>{children}</p>;
}
export function ErrorText({ children, className = '' }: TextProps) {
  return <p className={`sp-error-text ${className}`}>{children}</p>;
}

// ─── Buttons ──────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

function btnSize(size: ButtonProps['size'] = 'md') {
  if (size === 'sm') return 'px-4 py-2 text-xs';
  if (size === 'lg') return 'px-8 py-4 text-base';
  return 'px-6 py-3 text-sm';
}

export function PrimaryButton({ children, loading, size = 'md', className = '', ...props }: ButtonProps) {
  return (
    <button className={`sp-btn-primary ${btnSize(size)} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
      {children}
    </button>
  );
}

export function BrandButton({ children, loading, size = 'md', className = '', ...props }: ButtonProps) {
  return (
    <button className={`sp-btn-brand ${btnSize(size)} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
      {children}
    </button>
  );
}

export function SecondaryButton({ children, size = 'md', className = '', ...props }: ButtonProps) {
  return (
    <button className={`sp-btn-secondary ${btnSize(size)} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function GhostButton({ children, className = '', ...props }: ButtonProps) {
  return (
    <button className={`sp-btn-ghost ${className}`} {...props}>
      {children}
    </button>
  );
}

export function DangerButton({ children, loading, size = 'md', className = '', ...props }: ButtonProps) {
  return (
    <button className={`sp-btn-danger ${btnSize(size)} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
      {children}
    </button>
  );
}

// ─── Cards ────────────────────────────────────────────────────────────────────
export function Card({ children, className = '', onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div className={`sp-card ${onClick ? 'sp-card-hover' : ''} ${className}`} onClick={onClick} role={onClick ? 'button' : undefined}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = '', size = 'md' }: { children: React.ReactNode; className?: string; size?: 'sm' | 'md' }) {
  return <div className={`${size === 'sm' ? 'sp-card-body-sm' : 'sp-card-body'} ${className}`}>{children}</div>;
}

export function GreenCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`sp-card-green p-6 ${className}`}>{children}</div>;
}

export function DarkCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`sp-card-dark p-6 ${className}`}>{children}</div>;
}

// Scenario / product card with icon
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href?: string;
  onClick?: () => void;
}
export function FeatureCard({ icon, title, description, href, onClick }: FeatureCardProps) {
  const content = (
    <div className="sp-card sp-card-hover sp-card-body-sm hover:border-green-600/15 group">
      <div className="mb-3">{icon}</div>
      <p className="font-semibold text-sm text-ink mb-1 group-hover:text-green-600 transition-colors">{title}</p>
      <p className="text-xs text-ink/45 leading-snug">{description}</p>
    </div>
  );
  if (href) return <a href={href}>{content}</a>;
  return <div onClick={onClick}>{content}</div>;
}

// ─── Form fields ──────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helper?: string;
  error?: string;
  hint?: string;
}
export function Input({ label, helper, error, hint, className = '', id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="sp-field">
      {label && <label htmlFor={inputId} className="sp-label-field">{label}{props.required && <span className="text-red-500 ml-0.5">*</span>}</label>}
      <input id={inputId} className={`${error ? 'sp-input-error' : 'sp-input'} ${className}`} aria-invalid={!!error} aria-describedby={error ? `${inputId}-error` : helper ? `${inputId}-helper` : undefined} {...props} />
      {hint && !error && <p className="sp-helper-text">{hint}</p>}
      {helper && !error && <p id={`${inputId}-helper`} className="sp-helper-text">{helper}</p>}
      {error && <p id={`${inputId}-error`} className="sp-error-text" role="alert">{error}</p>}
    </div>
  );
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helper?: string;
  error?: string;
}
export function TextArea({ label, helper, error, className = '', id, ...props }: TextAreaProps) {
  const fieldId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="sp-field">
      {label && <label htmlFor={fieldId} className="sp-label-field">{label}{props.required && <span className="text-red-500 ml-0.5">*</span>}</label>}
      <textarea id={fieldId} className={`${error ? 'sp-input-error sp-textarea' : 'sp-textarea'} ${className}`} aria-invalid={!!error} {...props} />
      {helper && !error && <p className="sp-helper-text">{helper}</p>}
      {error && <p className="sp-error-text" role="alert">{error}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helper?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}
export function Select({ label, helper, error, options, placeholder, className = '', id, ...props }: SelectProps) {
  const fieldId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="sp-field">
      {label && <label htmlFor={fieldId} className="sp-label-field">{label}{props.required && <span className="text-red-500 ml-0.5">*</span>}</label>}
      <select id={fieldId} className={`sp-select ${className}`} aria-invalid={!!error} {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {helper && !error && <p className="sp-helper-text">{helper}</p>}
      {error && <p className="sp-error-text" role="alert">{error}</p>}
    </div>
  );
}

// Radio card — agreement/payment choice selector
interface RadioCardProps {
  value: string;
  selected: boolean;
  onSelect: (v: string) => void;
  icon?: React.ReactNode;
  title: string;
  description?: string;
}
export function RadioCard({ value, selected, onSelect, icon, title, description }: RadioCardProps) {
  return (
    <div
      className={`sp-radio-card ${selected ? 'sp-radio-card-selected' : ''}`}
      onClick={() => onSelect(value)}
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' || e.key === ' ' ? onSelect(value) : undefined}
    >
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${selected ? 'border-green-600 bg-green-600' : 'border-ink/20'}`}>
        {selected && <div className="w-2 h-2 rounded-full bg-white" />}
      </div>
      {icon && <div className="flex-shrink-0">{icon}</div>}
      <div>
        <p className="text-sm font-semibold text-ink">{title}</p>
        {description && <p className="text-xs text-ink/45 mt-0.5 leading-snug">{description}</p>}
      </div>
    </div>
  );
}

// ─── Badges / Status ──────────────────────────────────────────────────────────
export type LinkStatus =
  | 'draft' | 'active' | 'funded' | 'pending' | 'review'
  | 'ready' | 'released' | 'cancelled' | 'expired'
  | 'approved' | 'rejected' | 'info';

const BADGE_LABELS: Record<LinkStatus, string> = {
  draft:     'Draft',
  active:    'Active',
  funded:    'Funded',
  pending:   'Pending',
  review:    'Under Review',
  ready:     'Payment Ready',
  released:  'Released',
  cancelled: 'Cancelled',
  expired:   'Expired',
  approved:  'Approved',
  rejected:  'Rejected',
  info:      'Info',
};

const BADGE_CLASSES: Record<LinkStatus, string> = {
  draft:     'sp-badge-draft',
  active:    'sp-badge-active',
  funded:    'sp-badge-funded',
  pending:   'sp-badge-pending',
  review:    'sp-badge-review',
  ready:     'sp-badge-ready',
  released:  'sp-badge-released',
  cancelled: 'sp-badge-cancelled',
  expired:   'sp-badge-expired',
  approved:  'sp-badge-approved',
  rejected:  'sp-badge-rejected',
  info:      'sp-badge-info',
};

export function StatusBadge({ status, label, className = '' }: { status: LinkStatus; label?: string; className?: string }) {
  return (
    <span className={`${BADGE_CLASSES[status]} ${className}`}>
      {label ?? BADGE_LABELS[status]}
    </span>
  );
}

// ─── Alerts ───────────────────────────────────────────────────────────────────
type AlertVariant = 'success' | 'info' | 'warning' | 'danger' | 'neutral';

const ALERT_ICONS: Record<AlertVariant, React.ReactNode> = {
  success: <CheckCircle size={16} className="text-green-600 flex-shrink-0 mt-0.5" />,
  info:    <Info size={16} className="text-sky-600 flex-shrink-0 mt-0.5" />,
  warning: <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />,
  danger:  <XCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />,
  neutral: <Info size={16} className="text-ink/40 flex-shrink-0 mt-0.5" />,
};

export function Alert({ variant = 'neutral', children, onDismiss, className = '' }: {
  variant?: AlertVariant;
  children: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
}) {
  return (
    <div className={`sp-alert-${variant} ${className}`} role={variant === 'danger' ? 'alert' : 'status'}>
      {ALERT_ICONS[variant]}
      <div className="flex-1">{children}</div>
      {onDismiss && (
        <button onClick={onDismiss} aria-label="Dismiss" className="ml-auto flex-shrink-0 opacity-50 hover:opacity-80">
          <X size={14} />
        </button>
      )}
    </div>
  );
}

// ─── Progress stepper ─────────────────────────────────────────────────────────
export interface Step {
  id: string;
  label: string;
  sublabel?: string;
}
export function Stepper({ steps, current }: { steps: Step[]; current: number }) {
  return (
    <div className="w-full" role="list" aria-label="Progress">
      {/* Mobile: compact top bar */}
      <div className="flex items-center gap-2 md:hidden mb-6">
        {steps.map((s, i) => (
          <div
            key={s.id}
            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i < current ? 'bg-green-600' : i === current ? 'bg-orange-600' : 'bg-ink/10'}`}
          />
        ))}
      </div>
      <p className="md:hidden text-xs text-ink/45 mb-4">
        Step {current + 1} of {steps.length} — <span className="font-semibold text-ink/70">{steps[current]?.label}</span>
      </p>
      {/* Desktop: full stepper */}
      <div className="hidden md:flex items-center gap-0 w-full">
        {steps.map((s, i) => (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0" role="listitem" aria-current={i === current ? 'step' : undefined}>
              <div className={i < current ? 'sp-step-dot-done' : i === current ? 'sp-step-dot-current' : 'sp-step-dot-future'}>
                {i < current ? <LivingSecurePayMark state="complete" size="xs" presence="polite" decorative /> : i === current ? <LivingSecurePayMark state="guiding" size="xs" presence="present" decorative /> : <span>{i + 1}</span>}
              </div>
              <span className={`text-xs font-semibold whitespace-nowrap ${i === current ? 'text-orange-600' : i < current ? 'text-green-600' : 'text-ink/30'}`}>{s.label}</span>
              {s.sublabel && <span className="text-[10px] text-ink/30">{s.sublabel}</span>}
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 transition-all duration-500 ${i < current ? 'bg-green-600' : 'bg-ink/8'}`} aria-hidden />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// Journey progress (SecureLink lifecycle)
export interface JourneyStep {
  label: string;
  description: string;
  status: 'done' | 'current' | 'future';
}
export function JourneyProgress({ steps }: { steps: JourneyStep[] }) {
  return (
    <div className="space-y-0">
      {steps.map((s, i) => (
        <div key={s.label} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all ${
              s.status === 'done' ? 'bg-green-600 text-white' :
              s.status === 'current' ? 'bg-orange-600 text-white ring-4 ring-orange-600/15' :
              'bg-ink/8 text-ink/30'
            }`}>
              {s.status === 'done' ? <CheckCircle size={13} /> : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className={`w-0.5 flex-1 my-1 min-h-[20px] transition-colors ${s.status === 'done' ? 'bg-green-600/40' : 'bg-ink/8'}`} />
            )}
          </div>
          <div className="pb-5 pt-0.5">
            <p className={`text-sm font-semibold ${s.status === 'current' ? 'text-orange-600' : s.status === 'done' ? 'text-green-600' : 'text-ink/35'}`}>{s.label}</p>
            <p className="text-xs text-ink/40 leading-snug mt-0.5">{s.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 gap-4">
      {icon && (
        <div className="w-14 h-14 rounded-2xl bg-ink/5 flex items-center justify-center">
          {icon}
        </div>
      )}
      <div className="max-w-xs">
        <p className="font-semibold text-ink/70 mb-1.5">{title}</p>
        <p className="text-sm text-ink/40 leading-relaxed">{description}</p>
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

// ─── Error state ──────────────────────────────────────────────────────────────
interface ErrorStateProps {
  title?: string;
  message: string;
  action?: React.ReactNode;
}
export function ErrorState({ title = 'Something went wrong', message, action }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 gap-4">
      <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
        <XCircle size={24} className="text-red-500" />
      </div>
      <div className="max-w-sm">
        <p className="font-semibold text-ink/80 mb-1.5">{title}</p>
        <p className="text-sm text-ink/50 leading-relaxed">{message}</p>
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

// ─── Loading state ────────────────────────────────────────────────────────────
export function LoadingState({ message = 'Loading…' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 gap-4">
      <div className="w-10 h-10 border-3 border-green-600/20 border-t-green-600 rounded-full animate-spin" style={{ borderWidth: 3 }} />
      <p className="text-sm text-ink/45">{message}</p>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`sp-skeleton ${className}`} aria-hidden />;
}

// ─── Trust note ───────────────────────────────────────────────────────────────
export function TrustNote({ compact = false }: { compact?: boolean }) {
  return (
    <p className={`sp-trust-note ${compact ? 'text-[10px]' : 'text-xs'}`}>
      SecurePay is an agreement-driven payment platform. It helps money move according to agreed conditions.
      Banking and payment services may be provided through regulated financial infrastructure partners.
      SecurePay is not a bank.
    </p>
  );
}

// ─── Help hint ────────────────────────────────────────────────────────────────
const HINTS: Record<string, string> = {
  'KS Number':       'Your unique SecurePay identity number. Used to identify you in agreements and payments.',
  'SecureLink':      'An agreement-backed payment link. Both sides can see the agreement before money moves.',
  'Group SecureLink': 'A link for collecting money from many people toward a shared purpose — rent, welfare, school fees, events and more.',
  'Payment Ready':   'When the agreement conditions have been met and money can be released to the recipient.',
  'Evidence':        'Photos, documents, notes or approvals that help confirm what happened in an agreement.',
  'Review':          'A process used when there is a question before money is released. Both sides can share their view.',
  'Draft':           'An agreement that has been started but not yet shared or funded.',
  'Released':        'Money has been sent to the recipient. The agreement is complete.',
};

export function HelpHint({ term, className = '' }: { term: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const hint = HINTS[term];
  if (!hint) return null;
  return (
    <span className={`relative inline-flex items-baseline gap-0.5 ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-label={`What is ${term}?`}
        className="inline-flex items-center gap-1 text-green-600 hover:underline"
      >
        {term}
        <HelpCircle size={11} className="text-green-600/60 flex-shrink-0 mb-0.5" />
      </button>
      {open && (
        <span className="absolute bottom-full left-0 mb-2 z-50 w-56 bg-white border border-ink/8 rounded-xl shadow-panel p-3 text-xs text-ink/65 leading-snug animate-scale-in">
          <strong className="block text-ink/80 mb-1">{term}</strong>
          {hint}
          <button onClick={() => setOpen(false)} className="block mt-2 text-green-600 text-[10px] hover:underline">Got it</button>
        </span>
      )}
    </span>
  );
}

// ─── Collapsible FAQ item ─────────────────────────────────────────────────────
interface FAQItemProps {
  question: string;
  answer: string;
  defaultOpen?: boolean;
}
export function FAQItem({ question, answer, defaultOpen = false }: FAQItemProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-ink/6 last:border-0">
      <button
        className="w-full flex items-center justify-between gap-4 py-4 text-left"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-ink/80">{question}</span>
        <ChevronDown size={16} className={`text-ink/30 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="pb-4 pr-6">
          <p className="text-sm text-ink/55 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

// ─── Divider with optional label ─────────────────────────────────────────────
export function Divider({ label }: { label?: string }) {
  if (!label) return <div className="sp-divider" />;
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 sp-divider" />
      <span className="text-xs text-ink/30 font-medium">{label}</span>
      <div className="flex-1 sp-divider" />
    </div>
  );
}

// ─── Section intro block ──────────────────────────────────────────────────────
interface SectionIntroProps {
  label?: string;
  title: React.ReactNode;
  subtitle?: string;
  className?: string;
  align?: 'left' | 'center';
}
export function SectionIntro({ label, title, subtitle, className = '', align = 'center' }: SectionIntroProps) {
  const textAlign = align === 'center' ? 'text-center' : 'text-left';
  const mx = align === 'center' ? 'mx-auto' : '';
  return (
    <div className={`mb-12 ${textAlign} ${className}`}>
      {label && <p className="sp-label mb-2">{label}</p>}
      <h2 className="sp-heading mb-3">{title}</h2>
      {subtitle && <p className={`sp-body max-w-lg ${mx}`}>{subtitle}</p>}
    </div>
  );
}

// ─── Icon container ───────────────────────────────────────────────────────────
interface IconBubbleProps {
  icon: React.ReactNode;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
export function IconBubble({ icon, color = '#3a7a1f', size = 'md', className = '' }: IconBubbleProps) {
  const dim = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-14 h-14' : 'w-10 h-10';
  const radius = size === 'sm' ? 'rounded-lg' : 'rounded-xl';
  return (
    <div
      className={`${dim} ${radius} flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ background: color + '18' }}
    >
      {React.cloneElement(icon as React.ReactElement, { style: { color } })}
    </div>
  );
}

// ─── Layout: Form page ────────────────────────────────────────────────────────
export function FormPage({ children, title, subtitle, backHref, trustNote = true, reviewMode = false, markState = 'resting' }: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  backHref?: string;
  trustNote?: boolean;
  reviewMode?: boolean;
  markState?: 'resting' | 'listening' | 'guiding' | 'success' | 'caution' | 'waiting' | 'review' | 'complete';
}) {
  return (
    <div className="sp-auth-page identity-doorway">
      <div className="identity-doorway__glow identity-doorway__glow--a" aria-hidden="true" />
      <div className="identity-doorway__glow identity-doorway__glow--b" aria-hidden="true" />
      <header className="sp-site-header identity-doorway__header">
        <div className="sp-container-lg h-[76px] flex items-center justify-between gap-4">
          <Link to={reviewMode ? '/preview/home' : '/'} className="sp-living-mark-link"><LivingSecurePayMark state="resting" size="md" presence="polite" /></Link>
          <div className="flex items-center gap-3"><span className="hidden sm:inline text-xs text-ink/45">Your KSNumber is your identity in the Market</span>{reviewMode ? <span className="identity-review-chip">Visual review</span> : <AccountDropdown />}</div>
        </div>
      </header>
      <main className="sp-auth-main identity-doorway__main">
      <div className="identity-form-wrap">
        <aside className="identity-doorway__welcome">
          <LivingSecurePayMark state={markState} size="lg" presence="present" />
          <p className="identity-doorway__eyebrow">Identity doorway</p>
          <h2>Enter the Market as yourself.</h2>
          <p>Your KSNumber is the identity SecurePay carries into your agreements. We ask only for what this doorway needs, and we tell you what each step means.</p>
          <div className="identity-doorway__reassurance"><LivingSecurePayMark state="resting" size="xs" presence="polite" decorative /><span>Nothing in account creation moves money.</span></div>
        </aside>
        <div className="sp-auth-panel">
        {backHref && (
          <Link to={backHref} className="inline-flex items-center gap-1.5 text-sm text-ink/45 hover:text-green-600 mb-7 transition-colors">
            ← Back
          </Link>
        )}
        {(title || subtitle) && (
          <header>
            {title && <h1>{title}</h1>}
            {subtitle && <p className="sp-body">{subtitle}</p>}
          </header>
        )}
        {children}
        {trustNote && (
          <div className="mt-10 pt-6 border-t border-ink/6">
            <TrustNote />
          </div>
        )}
        </div>
      </div>
      </main>
      <SecurePayFooter />
    </div>
  );
}

// ─── Layout: Review summary ───────────────────────────────────────────────────
export function ReviewRow({ label, value, muted }: { label: string; value: React.ReactNode; muted?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-ink/5 last:border-0">
      <span className="text-xs text-ink/45 flex-shrink-0">{label}</span>
      <span className={`text-sm ${muted ? 'text-ink/40' : 'text-ink/80'} text-right`}>{value}</span>
    </div>
  );
}
export function ReviewSummary({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <div className="sp-card sp-card-body">
      {title && <p className="text-xs font-bold uppercase tracking-widest text-ink/35 mb-4">{title}</p>}
      {children}
    </div>
  );
}
