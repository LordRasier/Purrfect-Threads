import Decimal from 'break_infinity.js';

export function format(value: Decimal | number, precision = 1): string {
  const amount = new Decimal(value);
  if (amount.lt(1000)) return amount.toNumber().toLocaleString('en-US', { maximumFractionDigits: precision });
  const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi'];
  const tier = Math.floor(amount.log10() / 3);
  if (tier >= suffixes.length) return amount.toExponential(2);
  return `${amount.div(Decimal.pow(1000, tier)).toFixed(1).replace(/\.0$/, '')}${suffixes[tier]}`;
}
