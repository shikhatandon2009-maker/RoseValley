import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseServerClient();
    const { id } = params;

    const { data: question, error } = await supabase
      .from('product_questions')
      .select('*, products(name, images, slug), users(full_name, email)')
      .eq('store_id', STORE_ID)
      .eq('id', id)
      .single();

    if (error || !question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const { data: answers } = await supabase
      .from('product_answers')
      .select('*, users(full_name, email)')
      .eq('store_id', STORE_ID)
      .eq('question_id', id)
      .order('created_at', { ascending: true });

    return NextResponse.json({
      question: {
        ...question,
        answers: answers || [],
      },
    });
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

    const { question, status } = body;

    const updates: Record<string, any> = {};

    if (question !== undefined) updates.question = question.trim();
    if (status !== undefined) updates.status = status;

    const { data: updatedQuestion, error } = await supabase
      .from('product_questions')
      .update(updates)
      .eq('store_id', STORE_ID)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating question:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Question updated successfully', question: updatedQuestion });
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
      .from('product_questions')
      .delete()
      .eq('store_id', STORE_ID)
      .eq('id', id);

    if (error) {
      console.error('Error deleting question:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Question deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
