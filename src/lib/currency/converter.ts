import { fetchExchangeRates } from '../supabase/store-scoped-queries';
import { CURRENCY_SYMBOLS } from '../constants';

export interface ExchangeRateMap {
  [code: string]: number;
}

export async function getExchangeRatesMap(): Promise<ExchangeRateMap> {
  const rates = await fetchExchangeRates();
  const map: ExchangeRateMap = { INR: 1.0 };
  rates.forEach((r: any) => {
    map[r.currency_code] = Number(r.rate_to_inr);
  });
  return map;
}

export function convertFromINR(amountInINR: number, targetCurrency: string, rates: ExchangeRateMap): number {
  const rate = rates[targetCurrency] || 1.0;
  return amountInINR * rate;
}

export function formatConvertedPrice(amountInINR: number, currencyCode: string, rates: ExchangeRateMap): string {
  const symbol = CURRENCY_SYMBOLS[currencyCode] || currencyCode + " ";
  const converted = convertFromINR(amountInINR, currencyCode, rates);
  
  if (currencyCode === 'INR') {
    return `${symbol}${converted.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  }
  return `${symbol}${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
