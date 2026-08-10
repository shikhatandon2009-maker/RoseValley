import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const { searchParams } = new URL(request.url);

    const orderId = searchParams.get('order_id');
    const search = searchParams.get('search')?.trim();

    let query = supabase
      .from('order_items')
      .select('*, orders(order_number, status, payment_status, created_at, guest_email)')
      .eq('store_id', STORE_ID)
      .order('created_at', { ascending: false });

    if (orderId && orderId !== 'all') {
      query = query.eq('order_id', orderId);
    }

    const { data: items, error } = await query;

    if (error) {
      console.error('Error fetching order items:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let filtered = items || [];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (it: any) =>
          it.product_name?.toLowerCase().includes(searchLower) ||
          it.orders?.order_number?.toLowerCase().includes(searchLower) ||
          it.orders?.guest_email?.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({ items: filtered });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
