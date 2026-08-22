import type { ReactNode } from 'react';

export default function TraderPageHeader({ eyebrow, title, description, aside }: { eyebrow: string; title: string; description: string; aside?: ReactNode }) {
  return <div className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-700">{eyebrow}</p>
      <h1 className="mt-2 font-display text-4xl leading-tight sm:text-5xl">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/55 sm:text-base">{description}</p>
    </div>
    {aside}
  </div>;
}
