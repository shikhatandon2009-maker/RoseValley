import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim();

    const { data: wishlists, error } = await supabase
      .from('wishlists')
      .select('*, users(id, full_name, email, phone), products(id, name, price, images, slug)')
      .eq('store_id', STORE_ID)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching wishlists:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let filtered = wishlists || [];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (w: any) =>
          w.products?.name?.toLowerCase().includes(searchLower) ||
          w.users?.full_name?.toLowerCase().includes(searchLower) ||
          w.users?.email?.toLowerCase().includes(searchLower)
      );
    }

    // Compute stats
    const totalWishlistEntries = filtered.length;
    const uniqueUsersSet = new Set(filtered.map((w: any) => w.user_id));
    const uniqueUsersCount = uniqueUsersSet.size;

    // Leaderboard of most wishlisted products
    const productCountMap = new Map<string, { product: any; count: number }>();
    filtered.forEach((w: any) => {
      if (w.products?.id) {
        const existing = productCountMap.get(w.products.id);
        if (existing) {
          existing.count += 1;
        } else {
          productCountMap.set(w.products.id, { product: w.products, count: 1 });
        }
      }
    });

    const leaderboard = Array.from(productCountMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return NextResponse.json({
      wishlists: filtered,
      stats: {
        totalWishlistEntries,
        uniqueUsersCount,
        leaderboard,
      },
    });
  } catch (err: any) {
    console.error('API Error in GET /api/admin/wishlists:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Wishlist ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('store_id', STORE_ID)
      .eq('id', id);

    if (error) {
      console.error('Error deleting wishlist:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Wishlist entry removed successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
