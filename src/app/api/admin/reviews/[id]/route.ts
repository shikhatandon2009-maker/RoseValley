import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseServerClient();
    const { id } = params;

    const { data: review, error } = await supabase
      .from('reviews')
      .select('*, products(name, images, slug), users(full_name, email)')
      .eq('store_id', STORE_ID)
      .eq('id', id)
      .single();

    if (error || !review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json({ review });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseServerClient();
    const { id } = params;
    const body = await request.json();

    const { status, rating, title, comment, images, is_verified_purchase } = body;

    const updates: Record<string, any> = {};

    if (status !== undefined) updates.status = status;
    if (rating !== undefined) updates.rating = Number(rating);
    if (title !== undefined) updates.title = title.trim();
    if (comment !== undefined) updates.comment = comment.trim();
    if (images !== undefined) updates.images = Array.isArray(images) ? images : [];
    if (is_verified_purchase !== undefined) updates.is_verified_purchase = Boolean(is_verified_purchase);

    const { data: updatedReview, error } = await supabase
      .from('reviews')
      .update(updates)
      .eq('store_id', STORE_ID)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating review:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Review updated successfully', review: updatedReview });
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
      .from('reviews')
      .delete()
      .eq('store_id', STORE_ID)
      .eq('id', id);

    if (error) {
      console.error('Error deleting review:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Review deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
