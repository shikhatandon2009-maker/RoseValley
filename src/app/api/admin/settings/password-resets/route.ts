import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search')?.trim();
    const status = searchParams.get('status');

    let query = supabase
      .from('password_resets')
      .select('*')
      .eq('store_id', STORE_ID)
      .order('created_at', { ascending: false });

    if (status === 'used') {
      query = query.eq('used', true);
    } else if (status === 'active') {
      query = query.eq('used', false).gt('expires_at', new Date().toISOString());
    } else if (status === 'expired') {
      query = query.eq('used', false).lte('expires_at', new Date().toISOString());
    }

    const { data: resets, error } = await query;

    if (error) {
      console.error('Error fetching password resets:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let filtered = resets || [];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((r: any) => r.email?.toLowerCase().includes(searchLower));
    }

    const now = new Date();
    const totalResets = filtered.length;
    const usedTokensCount = filtered.filter((r: any) => r.used).length;
    const activeTokensCount = filtered.filter(
      (r: any) => !r.used && new Date(r.expires_at) > now
    ).length;
    const expiredTokensCount = filtered.filter(
      (r: any) => !r.used && new Date(r.expires_at) <= now
    ).length;

    return NextResponse.json({
      resets: filtered,
      stats: {
        totalResets,
        activeTokensCount,
        usedTokensCount,
        expiredTokensCount,
      },
    });
  } catch (err: any) {
    console.error('API Error in GET /api/admin/settings/password-resets:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || email.trim() === '') {
      return NextResponse.json({ error: 'User email is required.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const supabase = getSupabaseServerClient();

    // Verify user exists
    const { data: user } = await supabase
      .from('users')
      .select('id, full_name')
      .eq('store_id', STORE_ID)
      .eq('email', cleanEmail)
      .maybeSingle();

    if (!user) {
      return NextResponse.json(
        { error: `No registered account found for email "${cleanEmail}".` },
        { status: 404 }
      );
    }

    // Generate token valid for 24 hours
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { data: newReset, error: insertError } = await supabase
      .from('password_resets')
      .insert([
        {
          store_id: STORE_ID,
          email: cleanEmail,
          token,
          expires_at: expiresAt,
          used: false,
          created_at: new Date().toISOString(),
        },
      ])
      .select('*')
      .single();

    if (insertError) {
      console.error('Error inserting password reset token:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        message: 'Password reset token generated successfully',
        reset: newReset,
        reset_link: `/reset-password?token=${token}&email=${encodeURIComponent(cleanEmail)}`,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('API Error in POST /api/admin/settings/password-resets:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Reset token ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    const { error } = await supabase
      .from('password_resets')
      .delete()
      .eq('store_id', STORE_ID)
      .eq('id', id);

    if (error) {
      console.error('Error deleting reset token:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Reset token revoked successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
