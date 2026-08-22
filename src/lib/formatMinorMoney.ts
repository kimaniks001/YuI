/** Format safe integer minor units without floating-point division. */
export function formatMinorMoney(currency: string, amountMinor: number): string | null {
  const normalizedCurrency = currency.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(normalizedCurrency) || !Number.isSafeInteger(amountMinor)) return null;
  const supportedValuesOf = (Intl as unknown as {
    supportedValuesOf?: (key: 'currency') => string[];
  }).supportedValuesOf;
  if (supportedValuesOf && !supportedValuesOf('currency').includes(normalizedCurrency)) return null;

  let precision: number;
  try {
    precision = new Intl.NumberFormat('en', {
      style: 'currency', currency: normalizedCurrency,
    }).resolvedOptions().maximumFractionDigits ?? 2;
  } catch {
    return null;
  }

  const negative = amountMinor < 0;
  const absolute = BigInt(Math.abs(amountMinor));
  const scale = 10n ** BigInt(precision);
  const major = absolute / scale;
  const fraction = (absolute % scale).toString().padStart(precision, '0');
  const groupedMajor = new Intl.NumberFormat('en-KE', { maximumFractionDigits: 0 }).format(major);
  return `${negative ? '-' : ''}${normalizedCurrency} ${groupedMajor}${precision ? `.${fraction}` : ''}`;
}

/** Convert a user-entered major-unit amount to a lossless JSON-safe minor integer. */
export function parseMajorMoneyToMinor(currency: string, majorAmount: string): number | null {
  if (typeof currency !== 'string' || typeof majorAmount !== 'string') return null;
  const normalizedCurrency = currency.trim().toUpperCase();
  if (normalizedCurrency !== 'KES') return null;
  const match = /^(?:0|[1-9]\d*)(?:\.(\d{1,2}))?$/.exec(majorAmount.trim());
  if (!match) return null;
  const [major = '0'] = majorAmount.trim().split('.');
  const fraction = (match[1] ?? '').padEnd(2, '0');
  const minor = BigInt(major) * 100n + BigInt(fraction || '0');
  if (minor <= 0n || minor > BigInt(Number.MAX_SAFE_INTEGER)) return null;
  return Number(minor);
}

/** Format non-negative decimal-string minor units without Number conversion. */
export function formatDecimalMinorMoney(currency: string, amountMinor: string): string | null {
  if (typeof currency !== 'string' || typeof amountMinor !== 'string') return null;
  const normalizedCurrency = currency.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(normalizedCurrency) || !/^[0-9]+$/.test(amountMinor)) return null;
  const supportedValuesOf = (Intl as unknown as {
    supportedValuesOf?: (key: 'currency') => string[];
  }).supportedValuesOf;
  // If the runtime cannot prove the code is supported, fail contained instead
  // of letting NumberFormat accept an arbitrary three-letter placeholder.
  if (!supportedValuesOf || !supportedValuesOf('currency').includes(normalizedCurrency)) return null;

  let precision: number;
  try {
    precision = new Intl.NumberFormat('en', {
      style: 'currency', currency: normalizedCurrency,
    }).resolvedOptions().maximumFractionDigits ?? 2;
  } catch {
    return null;
  }

  const padded = amountMinor.padStart(precision + 1, '0');
  const majorEnd = padded.length - precision;
  const major = padded.slice(0, majorEnd).replace(/^0+(?=\d)/, '');
  const fraction = padded.slice(majorEnd);
  const groupedMajor = major.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${normalizedCurrency} ${groupedMajor}${precision ? `.${fraction}` : ''}`;
}
