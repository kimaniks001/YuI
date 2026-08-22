import { RotateCw } from 'lucide-react';

interface RetryButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
}

export default function RetryButton({ onClick, label = 'Try again', className = '' }: RetryButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#3a7a1f]/25 text-[#3a7a1f] text-sm font-medium hover:bg-[#3a7a1f]/5 transition-colors ${className}`}
    >
      <RotateCw size={13} /> {label}
    </button>
  );
}
