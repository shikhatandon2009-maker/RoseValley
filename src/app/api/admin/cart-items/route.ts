import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const { searchParams } = new URL(request.url);

    const userType = searchParams.get('user_type'); // 'all', 'registered', 'guest'
    const search = searchParams.get('search')?.trim();

    let query = supabase
      .from('cart_items')
      .select('*, products(id, name, price, images, slug), product_variants(id, name, price, size), users(id, full_name, email, phone)')
      .eq('store_id', STORE_ID)
      .order('updated_at', { ascending: false });

    if (userType === 'registered') {
      query = query.not('user_id', 'is', null);
    } else if (userType === 'guest') {
      query = query.is('user_id', null);
    }

    const { data: cartItems, error } = await query;

    if (error) {
      console.error('Error fetching cart items:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let filtered = cartItems || [];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (ci: any) =>
          ci.products?.name?.toLowerCase().includes(searchLower) ||
          ci.users?.full_name?.toLowerCase().includes(searchLower) ||
          ci.users?.email?.toLowerCase().includes(searchLower) ||
          ci.session_id?.toLowerCase().includes(searchLower)
      );
    }

    // Compute aggregate live cart statistics
    const totalCartItemsCount = filtered.length;
    const registeredCount = filtered.filter((ci: any) => Boolean(ci.user_id)).length;
    const guestCount = filtered.filter((ci: any) => !ci.user_id).length;

    // Distinct carts by user_id or session_id
    const distinctCartsSet = new Set(
      filtered.map((ci: any) => ci.user_id || ci.session_id)
    );
    const totalActiveCarts = distinctCartsSet.size;

    const totalCartValue = filtered.reduce((sum: number, ci: any) => {
      const itemPrice = ci.product_variants?.price || ci.products?.price || 0;
      return sum + Number(itemPrice) * (ci.quantity || 1);
    }, 0);

    return NextResponse.json({
      cartItems: filtered,
      stats: {
        totalCartItemsCount,
        registeredCount,
        guestCount,
        totalActiveCarts,
        totalCartValue,
      },
    });
  } catch (err: any) {
    console.error('API Error in GET /api/admin/cart-items:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Cart item ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('store_id', STORE_ID)
      .eq('id', id);

    if (error) {
      console.error('Error deleting cart item:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Cart item removed successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
