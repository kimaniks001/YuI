import type { ReactNode } from 'react';

export default function TraderPageHeader({
  eyebrow,
  title,
  description,
  aside,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  description: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div className="trader-page-header">
      <div className="min-w-0">
        <p className="trader-page-eyebrow">{eyebrow}</p>
        <h1 className="trader-page-title">{title}</h1>
        <div className="trader-page-description">{description}</div>
      </div>
      {aside}
    </div>
  );
}
