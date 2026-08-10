import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search')?.trim();
    const sessionId = searchParams.get('session_id');

    let query = supabase
      .from('chat_logs')
      .select('*, users(id, full_name, email)')
      .eq('store_id', STORE_ID)
      .order('created_at', { ascending: true });

    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }

    const { data: logs, error } = await query;

    if (error) {
      console.error('Error fetching chat logs:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let filtered = logs || [];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (l: any) =>
          l.message?.toLowerCase().includes(searchLower) ||
          l.session_id?.toLowerCase().includes(searchLower) ||
          l.users?.full_name?.toLowerCase().includes(searchLower) ||
          l.users?.email?.toLowerCase().includes(searchLower)
      );
    }

    // Group logs into chat sessions
    const sessionsMap = new Map<string, { session_id: string; user?: any; messages: any[]; last_activity: string }>();

    filtered.forEach((msg: any) => {
      const existing: { session_id: string; user?: any; messages: any[]; last_activity: string } = sessionsMap.get(msg.session_id) || {
        session_id: msg.session_id,
        user: msg.users,
        messages: [],
        last_activity: msg.created_at,
      };

      existing.messages.push(msg);
      if (new Date(msg.created_at) > new Date(existing.last_activity)) {
        existing.last_activity = msg.created_at;
      }
      if (msg.users && !existing.user) {
        existing.user = msg.users;
      }
      sessionsMap.set(msg.session_id, existing);
    });

    const sessions = Array.from(sessionsMap.values()).sort(
      (a, b) => new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime()
    );

    const totalSessions = sessions.length;
    const userMessagesCount = filtered.filter((l: any) => l.sender === 'user').length;
    const botResponsesCount = filtered.filter((l: any) => l.sender === 'bot').length;

    return NextResponse.json({
      sessions,
      logs: filtered,
      stats: {
        totalSessions,
        userMessagesCount,
        botResponsesCount,
      },
    });
  } catch (err: any) {
    console.error('API Error in GET /api/admin/chat:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id, user_id = null, message, sender = 'bot' } = body;

    if (!session_id || !message || message.trim() === '') {
      return NextResponse.json(
        { error: 'Session ID and Message text are required.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    const { data: newMsg, error: insertError } = await supabase
      .from('chat_logs')
      .insert([
        {
          store_id: STORE_ID,
          session_id: session_id.trim(),
          user_id: user_id || null,
          message: message.trim(),
          sender,
          created_at: new Date().toISOString(),
        },
      ])
      .select('*, users(full_name, email)')
      .single();

    if (insertError) {
      console.error('Error inserting chat log:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: 'Chat message recorded successfully', log: newMsg },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('API Error in POST /api/admin/chat:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    const { error } = await supabase
      .from('chat_logs')
      .delete()
      .eq('store_id', STORE_ID)
      .eq('session_id', sessionId);

    if (error) {
      console.error('Error deleting chat session:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Chat session transcript deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
