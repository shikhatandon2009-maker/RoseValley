import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const supabase = getSupabaseServerClient();
    const { data: user } = await supabase
      .from('users')
      .select('id, email, full_name, role')
      .eq('store_id', STORE_ID)
      .eq('id', session.userId)
      .maybeSingle();

    if (!user) {
      return NextResponse.json({
        authenticated: true,
        user: {
          id: session.userId,
          email: session.email,
          full_name: session.email?.split('@')[0] || 'Member',
          role: session.role || 'customer',
        },
      });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ authenticated: false, user: null });
  }
}
