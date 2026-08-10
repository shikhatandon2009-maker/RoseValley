import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { hashPassword } from '@/lib/auth/password';
import { signToken } from '@/lib/auth/jwt';
import { sendEmail } from '@/lib/email/mailer';
import { getWelcomeEmailTemplate } from '@/lib/email/templates';
import { generateRandomPassword } from '@/lib/utils';
import { STORE_ID } from '@/lib/constants';

export async function POST(request: Request) {
  try {
    const { email, password, fullName, phone, generatePassword } = await request.json();

    if (!email || !fullName) {
      return NextResponse.json({ error: 'Email and Full Name are required.' }, { status: 400 });
    }

    let finalPassword = password;
    let wasGenerated = false;

    if (generatePassword || !password) {
      finalPassword = generateRandomPassword(14);
      wasGenerated = true;
    }

    const hashedPassword = await hashPassword(finalPassword);
    const supabase = getSupabaseServerClient();

    // Check existing user for this store_id
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('store_id', STORE_ID)
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 400 });
    }

    // Insert user with store_id
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        store_id: STORE_ID,
        email,
        password_hash: hashedPassword,
        full_name: fullName,
        phone,
        role: 'customer',
        must_change_password: wasGenerated,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Send Welcome Email (Logged to notification_logs)
    const emailTpl = getWelcomeEmailTemplate(fullName, wasGenerated ? finalPassword : undefined);
    await sendEmail({
      to: email,
      subject: emailTpl.subject,
      html: emailTpl.html,
      type: 'welcome',
    });

    // Create session JWT cookie
    const token = signToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      storeId: STORE_ID,
    });

    const response = NextResponse.json({
      success: true,
      user: { id: newUser.id, email: newUser.email, fullName: newUser.full_name, role: newUser.role },
      generatedPassword: wasGenerated ? finalPassword : undefined,
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
