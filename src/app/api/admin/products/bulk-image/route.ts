import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const { image_url, target = 'all' } = await request.json();

    if (!image_url || typeof image_url !== 'string') {
      return NextResponse.json({ error: 'Image URL is required.' }, { status: 400 });
    }

    const trimmedUrl = image_url.trim();

    let query = supabase
      .from('products')
      .select('id, images')
      .eq('store_id', STORE_ID);

    const { data: products, error: fetchError } = await query;

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    let productsToUpdate = products || [];

    if (target === 'missing_only') {
      productsToUpdate = productsToUpdate.filter(
        (p: any) => !p.images || !Array.isArray(p.images) || p.images.length === 0 || !p.images[0]
      );
    }

    if (productsToUpdate.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No products matched criteria for update.',
        count: 0,
      });
    }

    let updatedCount = 0;
    const errors: string[] = [];

    // Batch update products
    for (const p of productsToUpdate) {
      const { error: updateError } = await supabase
        .from('products')
        .update({
          images: [trimmedUrl],
          updated_at: new Date().toISOString(),
        })
        .eq('id', p.id)
        .eq('store_id', STORE_ID);

      if (updateError) {
        errors.push(`Product ID ${p.id}: ${updateError.message}`);
      } else {
        updatedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      count: updatedCount,
      total: productsToUpdate.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err: any) {
    console.error('Bulk image update error:', err);
    return NextResponse.json({ error: err.message || 'Failed to update bulk images' }, { status: 500 });
  }
}
