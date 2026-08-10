import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search')?.trim();
    const filter = searchParams.get('filter'); // 'all', 'broadcast', 'customer'
    const readState = searchParams.get('read_state'); // 'all', 'unread', 'read'

    let query = supabase
      .from('notifications')
      .select('*, users(id, full_name, email)')
      .eq('store_id', STORE_ID)
      .order('created_at', { ascending: false });

    if (filter === 'broadcast') {
      query = query.is('recipient_id', null);
    } else if (filter === 'customer') {
      query = query.not('recipient_id', 'is', null);
    }

    if (readState === 'unread') {
      query = query.is('read_at', null);
    } else if (readState === 'read') {
      query = query.not('read_at', 'is', null);
    }

    const { data: notifications, error } = await query;

    if (error) {
      console.error('Error fetching in-app notifications:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let filtered = notifications || [];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (n: any) =>
          n.title?.toLowerCase().includes(searchLower) ||
          n.message?.toLowerCase().includes(searchLower) ||
          n.users?.full_name?.toLowerCase().includes(searchLower) ||
          n.users?.email?.toLowerCase().includes(searchLower)
      );
    }

    const totalNotifications = filtered.length;
    const broadcastsCount = filtered.filter((n: any) => !n.recipient_id).length;
    const customerSpecificCount = filtered.filter((n: any) => Boolean(n.recipient_id)).length;
    const unreadCount = filtered.filter((n: any) => !n.read_at).length;

    return NextResponse.json({
      notifications: filtered,
      stats: {
        totalNotifications,
        broadcastsCount,
        customerSpecificCount,
        unreadCount,
      },
    });
  } catch (err: any) {
    console.error('API Error in GET /api/admin/notifications:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      recipient_id = null, // null for broadcast to all customers
      type = 'system_msg',
      title,
      message,
      link = '',
    } = body;

    if (!title || !title.trim() || !message || !message.trim()) {
      return NextResponse.json(
        { error: 'Notification title and message body are required.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    const { data: newNotification, error: insertError } = await supabase
      .from('notifications')
      .insert([
        {
          store_id: STORE_ID,
          recipient_id: recipient_id || null,
          type: type.trim(),
          title: title.trim(),
          message: message.trim(),
          link: link ? link.trim() : null,
          created_at: new Date().toISOString(),
        },
      ])
      .select('*, users(full_name, email)')
      .single();

    if (insertError) {
      console.error('Error inserting notification:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: 'In-app notification sent successfully', notification: newNotification },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('API Error in POST /api/admin/notifications:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    const { data: updatedNotification, error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('store_id', STORE_ID)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error marking notification as read:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Notification marked as read',
      notification: updatedNotification,
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
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('store_id', STORE_ID)
      .eq('id', id);

    if (error) {
      console.error('Error deleting notification:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Notification deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
