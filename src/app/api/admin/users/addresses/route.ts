import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const { searchParams } = new URL(request.url);

    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ addresses: [] });
    }

    const { data: addresses, error } = await supabase
      .from('addresses')
      .select('*, users(full_name, email)')
      .eq('store_id', STORE_ID)
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching addresses:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ addresses: addresses || [] });
  } catch (err: any) {
    console.error('API Error in GET /api/admin/users/addresses:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      user_id,
      full_name,
      company_name = '',
      business_name = '',
      gstin = '',
      street_address,
      city,
      state,
      postal_code,
      country = 'India',
      phone,
      is_default = false,
    } = body;

    if (!user_id || !full_name || !street_address || !city || !state || !postal_code || !phone) {
      return NextResponse.json(
        { error: 'User ID, Full Name, Street Address, City, State, Postal Code, and Phone are required.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    // If set as default, unset other default addresses for this user
    if (is_default) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('store_id', STORE_ID)
        .eq('user_id', user_id);
    }

    const { data: newAddress, error: insertError } = await supabase
      .from('addresses')
      .insert([
        {
          store_id: STORE_ID,
          user_id,
          full_name: full_name.trim(),
          company_name: (company_name || business_name || '').trim(),
          gstin: (gstin || '').trim().toUpperCase(),
          street_address: street_address.trim(),
          city: city.trim(),
          state: state.trim(),
          postal_code: postal_code.trim(),
          country: country.trim(),
          phone: phone.trim(),
          is_default: Boolean(is_default),
          created_at: new Date().toISOString(),
        },
      ])
      .select('*')
      .single();

    if (insertError) {
      console.error('Error inserting address:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: 'Customer address added successfully', address: newAddress },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('API Error in POST /api/admin/users/addresses:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Address ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const {
      full_name,
      company_name,
      business_name,
      gstin,
      street_address,
      city,
      state,
      postal_code,
      country,
      phone,
      is_default,
    } = body;

    const supabase = getSupabaseServerClient();

    // Find user_id first
    const { data: existing } = await supabase
      .from('addresses')
      .select('user_id')
      .eq('store_id', STORE_ID)
      .eq('id', id)
      .single();

    if (is_default && existing?.user_id) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('store_id', STORE_ID)
        .eq('user_id', existing.user_id);
    }

    const updates: Record<string, any> = {};
    if (full_name !== undefined) updates.full_name = full_name.trim();
    if (company_name !== undefined || business_name !== undefined) {
      updates.company_name = (company_name || business_name || '').trim();
    }
    if (gstin !== undefined) updates.gstin = (gstin || '').trim().toUpperCase();
    if (street_address !== undefined) updates.street_address = street_address.trim();
    if (city !== undefined) updates.city = city.trim();
    if (state !== undefined) updates.state = state.trim();
    if (postal_code !== undefined) updates.postal_code = postal_code.trim();
    if (country !== undefined) updates.country = country.trim();
    if (phone !== undefined) updates.phone = phone.trim();
    if (is_default !== undefined) updates.is_default = Boolean(is_default);

    const { data: updatedAddress, error } = await supabase
      .from('addresses')
      .update(updates)
      .eq('store_id', STORE_ID)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating address:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Address updated successfully', address: updatedAddress });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Address ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('store_id', STORE_ID)
      .eq('id', id);

    if (error) {
      console.error('Error deleting address:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Address deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
