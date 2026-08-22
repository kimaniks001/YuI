import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { Check, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import SecurePayLogo from '../SecurePayLogo';
import LivingSecurePayMark from '../LivingSecurePayMark';

const lifecycle = ['Agree', 'Pay', 'Confirm', 'Release'] as const;

export function SecurePayPageShell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`sp-page-shell ${className}`}>{children}</div>;
}

interface HeaderProps { open?: boolean; onToggle?: () => void; actions?: ReactNode; children?: ReactNode; }
export function SecurePayHeader({ actions, children }: HeaderProps) {
  return <header className="sp-site-header"><div className="sp-container-lg h-16 flex items-center justify-between gap-4"><Link to="/" className="sp-living-mark-link"><LivingSecurePayMark state="resting" size="md" presence="polite" /></Link>{children}{actions}</div></header>;
}
export function SecurePayMobileHeader({ open = false, onToggle, actions }: HeaderProps) {
  return <div className="flex items-center gap-2 xl:hidden">{actions}<button type="button" onClick={onToggle} aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? 'Close navigation' : 'Open navigation'} className="sp-icon-button">{open ? <X /> : <Menu />}</button></div>;
}

export function SecurePayFooter() {
  return <footer className="sp-site-footer"><div className="sp-container grid md:grid-cols-[1fr_2fr] gap-8"><div><SecurePayLogo size="compact" className="logo-on-dark" /><p className="text-sm mt-3">Money should follow the agreement.</p></div><nav aria-label="Footer navigation" className="grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-3 text-sm"><Link to="/situations">SecureLink</Link><Link to="/situations">Group SecureLink</Link><Link to="/situations">Situations</Link><Link to="/help">Pricing information</Link><Link to="/trust">Trust</Link><Link to="/situations">Business solutions</Link><Link to="/developers">Developers</Link><Link to="/help">Help</Link><Link to="/signin">Sign in</Link><Link to="/terms">Terms</Link><Link to="/privacy">Privacy</Link></nav></div></footer>;
}

export function SecurePayCard({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={`sp-card ${className}`} {...props} />; }

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export function SecurePayButton({ variant = 'primary', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button className={`sp-btn-${variant === 'primary' ? 'brand' : variant} ${className}`} {...props} />;
}

type StatusTone = 'success' | 'pending' | 'warning' | 'danger' | 'info' | 'neutral';
export function SecurePayStatusChip({ children, tone = 'neutral' }: { children: ReactNode; tone?: StatusTone }) { return <span className={`sp-status-chip sp-status-${tone}`}>{children}</span>; }

export function SecurePaySectionHeading({ eyebrow, title, children, className = '' }: { eyebrow?: string; title: string; children?: ReactNode; className?: string }) {
  return <div className={className}>{eyebrow && <p className="sp-label">{eyebrow}</p>}<h2 className="sp-heading mt-2">{title}</h2>{children}</div>;
}

export function SecurePayAmount({ currency = 'KES', children, className = '' }: { currency?: string; children: ReactNode; className?: string }) { return <p className={`sp-amount ${className}`}><span>{currency}</span> {children}</p>; }

export function SecurePayEmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) { return <div className="sp-empty-state"><LivingSecurePayMark state="guiding" size="lg" presence="present" /><h3 className="font-display text-2xl font-semibold">{title}</h3>{children && <div className="sp-body-sm max-w-md">{children}</div>}{action}</div>; }

export function SecurePayNotice({ tone = 'info', title, children }: { tone?: StatusTone; title?: string; children: ReactNode }) {
  const state = tone === 'success' ? 'success' : tone === 'warning' || tone === 'danger' ? 'caution' : tone === 'pending' ? 'waiting' : 'guiding';
  return <div className={`sp-notice sp-notice-${tone}`} role={tone === 'danger' ? 'alert' : 'status'}><LivingSecurePayMark state={state} size="sm" presence={tone === 'danger' ? 'commanding' : 'polite'} /><div>{title && <strong className="block mb-1">{title}</strong>}{children}</div></div>;
}

export function SecurePayLifecycleBar({ current = 0 }: { current?: number }) {
  return <ol className="sp-lifecycle" aria-label="SecurePay lifecycle">{lifecycle.map((label, index) => <li key={label} aria-current={index === current ? 'step' : undefined} className={index < current ? 'is-complete' : index === current ? 'is-current' : ''}><span>{index < current ? <Check size={13} /> : index + 1}</span><strong>{label}</strong></li>)}</ol>;
}

export function SecurePayActionCard({ icon, title, children, action, className = '' }: { icon?: ReactNode; title: string; children: ReactNode; action?: ReactNode; className?: string }) { return <SecurePayCard className={`sp-action-card ${className}`}>{icon}<div><h3 className="font-display text-xl font-semibold">{title}</h3><div className="sp-body-sm mt-2">{children}</div>{action && <div className="mt-4">{action}</div>}</div></SecurePayCard>; }
