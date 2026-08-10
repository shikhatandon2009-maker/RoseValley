import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim();

    const { data: knowledge, error } = await supabase
      .from('chatbot_knowledge')
      .select('*')
      .eq('store_id', STORE_ID)
      .order('topic', { ascending: true });

    if (error) {
      console.error('Error fetching chatbot knowledge:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let filtered = knowledge || [];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (k: any) =>
          k.topic?.toLowerCase().includes(searchLower) ||
          k.content?.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({ knowledge: filtered });
  } catch (err: any) {
    console.error('API Error in GET /api/admin/chat/knowledge:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, content } = body;

    if (!topic || !topic.trim() || !content || !content.trim()) {
      return NextResponse.json(
        { error: 'Knowledge Topic title and Content instructions are required.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    const { data: newTopic, error: insertError } = await supabase
      .from('chatbot_knowledge')
      .insert([
        {
          store_id: STORE_ID,
          topic: topic.trim(),
          content: content.trim(),
          created_at: new Date().toISOString(),
        },
      ])
      .select('*')
      .single();

    if (insertError) {
      console.error('Error inserting chatbot knowledge:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: 'Chatbot knowledge topic added successfully', knowledge: newTopic },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('API Error in POST /api/admin/chat/knowledge:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Knowledge ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { topic, content } = body;

    const supabase = getSupabaseServerClient();

    const updates: Record<string, any> = {};
    if (topic !== undefined) updates.topic = topic.trim();
    if (content !== undefined) updates.content = content.trim();

    const { data: updatedTopic, error } = await supabase
      .from('chatbot_knowledge')
      .update(updates)
      .eq('store_id', STORE_ID)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating chatbot knowledge:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Chatbot knowledge topic updated successfully',
      knowledge: updatedTopic,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Knowledge ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    const { error } = await supabase
      .from('chatbot_knowledge')
      .delete()
      .eq('store_id', STORE_ID)
      .eq('id', id);

    if (error) {
      console.error('Error deleting chatbot knowledge:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Chatbot knowledge topic deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
