import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();

    // Fetch currencies
    const { data: currencies, error: currErr } = await supabase
      .from('currencies')
      .select('*')
      .order('code', { ascending: true });

    if (currErr) {
      console.error('Error fetching currencies:', currErr);
    }

    // Fetch exchange rates for this store
    const { data: rates, error: rateErr } = await supabase
      .from('exchange_rates')
      .select('*')
      .eq('store_id', STORE_ID);

    if (rateErr) {
      console.error('Error fetching exchange rates:', rateErr);
    }

    const ratesMap = new Map<string, number>();
    (rates || []).forEach((r: any) => {
      ratesMap.set(r.currency_code, Number(r.rate_to_inr));
    });

    const defaultCurrencies = [
      { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate_to_inr: 1.0 },
      { code: 'USD', name: 'US Dollar', symbol: '$', rate_to_inr: 0.012 },
      { code: 'EUR', name: 'Euro', symbol: '€', rate_to_inr: 0.011 },
      { code: 'GBP', name: 'British Pound', symbol: '£', rate_to_inr: 0.0095 },
      { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', rate_to_inr: 0.044 },
    ];

    const mergedList = (currencies && currencies.length > 0 ? currencies : defaultCurrencies).map((c: any) => ({
      ...c,
      rate_to_inr: ratesMap.has(c.code) ? ratesMap.get(c.code) : (c.rate_to_inr || 1.0),
    }));

    return NextResponse.json({ currencies: mergedList });
  } catch (err: any) {
    console.error('API Error in GET /api/admin/settings/currencies:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, name, symbol, rate_to_inr = 1.0 } = body;

    if (!code || !name || !symbol) {
      return NextResponse.json(
        { error: 'Currency code, name, and symbol are required.' },
        { status: 400 }
      );
    }

    const uppercaseCode = code.trim().toUpperCase();
    const supabase = getSupabaseServerClient();

    // Upsert into currencies master table
    const { error: currErr } = await supabase
      .from('currencies')
      .upsert(
        [
          {
            code: uppercaseCode,
            name: name.trim(),
            symbol: symbol.trim(),
          },
        ],
        { onConflict: 'code' }
      );

    if (currErr) {
      console.error('Error upserting currency master:', currErr);
    }

    // Upsert into store exchange_rates table
    const { data: updatedRate, error: rateErr } = await supabase
      .from('exchange_rates')
      .upsert(
        [
          {
            store_id: STORE_ID,
            currency_code: uppercaseCode,
            rate_to_inr: Number(rate_to_inr) || 1.0,
            updated_at: new Date().toISOString(),
          },
        ],
        { onConflict: 'store_id,currency_code' }
      )
      .select('*')
      .single();

    if (rateErr) {
      console.error('Error upserting exchange rate:', rateErr);
      return NextResponse.json({ error: rateErr.message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Currency exchange rate updated successfully',
      rate: updatedRate,
    });
  } catch (err: any) {
    console.error('API Error in POST /api/admin/settings/currencies:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  return POST(request);
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Currency code is required' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    const { error } = await supabase
      .from('exchange_rates')
      .delete()
      .eq('store_id', STORE_ID)
      .eq('currency_code', code.toUpperCase());

    if (error) {
      console.error('Error deleting exchange rate:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Exchange rate removed successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
