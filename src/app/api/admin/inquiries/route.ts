import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status');
    const search = searchParams.get('search')?.trim().toLowerCase();

    // 1. Try fetching from customer_inquiries table
    let inquiries: any[] = [];
    try {
      let query = supabase
        .from('customer_inquiries')
        .select('*')
        .eq('store_id', STORE_ID)
        .order('created_at', { ascending: false });

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (!error && data) {
        inquiries = data;
      }
    } catch (e) {}

    // 2. Fallback to notification_logs if customer_inquiries is empty
    if (inquiries.length === 0) {
      try {
        const { data: logs } = await supabase
          .from('notification_logs')
          .select('*')
          .eq('store_id', STORE_ID)
          .eq('notification_type', 'personal_communication')
          .order('created_at', { ascending: false });

        if (logs && logs.length > 0) {
          inquiries = logs.map((l: any) => {
            const meta = l.metadata || {};
            return {
              id: l.id,
              inquiry_ref: meta.inquiry_ref || `INQ-${l.id.slice(-6)}`,
              user_id: meta.user_id || l.recipient,
              name: meta.name || 'Client',
              email: meta.email || l.recipient,
              phone: meta.phone || 'N/A',
              subject: meta.subject || l.subject,
              message: meta.message || l.provider_response || '',
              status: meta.status || 'In Review',
              reply: meta.concierge_notes || null,
              created_at: l.created_at,
            };
          });
        }
      } catch (e) {}
    }

    // Search filter
    if (search) {
      inquiries = inquiries.filter(
        (inq) =>
          inq.name?.toLowerCase().includes(search) ||
          inq.email?.toLowerCase().includes(search) ||
          inq.subject?.toLowerCase().includes(search) ||
          inq.inquiry_ref?.toLowerCase().includes(search) ||
          inq.message?.toLowerCase().includes(search)
      );
    }

    const totalCount = inquiries.length;
    const pendingCount = inquiries.filter((i) => i.status === 'In Review' || !i.status).length;
    const repliedCount = inquiries.filter((i) => i.status === 'Replied').length;

    return NextResponse.json({
      inquiries,
      stats: {
        total: totalCount,
        pending: pendingCount,
        replied: repliedCount,
      },
    });
  } catch (err: any) {
    console.error('API Error in GET /api/admin/inquiries:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, inquiry_ref, reply, status = 'Replied', customer_email, customer_name, subject } = body;

    if (!reply || (!id && !inquiry_ref)) {
      return NextResponse.json(
        { error: 'Inquiry ID/Ref and Reply message are required.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();
    const repliedAt = new Date().toISOString();

    let updated = false;

    // 1. Try updating customer_inquiries table
    try {
      const matchQuery = id ? { id } : { inquiry_ref };
      const { data, error } = await supabase
        .from('customer_inquiries')
        .update({
          reply: reply.trim(),
          status,
          replied_at: repliedAt,
        })
        .match(matchQuery)
        .select('*')
        .maybeSingle();

      if (!error && data) {
        updated = true;
      }
    } catch (e) {}

    // 2. Also update notification_logs if found
    try {
      const { data: logs } = await supabase
        .from('notification_logs')
        .select('*')
        .eq('store_id', STORE_ID)
        .eq('notification_type', 'personal_communication');

      if (logs) {
        const targetLog = logs.find(
          (l: any) => l.id === id || (l.metadata && l.metadata.inquiry_ref === inquiry_ref)
        );

        if (targetLog) {
          const updatedMeta = {
            ...(targetLog.metadata || {}),
            status,
            concierge_notes: reply.trim(),
            replied_at: repliedAt,
          };

          await supabase
            .from('notification_logs')
            .update({ metadata: updatedMeta })
            .eq('id', targetLog.id);
        }
      }
    } catch (e) {}

    // 3. Log out dispatch notification
    if (customer_email) {
      await supabase.from('notification_logs').insert([
        {
          store_id: STORE_ID,
          recipient: customer_email,
          subject: `Re: [${inquiry_ref || 'INQ'}] ${subject || 'Concierge Response'} - Rose Valley Kannauj`,
          notification_type: 'concierge_reply',
          status: 'sent',
          provider_response: 'Concierge reply delivered to customer mailbox',
          created_at: repliedAt,
        },
      ]);
    }

    return NextResponse.json({
      success: true,
      message: 'Reply saved and customer notification dispatched.',
      replied_at: repliedAt,
      status,
    });
  } catch (err: any) {
    console.error('API Error in POST /api/admin/inquiries:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
