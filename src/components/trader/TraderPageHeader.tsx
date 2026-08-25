import type { ReactNode } from 'react';
import { Info } from 'lucide-react';
import { useAuth } from '../../lib/auth';

export default function TraderPageHeader({
  eyebrow,
  title,
  description,
  aside,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  aside?: ReactNode;
}) {
  const { user } = useAuth();
  const ksNumber = user?.ksNumber?.trim();

  return (
    <header className="trader-page-header trader-page-header--compact">
      <div className="min-w-0 flex-1">
        <div className="trader-page-topline">
          <p className="trader-page-eyebrow">{eyebrow}</p>
          {ksNumber && <span className="trader-page-identity" aria-label={`Signed in as ${ksNumber}`}>{ksNumber}</span>}
        </div>
        <h1 className="trader-page-title">{title}</h1>
        {description && <>
          <div className="trader-page-description">{description}</div>
          <details className="trader-page-about">
            <summary><Info size={13} /> About this page</summary>
            <div>{description}</div>
          </details>
        </>}
      </div>
      {aside && <div className="trader-page-aside">{aside}</div>}
    </header>
  );
}
