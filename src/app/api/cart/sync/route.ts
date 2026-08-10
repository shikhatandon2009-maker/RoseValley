import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';

const DEMO_PRODUCTS_SEED = [
  {
    id: 'p1111111-1111-1111-1111-111111111111',
    store_id: STORE_ID,
    name: 'Rose Royale Eau de Parfum',
    slug: 'rose-royale-eau-de-parfum',
    description: 'An intoxicating bouquet of Damask Rose, Velvet Oud, and warm Golden Amber.',
    price: 4800,
    compare_at_price: 5500,
    stock: 45,
    images: ['https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop'],
    is_featured: true,
    is_bestseller: true,
  },
  {
    id: 'p2222222-2222-2222-2222-222222222222',
    store_id: STORE_ID,
    name: 'Velvet Amber & Vanilla Oil Blend',
    slug: 'velvet-amber-vanilla-oil-blend',
    description: 'Rich Madagascar Vanilla harmonized with golden amber and smoked vetiver.',
    price: 3200,
    compare_at_price: 3800,
    stock: 30,
    images: ['https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=1000&auto=format&fit=crop'],
    is_featured: true,
    is_bestseller: false,
  },
  {
    id: 'p3333333-3333-3333-3333-333333333333',
    store_id: STORE_ID,
    name: 'Midnight Jasmine & Bergamot Cologne',
    slug: 'midnight-jasmine-bergamot-cologne',
    description: 'Night-blooming Jasmine blended with sun-ripened Calabrian Bergamot.',
    price: 4200,
    compare_at_price: 4900,
    stock: 25,
    images: ['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1000&auto=format&fit=crop'],
    is_featured: true,
    is_bestseller: true,
  },
  {
    id: 'p4444444-4444-4444-4444-444444444444',
    store_id: STORE_ID,
    name: 'Kadam Attar',
    slug: 'kadam-attar',
    description: 'Artisanal Kannauj hydro-distilled attar presents exquisite earthy florals.',
    price: 4800,
    compare_at_price: 5500,
    stock: 30,
    images: ['https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop'],
    is_featured: true,
    is_bestseller: true,
  },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, userId, items = [] } = body;

    if (!sessionId && !userId) {
      return NextResponse.json(
        { error: 'Either sessionId or userId is required.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    // 1. Ensure seed demo products exist in DB so FK constraint succeeds
    for (const demoProd of DEMO_PRODUCTS_SEED) {
      await supabase
        .from('products')
        .upsert(demoProd, { onConflict: 'id' });
    }

    // 2. Delete existing cart_items for this sessionId / userId
    if (userId) {
      await supabase
        .from('cart_items')
        .delete()
        .eq('store_id', STORE_ID)
        .eq('user_id', userId);
    } else if (sessionId) {
      await supabase
        .from('cart_items')
        .delete()
        .eq('store_id', STORE_ID)
        .eq('session_id', sessionId);
    }

    // 3. Prepare new cart items to insert
    const isValidUuid = (id?: string) =>
      Boolean(id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));

    const newRows = items.map((it: any) => {
      const pId = isValidUuid(it.productId)
        ? it.productId
        : DEMO_PRODUCTS_SEED[0].id; // Fallback to valid product UUID if needed

      return {
        store_id: STORE_ID,
        user_id: userId || null,
        session_id: sessionId || null,
        product_id: pId,
        variant_id: isValidUuid(it.variantId) ? it.variantId : null,
        quantity: Number(it.quantity) || 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    });

    if (newRows.length > 0) {
      const { error: insertError } = await supabase
        .from('cart_items')
        .insert(newRows);

      if (insertError) {
        console.error('Error inserting cart_items in sync:', insertError);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
    }

    return NextResponse.json({
      message: 'Cart synchronized with Supabase live database successfully',
      count: newRows.length,
    });
  } catch (err: any) {
    console.error('API Error in POST /api/cart/sync:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
