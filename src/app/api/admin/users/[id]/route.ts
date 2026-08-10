import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';

export const dynamic = 'force-dynamic';
import bcrypt from 'bcryptjs';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseServerClient();
    const { id } = params;

    const { data: user, error } = await supabase
      .from('users')
      .select('id, store_id, email, full_name, role, phone, avatar_url, must_change_password, created_at, updated_at')
      .eq('store_id', STORE_ID)
      .eq('id', id)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseServerClient();
    const { id } = params;
    const body = await request.json();

    const { full_name, email, role, phone, avatar_url, must_change_password, password } = body;

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (full_name !== undefined) updates.full_name = String(full_name || '').trim();
    if (email !== undefined) updates.email = String(email || '').trim().toLowerCase();
    if (role !== undefined) updates.role = role;
    if (phone !== undefined) updates.phone = String(phone || '').trim();
    if (avatar_url !== undefined) updates.avatar_url = String(avatar_url || '').trim();
    if (must_change_password !== undefined) updates.must_change_password = Boolean(must_change_password);

    if (password && String(password).trim() !== '') {
      updates.password_hash = await bcrypt.hash(password, 10);
    }

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updates)
      .eq('store_id', STORE_ID)
      .eq('id', id)
      .select('id, store_id, email, full_name, role, phone, avatar_url, must_change_password, updated_at')
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'User updated successfully', user: updatedUser });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseServerClient();
    const { id } = params;

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('store_id', STORE_ID)
      .eq('id', id);

    if (error) {
      console.error('Error deleting user:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
