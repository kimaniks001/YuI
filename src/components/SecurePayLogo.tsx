const OFFICIAL_LOGO = '/assets/logos/securepay_logo_primary.png';

interface SecurePayLogoProps {
  size?: 'hero' | 'header' | 'compact';
  className?: string;
}

const SIZE_MAP = {
  hero:    'w-40 md:w-44 h-auto',
  header:  'w-32 md:w-36 h-auto',
  compact: 'w-28 md:w-32 h-auto',
};

export default function SecurePayLogo({ size = 'header', className = '' }: SecurePayLogoProps) {
  return (
    <img
      src={OFFICIAL_LOGO}
      alt="SecurePay by Keyman"
      className={`${SIZE_MAP[size]} object-contain select-none ${className}`}
      draggable={false}
    />
  );
}
