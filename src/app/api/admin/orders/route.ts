import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';

function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-5);
  const random = Math.floor(100 + Math.random() * 900);
  return `ORD-${timestamp}${random}`;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search')?.trim();
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('payment_status');

    let query = supabase
      .from('orders')
      .select('*, users(full_name, email, phone)')
      .eq('store_id', STORE_ID)
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (paymentStatus && paymentStatus !== 'all') {
      query = query.eq('payment_status', paymentStatus);
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let filteredOrders = orders || [];

    if (search) {
      const searchLower = search.toLowerCase();
      filteredOrders = filteredOrders.filter(
        (o: any) =>
          o.order_number?.toLowerCase().includes(searchLower) ||
          o.guest_email?.toLowerCase().includes(searchLower) ||
          o.tracking_number?.toLowerCase().includes(searchLower) ||
          o.users?.full_name?.toLowerCase().includes(searchLower) ||
          o.users?.email?.toLowerCase().includes(searchLower)
      );
    }

    // Fetch order_items for line-item details
    const orderIds = filteredOrders.map((o: any) => o.id);
    let orderItemsMap = new Map<string, any[]>();

    if (orderIds.length > 0) {
      const { data: items } = await supabase
        .from('order_items')
        .select('*')
        .eq('store_id', STORE_ID)
        .in('order_id', orderIds);

      (items || []).forEach((item: any) => {
        const existing = orderItemsMap.get(item.order_id) || [];
        existing.push(item);
        orderItemsMap.set(item.order_id, existing);
      });
    }

    const enrichedOrders = filteredOrders.map((o: any) => ({
      ...o,
      items: orderItemsMap.get(o.id) || [],
    }));

    // Aggregate statistics
    const totalOrders = enrichedOrders.length;
    const totalRevenue = enrichedOrders
      .filter((o: any) => o.payment_status === 'paid' || o.status === 'paid' || o.status === 'shipped' || o.status === 'delivered')
      .reduce((sum: number, o: any) => sum + (Number(o.total_amount) || 0), 0);

    const pendingCount = enrichedOrders.filter((o: any) => o.status === 'pending').length;
    const shippedCount = enrichedOrders.filter((o: any) => o.status === 'shipped').length;
    const deliveredCount = enrichedOrders.filter((o: any) => o.status === 'delivered').length;
    const cancelledCount = enrichedOrders.filter((o: any) => o.status === 'cancelled').length;

    return NextResponse.json({
      orders: enrichedOrders,
      stats: {
        totalOrders,
        totalRevenue,
        pendingCount,
        shippedCount,
        deliveredCount,
        cancelledCount,
      },
    });
  } catch (err: any) {
    console.error('API Error in GET /api/admin/orders:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      user_id = null,
      guest_email = '',
      status = 'pending',
      total_amount = 0,
      currency = 'INR',
      shipping_address = {},
      payment_status = 'unpaid',
      razorpay_order_id = '',
      razorpay_payment_id = '',
      courier_name = '',
      tracking_number = '',
      items = [],
    } = body;

    const supabase = getSupabaseServerClient();
    const order_number = body.order_number || generateOrderNumber();

    const { data: newOrder, error: insertError } = await supabase
      .from('orders')
      .insert([
        {
          store_id: STORE_ID,
          order_number,
          user_id,
          guest_email: guest_email.trim(),
          status,
          total_amount: Number(total_amount) || 0,
          currency,
          shipping_address: shipping_address || {},
          payment_status,
          razorpay_order_id: razorpay_order_id.trim(),
          razorpay_payment_id: razorpay_payment_id.trim(),
          courier_name: courier_name.trim(),
          tracking_number: tracking_number.trim(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select('*')
      .single();

    if (insertError) {
      console.error('Error inserting order:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Insert order items
    if (Array.isArray(items) && items.length > 0) {
      const itemRows = items.map((it: any) => ({
        store_id: STORE_ID,
        order_id: newOrder.id,
        product_id: it.product_id || null,
        variant_id: it.variant_id || null,
        quantity: Number(it.quantity) || 1,
        price: Number(it.price) || 0,
        product_name: it.product_name || 'Fragrance Item',
        image_url: it.image_url || '',
        created_at: new Date().toISOString(),
      }));

      await supabase.from('order_items').insert(itemRows);
    }

    return NextResponse.json(
      { message: 'Order created successfully', order: newOrder },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('API Error in POST /api/admin/orders:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
