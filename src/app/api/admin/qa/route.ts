import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search')?.trim();
    const status = searchParams.get('status');
    const filter = searchParams.get('filter'); // 'unanswered', 'answered', 'all'

    let query = supabase
      .from('product_questions')
      .select('*, products(id, name, images, slug), users(id, full_name, email)')
      .eq('store_id', STORE_ID)
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: questions, error } = await query;

    if (error) {
      console.error('Error fetching product questions:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let filtered = questions || [];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (q: any) =>
          q.question?.toLowerCase().includes(searchLower) ||
          q.products?.name?.toLowerCase().includes(searchLower) ||
          q.users?.full_name?.toLowerCase().includes(searchLower) ||
          q.users?.email?.toLowerCase().includes(searchLower)
      );
    }

    // Fetch answers for all questions
    const questionIds = filtered.map((q: any) => q.id);
    const answersMap = new Map<string, any[]>();

    if (questionIds.length > 0) {
      const { data: answers } = await supabase
        .from('product_answers')
        .select('*, users(id, full_name, email)')
        .eq('store_id', STORE_ID)
        .in('question_id', questionIds)
        .order('created_at', { ascending: true });

      (answers || []).forEach((ans: any) => {
        const existing = answersMap.get(ans.question_id) || [];
        existing.push(ans);
        answersMap.set(ans.question_id, existing);
      });
    }

    let enrichedQuestions = filtered.map((q: any) => ({
      ...q,
      answers: answersMap.get(q.id) || [],
    }));

    if (filter === 'unanswered') {
      enrichedQuestions = enrichedQuestions.filter((q: any) => q.answers.length === 0);
    } else if (filter === 'answered') {
      enrichedQuestions = enrichedQuestions.filter((q: any) => q.answers.length > 0);
    }

    // Compute stats
    const totalQuestions = enrichedQuestions.length;
    const unansweredCount = enrichedQuestions.filter((q: any) => q.answers.length === 0).length;
    const approvedCount = enrichedQuestions.filter((q: any) => q.status === 'approved').length;
    const officialAnswersCount = enrichedQuestions.reduce(
      (sum: number, q: any) => sum + q.answers.filter((a: any) => a.is_official).length,
      0
    );

    return NextResponse.json({
      questions: enrichedQuestions,
      stats: {
        totalQuestions,
        unansweredCount,
        approvedCount,
        officialAnswersCount,
      },
    });
  } catch (err: any) {
    console.error('API Error in GET /api/admin/qa:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product_id, user_id, question, status = 'approved' } = body;

    if (!product_id || !user_id || !question || question.trim() === '') {
      return NextResponse.json(
        { error: 'Product, User, and Question text are required.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    const { data: newQuestion, error: insertError } = await supabase
      .from('product_questions')
      .insert([
        {
          store_id: STORE_ID,
          product_id,
          user_id,
          question: question.trim(),
          status,
          created_at: new Date().toISOString(),
        },
      ])
      .select('*')
      .single();

    if (insertError) {
      console.error('Error inserting question:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: 'Question created successfully', question: newQuestion },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('API Error in POST /api/admin/qa:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
