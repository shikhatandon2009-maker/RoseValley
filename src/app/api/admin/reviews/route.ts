import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search')?.trim();
    const status = searchParams.get('status');
    const rating = searchParams.get('rating');

    let query = supabase
      .from('reviews')
      .select('*, products(id, name, images, slug), users(id, full_name, email)')
      .eq('store_id', STORE_ID)
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (rating && rating !== 'all') {
      query = query.eq('rating', Number(rating));
    }

    const { data: reviews, error } = await query;

    if (error) {
      console.error('Error fetching reviews:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let filtered = reviews || [];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (r: any) =>
          r.title?.toLowerCase().includes(searchLower) ||
          r.comment?.toLowerCase().includes(searchLower) ||
          r.products?.name?.toLowerCase().includes(searchLower) ||
          r.users?.full_name?.toLowerCase().includes(searchLower) ||
          r.users?.email?.toLowerCase().includes(searchLower)
      );
    }

    // Fetch review_votes for vote tallying
    const reviewIds = filtered.map((r: any) => r.id);
    const votesMap = new Map<string, { helpful: number; unhelpful: number }>();

    if (reviewIds.length > 0) {
      const { data: votes } = await supabase
        .from('review_votes')
        .select('review_id, vote_type')
        .eq('store_id', STORE_ID)
        .in('review_id', reviewIds);

      (votes || []).forEach((v: any) => {
        const current = votesMap.get(v.review_id) || { helpful: 0, unhelpful: 0 };
        if (v.vote_type === 'helpful') current.helpful += 1;
        if (v.vote_type === 'unhelpful') current.unhelpful += 1;
        votesMap.set(v.review_id, current);
      });
    }

    const enrichedReviews = filtered.map((r: any) => ({
      ...r,
      votes: votesMap.get(r.id) || { helpful: 0, unhelpful: 0 },
    }));

    // Stats
    const totalReviews = enrichedReviews.length;
    const pendingCount = enrichedReviews.filter((r: any) => r.status === 'pending').length;
    const approvedCount = enrichedReviews.filter((r: any) => r.status === 'approved').length;
    const rejectedCount = enrichedReviews.filter((r: any) => r.status === 'rejected').length;

    const totalRatingSum = enrichedReviews.reduce((sum: number, r: any) => sum + (Number(r.rating) || 0), 0);
    const averageRating = totalReviews > 0 ? (totalRatingSum / totalReviews).toFixed(1) : '5.0';

    const totalHelpfulVotes = enrichedReviews.reduce((sum: number, r: any) => sum + r.votes.helpful, 0);

    return NextResponse.json({
      reviews: enrichedReviews,
      stats: {
        totalReviews,
        pendingCount,
        approvedCount,
        rejectedCount,
        averageRating,
        totalHelpfulVotes,
      },
    });
  } catch (err: any) {
    console.error('API Error in GET /api/admin/reviews:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      product_id,
      user_id,
      rating = 5,
      title = '',
      comment = '',
      images = [],
      status = 'approved',
      is_verified_purchase = true,
    } = body;

    if (!product_id || !user_id || !comment || comment.trim() === '') {
      return NextResponse.json(
        { error: 'Product, User, and Review Comment are required.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    const { data: newReview, error: insertError } = await supabase
      .from('reviews')
      .insert([
        {
          store_id: STORE_ID,
          product_id,
          user_id,
          rating: Number(rating) || 5,
          title: title.trim(),
          comment: comment.trim(),
          images: Array.isArray(images) ? images : [],
          status,
          is_verified_purchase: Boolean(is_verified_purchase),
          created_at: new Date().toISOString(),
        },
      ])
      .select('*')
      .single();

    if (insertError) {
      console.error('Error inserting review:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: 'Review created successfully', review: newReview },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('API Error in POST /api/admin/reviews:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
