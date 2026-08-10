import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search')?.trim();
    const status = searchParams.get('status');

    let query = supabase
      .from('coupons')
      .select('*')
      .eq('store_id', STORE_ID)
      .order('created_at', { ascending: false });

    if (status === 'active') {
      query = query.eq('is_active', true);
    } else if (status === 'inactive') {
      query = query.eq('is_active', false);
    }

    const { data: coupons, error } = await query;

    if (error) {
      console.error('Error fetching coupons:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let filtered = coupons || [];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (c: any) =>
          c.code?.toLowerCase().includes(searchLower) ||
          c.discount_type?.toLowerCase().includes(searchLower)
      );
    }

    const now = new Date();
    const totalCoupons = filtered.length;
    const activeCouponsCount = filtered.filter((c: any) => c.is_active).length;
    const percentageRulesCount = filtered.filter((c: any) => c.discount_type === 'percentage').length;
    const expiredCouponsCount = filtered.filter(
      (c: any) => c.expiry_date && new Date(c.expiry_date) < now
    ).length;

    return NextResponse.json({
      coupons: filtered,
      stats: {
        totalCoupons,
        activeCouponsCount,
        percentageRulesCount,
        expiredCouponsCount,
      },
    });
  } catch (err: any) {
    console.error('API Error in GET /api/admin/coupons:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      code,
      discount_type = 'percentage',
      discount_value = 0,
      min_spend = 0,
      expiry_date = null,
      is_active = true,
    } = body;

    if (!code || code.trim() === '') {
      return NextResponse.json({ error: 'Coupon code is required.' }, { status: 400 });
    }

    const uppercaseCode = code.trim().toUpperCase();
    const supabase = getSupabaseServerClient();

    // Check code uniqueness
    const { data: existing } = await supabase
      .from('coupons')
      .select('id')
      .eq('store_id', STORE_ID)
      .eq('code', uppercaseCode)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: `Coupon code "${uppercaseCode}" already exists.` },
        { status: 409 }
      );
    }

    const { data: newCoupon, error: insertError } = await supabase
      .from('coupons')
      .insert([
        {
          store_id: STORE_ID,
          code: uppercaseCode,
          discount_type,
          discount_value: Number(discount_value) || 0,
          min_spend: Number(min_spend) || 0,
          expiry_date: expiry_date ? new Date(expiry_date).toISOString() : null,
          is_active: Boolean(is_active),
          created_at: new Date().toISOString(),
        },
      ])
      .select('*')
      .single();

    if (insertError) {
      console.error('Error inserting coupon:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: 'Coupon created successfully', coupon: newCoupon },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('API Error in POST /api/admin/coupons:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
