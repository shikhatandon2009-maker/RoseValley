import nodemailer from 'nodemailer';
import { getSupabaseServerClient } from '../supabase/server';
import { STORE_ID } from '../constants';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  type: string; // e.g. 'welcome', 'order_confirmation', 'order_dispatched', 'tax_invoice', 'admin_inquiry_alert', 'inquiry_acknowledgment', 'concierge_reply'
}

export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const smtpUser = (process.env.SMTP_USER || 'shikhatandon2009@gmail.com').trim();
  const rawPass = process.env.SMTP_PASS || 'rzcp espy bbdb ktbm';
  const smtpPass = rawPass.trim().replace(/['"]/g, '');
  const emailFrom = process.env.EMAIL_FROM || smtpUser;
  const emailFromName = process.env.EMAIL_FROM_NAME || 'Rose Valley Kannauj - Luxury Perfumes';

  let status: 'sent' | 'failed' = 'sent';
  let providerResponse = '';
  let messageId = '';

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const info = await transporter.sendMail({
      from: `"${emailFromName}" <${emailFrom}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    messageId = info.messageId;
    providerResponse = info.response || 'SMTP 250 2.0.0 OK Message accepted for delivery';
    status = 'sent';
    console.log(`[Mailer SUCCESS] Email "${options.subject}" sent to ${options.to}. MsgId: ${messageId}`);
  } catch (err: any) {
    status = 'failed';
    providerResponse = err.message || 'Unknown SMTP error';
    console.error(`[Mailer FAILED] Email "${options.subject}" to ${options.to} error:`, err);
  }

  // Record into notification_logs table (Requirement 7)
  try {
    const supabase = getSupabaseServerClient();
    await supabase.from('notification_logs').insert({
      store_id: STORE_ID,
      recipient: options.to,
      subject: options.subject,
      notification_type: options.type,
      status: status,
      provider_response: providerResponse,
    });
  } catch (logErr) {
    console.error('[Mailer] Failed to write notification_log:', logErr);
  }

  return {
    success: status === 'sent',
    messageId,
    error: status === 'failed' ? providerResponse : undefined,
  };
}
