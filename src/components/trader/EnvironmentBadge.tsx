import { ShieldCheck } from 'lucide-react';
import { getIntegrationEnvironment } from '../../integration/environmentContract';

export default function EnvironmentBadge() {
  const environment = getIntegrationEnvironment();
  if (environment.mode === 'production') return null;

  const label = environment.mode === 'sandbox'
    ? 'Sandbox'
    : environment.mode === 'mock'
      ? 'Mock'
      : 'Demo';

  return (
    <span
      className="hidden min-h-8 items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-amber-800 sm:inline-flex"
      title="This is not the production SecurePay environment. Financial outcomes shown here must still come from backend authority."
      aria-label={`${label} environment`}
    >
      <ShieldCheck size={13} aria-hidden="true" />
      {label}
    </span>
  );
}
