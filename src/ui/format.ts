import Decimal from 'break_infinity.js';
import { getLanguage } from './localization';

export function format(value: Decimal | number, precision = 1): string {
  const amount = new Decimal(value);
  if (amount.lt(1000)) return amount.toNumber().toLocaleString(getLanguage() === 'es' ? 'es' : 'en-US', { maximumFractionDigits: precision });
  const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi'];
  const tier = Math.floor(amount.log10() / 3);
  const formatted = tier >= suffixes.length ? amount.toExponential(2) : `${amount.div(Decimal.pow(1000, tier)).toFixed(1).replace(/\.0$/, '')}${suffixes[tier]}`;
  return getLanguage() === 'es' ? formatted.replace('.', ',') : formatted;
}
