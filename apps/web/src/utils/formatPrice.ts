import { CURRENCY, LOCALE } from '../config';

const priceFormatter = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: CURRENCY });

/** 55.99 → "US$55.99" (locale and currency come from config.ts). */
export function formatPrice(amount: number): string {
  return priceFormatter.format(amount);
}
