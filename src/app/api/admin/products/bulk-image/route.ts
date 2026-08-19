import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const { image_url, target = 'all' } = await request.json();

    if (!image_url || typeof image_url !== 'string') {
      return NextResponse.json({ error: 'Image URL is required.' }, { status: 400 });
    }

    const trimmedUrl = image_url.trim();

    // Prevent massive base64 payloads from bloating PostgreSQL
    if (trimmedUrl.startsWith('data:image/') && trimmedUrl.length > 5000) {
      return NextResponse.json({
        error: 'Base64 data URLs cannot be bulk assigned to products as they bloat the database. Please provide an Image URL (Shopify CDN, Supabase Storage, or /uploads/...).',
      }, { status: 400 });
    }

    // 1. Fetch all product IDs from Supabase
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, images')
      .order('id');

    if (fetchError) {
      console.error('Error fetching products for bulk image:', fetchError);
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
        total: (products || []).length,
      });
    }

    const idsToUpdate = productsToUpdate.map((p: any) => p.id);

    // 2. High-performance batch update in chunks of 50
    const CHUNK_SIZE = 50;
    let updatedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < idsToUpdate.length; i += CHUNK_SIZE) {
      const chunkIds = idsToUpdate.slice(i, i + CHUNK_SIZE);
      const { error: updateError, count } = await supabase
        .from('products')
        .update({
          images: [trimmedUrl],
          updated_at: new Date().toISOString(),
        })
        .in('id', chunkIds);

      if (updateError) {
        errors.push(`Chunk error: ${updateError.message}`);
      } else {
        updatedCount += chunkIds.length;
      }
    }

    return NextResponse.json({
      success: true,
      count: updatedCount,
      total: productsToUpdate.length,
      imageUrl: trimmedUrl,
      message: `Successfully assigned image to ${updatedCount} products!`,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err: any) {
    console.error('Bulk image update error:', err);
    return NextResponse.json({ error: err.message || 'Failed to update bulk images' }, { status: 500 });
  }
}
