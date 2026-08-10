import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    
    const role = searchParams.get('role');
    const search = searchParams.get('search')?.trim();

    let query = supabase
      .from('users')
      .select('id, store_id, email, full_name, role, phone, avatar_url, must_change_password, created_at, updated_at')
      .eq('store_id', STORE_ID)
      .order('created_at', { ascending: false });

    if (role && role !== 'all') {
      query = query.eq('role', role);
    }

    const { data: users, error } = await query;

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let filteredUsers = users || [];

    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = filteredUsers.filter(
        (u: any) =>
          u.full_name?.toLowerCase().includes(searchLower) ||
          u.email?.toLowerCase().includes(searchLower) ||
          u.phone?.toLowerCase().includes(searchLower)
      );
    }

    // Compute aggregate statistics
    const totalUsers = filteredUsers.length;
    const customersCount = filteredUsers.filter((u: any) => u.role === 'customer').length;
    const adminsCount = filteredUsers.filter((u: any) => u.role === 'admin').length;
    const mustChangePasswordCount = filteredUsers.filter((u: any) => u.must_change_password).length;

    return NextResponse.json({
      users: filteredUsers,
      stats: {
        totalUsers,
        customersCount,
        adminsCount,
        mustChangePasswordCount,
      },
    });
  } catch (err: any) {
    console.error('API Error in GET /api/admin/users:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, full_name, role = 'customer', phone = '', avatar_url = '', must_change_password = false } = body;

    if (!email || !password || !full_name) {
      return NextResponse.json(
        { error: 'Email, Password, and Full Name are required.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    // Check if email already exists in this store
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('store_id', STORE_ID)
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email address already exists.' },
        { status: 409 }
      );
    }

    const password_hash = await bcrypt.hash(password, 10);

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          store_id: STORE_ID,
          email: String(email || '').trim().toLowerCase(),
          password_hash,
          full_name: String(full_name || '').trim(),
          role: role || 'customer',
          phone: String(phone || '').trim(),
          avatar_url: String(avatar_url || '').trim(),
          must_change_password: Boolean(must_change_password),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select('id, store_id, email, full_name, role, phone, avatar_url, must_change_password, created_at')
      .single();

    if (insertError) {
      console.error('Error inserting new user:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: 'User created successfully', user: newUser },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('API Error in POST /api/admin/users:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
