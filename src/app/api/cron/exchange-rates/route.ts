import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';

export async function GET() {
  try {
    // In production, hit exchange rate API (e.g. exchangerate-api or frankfurter)
    const mockUpdatedRates = [
      { currency_code: 'INR', rate_to_inr: 1.0 },
      { currency_code: 'USD', rate_to_inr: 0.012 },
      { currency_code: 'EUR', rate_to_inr: 0.011 },
      { currency_code: 'AED', rate_to_inr: 0.044 },
    ];

    const supabase = getSupabaseServerClient();

    for (const r of mockUpdatedRates) {
      await supabase.from('exchange_rates').upsert({
        store_id: STORE_ID,
        currency_code: r.currency_code,
        rate_to_inr: r.rate_to_inr,
        updated_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Exchange rates refreshed successfully via Vercel Cron',
      rates: mockUpdatedRates,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
