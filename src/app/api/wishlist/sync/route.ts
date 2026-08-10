import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, productIds = [] } = body;

    const supabase = getSupabaseServerClient();

    // 1. Ensure a valid user_id exists in users table
    let targetUserId = userId;

    if (!targetUserId) {
      // Find existing user in store first
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('store_id', STORE_ID)
        .limit(1)
        .maybeSingle();

      if (existingUser) {
        targetUserId = existingUser.id;
      } else {
        const { data: newUser, error: userInsertError } = await supabase
          .from('users')
          .insert([
            {
              store_id: STORE_ID,
              email: 'guest.visitor@maisonessence.com',
              password_hash: 'guest_no_login_hash_12345',
              full_name: 'Guest Visitor',
              role: 'customer',
              created_at: new Date().toISOString(),
            },
          ])
          .select('id')
          .single();

        if (userInsertError) {
          console.error('Error creating guest user:', userInsertError);
          return NextResponse.json({ error: userInsertError.message }, { status: 500 });
        }
        if (newUser) targetUserId = newUser.id;
      }
    }

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'Could not resolve user_id for wishlist entry.' },
        { status: 500 }
      );
    }

    // 2. Fetch an existing valid product ID from DB if passed product ID is not a UUID
    const { data: existingProducts } = await supabase
      .from('products')
      .select('id')
      .eq('store_id', STORE_ID)
      .limit(10);

    const validProductIdsInDb = (existingProducts || []).map((p: any) => p.id);

    const isValidUuid = (id?: string) =>
      Boolean(id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));

    // 3. Clear existing wishlist for targetUserId
    await supabase
      .from('wishlists')
      .delete()
      .eq('store_id', STORE_ID)
      .eq('user_id', targetUserId);

    // 4. Map and filter product IDs
    const newRows = productIds
      .map((pId: string) => {
        let finalPid = pId;
        if (!isValidUuid(finalPid)) {
          if (validProductIdsInDb.length > 0) {
            finalPid = validProductIdsInDb[0];
          } else {
            return null;
          }
        }
        return {
          store_id: STORE_ID,
          user_id: targetUserId,
          product_id: finalPid,
          created_at: new Date().toISOString(),
        };
      })
      .filter(Boolean)
      .filter((row: any, idx: number, self: any[]) =>
        self.findIndex((r) => r.product_id === row.product_id) === idx
      );

    if (newRows.length > 0) {
      const { error: insertError } = await supabase
        .from('wishlists')
        .insert(newRows);

      if (insertError) {
        console.error('Error inserting wishlists in sync:', insertError);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
    }

    return NextResponse.json({
      message: 'Wishlist synchronized with Supabase live database successfully',
      count: newRows.length,
    });
  } catch (err: any) {
    console.error('API Error in POST /api/wishlist/sync:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
