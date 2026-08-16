import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { verifyRazorpaySignature, verifyRazorpayWebhookSignature } from '@/lib/razorpay/razorpay-client';
import { sendEmail } from '@/lib/email/mailer';
import { getOrderConfirmationEmailTemplate } from '@/lib/email/templates';
import { STORE_ID } from '@/lib/constants';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      orderNumber,
      items,
      shippingAddress,
      guestEmail,
      userId,
      totalAmount,
      taxAmount,
      taxRate = 18.00,
      taxableAmount,
      gstin,
      paymentMethod = 'razorpay',
      currency = 'INR',
      isMock = false,
    } = body;

    // Verify signature if not in mock development mode
    if (!isMock) {
      const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid payment signature verification failed.' }, { status: 400 });
      }
    }

    const supabase = getSupabaseServerClient();

    const businessName = shippingAddress?.companyName || shippingAddress?.company_name || shippingAddress?.business_name || null;

    const enhancedShippingAddress = {
      ...(typeof shippingAddress === 'object' && shippingAddress ? shippingAddress : {}),
      gstin: gstin || shippingAddress?.gstin || null,
      company_name: businessName,
      business_name: businessName,
      tax_amount: taxAmount || 0,
      tax_rate: taxRate || 18.00,
      taxable_amount: taxableAmount || totalAmount,
      payment_method: paymentMethod,
    };

    // 1. Create order record in database with store_id
    const { data: newOrder, error: orderErr } = await supabase
      .from('orders')
      .insert({
        store_id: STORE_ID,
        order_number: orderNumber || `RVK-${Date.now()}`,
        user_id: userId || null,
        guest_email: guestEmail || null,
        status: 'paid',
        payment_status: 'paid',
        total_amount: totalAmount,
        currency,
        shipping_address: enhancedShippingAddress,
        gstin: (gstin || shippingAddress?.gstin || '').trim().toUpperCase() || null,
        company_name: businessName,
        business_name: businessName,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
      })
      .select()
      .single();

    if (orderErr) {
      console.error('[Order Error]:', orderErr);
      return NextResponse.json({ error: orderErr.message }, { status: 500 });
    }

    // 2. Create order items
    if (items && items.length > 0) {
      const orderItemRecords = items.map((item: any) => ({
        store_id: STORE_ID,
        order_id: newOrder.id,
        product_id: item.productId || null,
        variant_id: item.variantId || null,
        quantity: item.quantity,
        price: item.price,
        product_name: item.name,
        image_url: item.image,
      }));
      await supabase.from('order_items').insert(orderItemRecords);
    }

    // 3. Send Order Confirmation Email (Logged into notification_logs)
    const recipientEmail = guestEmail || shippingAddress?.email;
    if (recipientEmail) {
      const emailTpl = getOrderConfirmationEmailTemplate(
        newOrder.order_number,
        `₹${totalAmount}`,
        items || [],
        shippingAddress?.fullName || 'Valued Client'
      );
      await sendEmail({
        to: recipientEmail,
        subject: emailTpl.subject,
        html: emailTpl.html,
        type: 'order_confirmation',
      });
    }

    // 4. Create In-App Admin Notification
    await supabase.from('notifications').insert({
      store_id: STORE_ID,
      recipient_id: null, // Admin broadcast
      type: 'order',
      title: `New Paid Order #${newOrder.order_number}`,
      message: `Received order worth ₹${totalAmount} from ${shippingAddress?.fullName || recipientEmail}`,
      link: `/admin/orders`,
    });

    return NextResponse.json({
      success: true,
      orderId: newOrder.id,
      orderNumber: newOrder.order_number,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
