import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search')?.trim();
    const status = searchParams.get('status');
    const type = searchParams.get('notification_type');

    let query = supabase
      .from('notification_logs')
      .select('*')
      .eq('store_id', STORE_ID)
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (type && type !== 'all') {
      query = query.eq('notification_type', type);
    }

    const { data: logs, error } = await query;

    if (error) {
      console.error('Error fetching notification logs:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let filtered = logs || [];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (l: any) =>
          l.recipient?.toLowerCase().includes(searchLower) ||
          l.subject?.toLowerCase().includes(searchLower) ||
          l.notification_type?.toLowerCase().includes(searchLower)
      );
    }

    const totalSent = filtered.length;
    const successfulSent = filtered.filter((l: any) => l.status === 'sent').length;
    const failedSent = filtered.filter((l: any) => l.status === 'failed').length;
    const deliveryRate = totalSent > 0 ? ((successfulSent / totalSent) * 100).toFixed(1) : '100.0';

    return NextResponse.json({
      logs: filtered,
      stats: {
        totalSent,
        successfulSent,
        failedSent,
        deliveryRate,
      },
    });
  } catch (err: any) {
    console.error('API Error in GET /api/admin/notifications/logs:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      recipient,
      subject,
      notification_type = 'order_confirmation',
      status = 'sent',
      provider_response = 'SMTP 250 2.0.0 OK Message accepted for delivery',
    } = body;

    if (!recipient || !subject) {
      return NextResponse.json(
        { error: 'Recipient email and Subject line are required.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    const { data: newLog, error: insertError } = await supabase
      .from('notification_logs')
      .insert([
        {
          store_id: STORE_ID,
          recipient: recipient.trim().toLowerCase(),
          subject: subject.trim(),
          notification_type: notification_type.trim(),
          status,
          provider_response: typeof provider_response === 'string' ? provider_response : JSON.stringify(provider_response),
          created_at: new Date().toISOString(),
        },
      ])
      .select('*')
      .single();

    if (insertError) {
      console.error('Error inserting notification log:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: 'Notification log created successfully', log: newLog },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('API Error in POST /api/admin/notifications/logs:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Notification log ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    const { error } = await supabase
      .from('notification_logs')
      .delete()
      .eq('store_id', STORE_ID)
      .eq('id', id);

    if (error) {
      console.error('Error deleting notification log:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Notification log deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
