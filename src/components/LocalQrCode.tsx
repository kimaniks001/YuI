import { useMemo } from 'react';
import { createLocalQrMatrix } from '../lib/localQr';

export default function LocalQrCode({ value, size = 220, label = 'SecurePay offer QR code' }: { value: string; size?: number; label?: string }) {
  const matrix = useMemo(() => createLocalQrMatrix(value), [value]);
  const quiet = 4;
  const dimension = matrix.length + quiet * 2;
  const path = useMemo(() => {
    const commands: string[] = [];
    matrix.forEach((row, y) => row.forEach((dark, x) => {
      if (dark) commands.push(`M${x + quiet} ${y + quiet}h1v1h-1z`);
    }));
    return commands.join('');
  }, [matrix]);

  return <svg
    role="img"
    aria-label={label}
    viewBox={`0 0 ${dimension} ${dimension}`}
    width={size}
    height={size}
    className="sp-local-qr"
    shapeRendering="crispEdges"
  >
    <rect width={dimension} height={dimension} fill="white" />
    <path d={path} fill="black" />
  </svg>;
}
