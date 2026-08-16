import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const orderId = params.id;
    const body = await request.json();
    const { gstin, company_name } = body;

    if (!gstin || gstin.trim().length < 15) {
      return NextResponse.json({ error: 'A valid 15-character GSTIN is required.' }, { status: 400 });
    }

    const cleanGstin = gstin.trim().toUpperCase();
    const cleanCompany = (company_name || '').trim();

    const supabase = getSupabaseServerClient();

    // Fetch existing order
    const { data: existingOrder, error: fetchErr } = await supabase
      .from('orders')
      .select('*')
      .eq('store_id', STORE_ID)
      .or(`id.eq.${orderId},order_number.eq.${orderId}`)
      .maybeSingle();

    if (fetchErr || !existingOrder) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    const shippingAddr = (existingOrder.shipping_address as any) || {};
    const updatedShippingAddr = {
      ...shippingAddr,
      gstin: cleanGstin,
      companyName: cleanCompany || shippingAddr.companyName || shippingAddr.company_name || 'Enterprise Client',
      company_name: cleanCompany || shippingAddr.companyName || shippingAddr.company_name || 'Enterprise Client',
      business_name: cleanCompany || shippingAddr.companyName || shippingAddr.company_name || 'Enterprise Client',
    };

    // Safely update shipping_address JSONB column
    const { data: updatedOrder, error: updateErr } = await supabase
      .from('orders')
      .update({
        shipping_address: updatedShippingAddr,
      })
      .eq('store_id', STORE_ID)
      .eq('id', existingOrder.id)
      .select('*, order_items(*)')
      .single();

    if (updateErr) {
      console.error('Error updating order GST in shipping_address:', updateErr);
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    const targetUserId = body.user_id || existingOrder.user_id;

    // Also sync to customer's saved address book for future orders
    try {
      if (targetUserId) {
        await supabase
          .from('addresses')
          .update({
            gstin: cleanGstin,
            company_name: cleanCompany || undefined,
          })
          .eq('store_id', STORE_ID)
          .eq('user_id', targetUserId);
      }
      if (cleanCompany) {
        await supabase
          .from('addresses')
          .update({
            gstin: cleanGstin,
            company_name: cleanCompany,
          })
          .eq('store_id', STORE_ID)
          .ilike('company_name', cleanCompany);
      }
    } catch (addrErr) {
      console.warn('Could not sync GST to addresses table:', addrErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Buyer GST details updated successfully on your placed order.',
      order: updatedOrder,
    });
  } catch (err: any) {
    console.error('API Error in update-gst:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
