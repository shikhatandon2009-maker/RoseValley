import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question_id, user_id, answer, is_official = true } = body;

    if (!question_id || !user_id || !answer || answer.trim() === '') {
      return NextResponse.json(
        { error: 'Question ID, User ID, and Answer text are required.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    const { data: newAnswer, error: insertError } = await supabase
      .from('product_answers')
      .insert([
        {
          store_id: STORE_ID,
          question_id,
          user_id,
          answer: answer.trim(),
          is_official: Boolean(is_official),
          created_at: new Date().toISOString(),
        },
      ])
      .select('*, users(full_name, email)')
      .single();

    if (insertError) {
      console.error('Error inserting answer:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Automatically mark question as approved if an official answer is posted
    if (is_official) {
      await supabase
        .from('product_questions')
        .update({ status: 'approved' })
        .eq('store_id', STORE_ID)
        .eq('id', question_id);
    }

    return NextResponse.json(
      { message: 'Answer posted successfully', answer: newAnswer },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Answer ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    const { error } = await supabase
      .from('product_answers')
      .delete()
      .eq('store_id', STORE_ID)
      .eq('id', id);

    if (error) {
      console.error('Error deleting answer:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Answer deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
