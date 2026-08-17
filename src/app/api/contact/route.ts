import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';
import { sendEmail } from '@/lib/email/mailer';
import { getInquiryAdminNotificationTemplate, getInquiryAcknowledgmentTemplate } from '@/lib/email/templates';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ inquiries: [] });
    }

    // 1. Try dedicated customer_inquiries table first
    try {
      const { data: dedicatedData, error: dedicatedErr } = await supabase
        .from('customer_inquiries')
        .select('*')
        .eq('store_id', STORE_ID)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!dedicatedErr && dedicatedData && dedicatedData.length > 0) {
        const formatted = dedicatedData.map((d: any) => ({
          id: d.id,
          inquiry_ref: d.inquiry_ref,
          subject: d.subject,
          created_at: d.created_at,
          metadata: {
            inquiry_ref: d.inquiry_ref,
            subject: d.subject,
            message: d.message,
            status: d.status || 'In Review',
            concierge_notes: d.reply || 'Under review by Kannauj Concierge Desk.',
          },
        }));
        return NextResponse.json({ inquiries: formatted });
      }
    } catch (e) {
      // customer_inquiries table may not exist yet, fallback to notification_logs
    }

    // 2. Fallback to notification_logs table from core schema
    const { data: logs, error } = await supabase
      .from('notification_logs')
      .select('*')
      .eq('store_id', STORE_ID)
      .eq('notification_type', 'personal_communication')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ inquiries: [] });
    }

    // Filter by user_id in metadata or top-level
    const userInquiries = (logs || []).filter((l: any) => {
      if (l.metadata && l.metadata.user_id === userId) return true;
      if (l.user_id === userId) return true;
      return false;
    });

    return NextResponse.json({ inquiries: userInquiries });
  } catch (err: any) {
    console.error('API Error in GET /api/contact:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone = '',
      subject,
      message,
      user_id = null,
      is_guest = false,
    } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, Email, and Message are required.' },
        { status: 400 }
      );
    }

    const recipientEmail = email.trim();
    const customerName = name.trim();
    const customerPhone = phone.trim();
    const inquirySubject = subject || 'General Inquiry';
    const inquiryMessage = message.trim();
    const storeEmail = 'shikhatandon2009@gmail.com';

    const supabase = getSupabaseServerClient();
    const inquiryRef = `INQ-${Date.now().toString().slice(-6)}`;
    const isRecorded = !is_guest && Boolean(user_id);

    let savedRecord = null;

    // 1. Record inquiry in customer_inquiries (for both Guest and Account inquiries)
    try {
      const { data, error } = await supabase
        .from('customer_inquiries')
        .insert([
          {
            store_id: STORE_ID,
            user_id: user_id || null,
            inquiry_ref: inquiryRef,
            name: customerName,
            email: recipientEmail,
            phone: customerPhone,
            subject: inquirySubject,
            message: inquiryMessage,
            status: 'In Review',
            reply: 'Assigned to Kannauj Master Distiller concierge desk.',
            created_at: new Date().toISOString(),
          },
        ])
        .select('*')
        .maybeSingle();

      if (!error && data) {
        savedRecord = data;
      }
    } catch (e) {}

    // 2. Also log in notification_logs table for CRM fallback
    try {
      const { data } = await supabase
        .from('notification_logs')
        .insert([
          {
            store_id: STORE_ID,
            recipient: recipientEmail,
            subject: `[${inquiryRef}] ${inquirySubject}: ${customerName}`,
            notification_type: 'personal_communication',
            status: 'sent',
            provider_response: 'Customer inquiry recorded in Maison Concierge CRM',
            metadata: {
              inquiry_ref: inquiryRef,
              user_id: user_id || null,
              name: customerName,
              email: recipientEmail,
              phone: customerPhone,
              subject: inquirySubject,
              message: inquiryMessage,
              status: 'In Review',
              concierge_notes: 'Assigned to Kannauj Master Distiller concierge desk.',
              submitted_at: new Date().toISOString(),
            },
            created_at: new Date().toISOString(),
          },
        ])
        .select('*')
        .maybeSingle();

      if (!savedRecord && data) savedRecord = data;
    } catch (e) {}

    // 3. Dispatch Live Email Notifications (Store Admin alert + Customer acknowledgment)
    try {
      // Alert to Store Admin
      const adminTpl = getInquiryAdminNotificationTemplate(
        customerName,
        recipientEmail,
        customerPhone,
        inquirySubject,
        inquiryMessage,
        inquiryRef
      );
      await sendEmail({
        to: storeEmail,
        subject: adminTpl.subject,
        html: adminTpl.html,
        type: 'admin_inquiry_alert',
      });

      // Acknowledgment Receipt to Customer (Guest or Account user)
      const customerTpl = getInquiryAcknowledgmentTemplate(
        customerName,
        inquirySubject,
        inquiryRef
      );
      await sendEmail({
        to: recipientEmail,
        subject: customerTpl.subject,
        html: customerTpl.html,
        type: 'inquiry_acknowledgment',
      });
    } catch (emailErr) {
      console.error('[Contact] Email dispatch error:', emailErr);
    }

    return NextResponse.json({
      success: true,
      inquiry_ref: inquiryRef,
      is_recorded: isRecorded,
      message: isRecorded
        ? 'Your communication has been dispatched to our concierge and recorded in your account.'
        : 'Your message has been sent successfully to the concierge desk.',
      inquiry: savedRecord,
    });
  } catch (err: any) {
    console.error('API Error in POST /api/contact:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
