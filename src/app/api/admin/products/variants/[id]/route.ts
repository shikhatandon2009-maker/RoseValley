import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseServerClient();
    const { id } = params;
    const body = await request.json();

    const { name, sku, price, compare_at_price, stock, size } = body;

    const updates: Record<string, any> = {};

    if (name !== undefined) updates.name = name.trim();
    if (sku !== undefined) updates.sku = sku.trim();
    if (price !== undefined) updates.price = Number(price);
    if (compare_at_price !== undefined) updates.compare_at_price = compare_at_price ? Number(compare_at_price) : null;
    if (stock !== undefined) updates.stock = Number(stock);
    if (size !== undefined) updates.size = size.trim();

    const { data: updatedVariant, error } = await supabase
      .from('product_variants')
      .update(updates)
      .eq('store_id', STORE_ID)
      .eq('id', id)
      .select('*, products(name, images)')
      .single();

    if (error) {
      console.error('Error updating variant:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Variant updated successfully', variant: updatedVariant });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseServerClient();
    const { id } = params;

    const { error } = await supabase
      .from('product_variants')
      .delete()
      .eq('store_id', STORE_ID)
      .eq('id', id);

    if (error) {
      console.error('Error deleting variant:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Variant deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
