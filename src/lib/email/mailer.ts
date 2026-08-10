import nodemailer from 'nodemailer';
import { getSupabaseServerClient } from '../supabase/server';
import { STORE_ID } from '../constants';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  type: string; // e.g. 'welcome', 'order_confirmation', 'dispatch', 'password_reset'
}

export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  let status: 'sent' | 'failed' = 'sent';
  let providerResponse = '';
  let messageId = '';

  // If SMTP is not fully configured, log gracefully as mock sent in dev mode
  if (!smtpUser || !smtpPass) {
    console.warn('[Mailer] SMTP credentials missing. Mocking email delivery:', options.subject, 'to:', options.to);
    providerResponse = 'Mocked email delivery (SMTP_USER/PASS env variable missing)';
    messageId = `mock-${Date.now()}`;
  } else {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const info = await transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME || "Maison De L'Essence"}" <${process.env.EMAIL_FROM || smtpUser}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      messageId = info.messageId;
      providerResponse = info.response;
    } catch (err: any) {
      status = 'failed';
      providerResponse = err.message || 'Unknown SMTP error';
      console.error('[Mailer] Email dispatch error:', err);
    }
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

  return { success: status === 'sent', messageId, error: status === 'failed' ? providerResponse : undefined };
}
