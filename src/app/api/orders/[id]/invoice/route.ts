import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const orderId = params.id;
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    // Fetch order with its items
    const { data: order, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('store_id', STORE_ID)
      .or(`id.eq.${orderId},order_number.eq.${orderId}`)
      .maybeSingle();

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const totalAmount = Number(order.total_amount || 0);
    const shippingAddr = (order.shipping_address as any) || {};
    const taxRate = Number(shippingAddr?.tax_rate || order.tax_rate || 18.0);
    const taxableAmount = Number(shippingAddr?.taxable_amount || order.taxable_amount || Math.round(totalAmount / (1 + taxRate / 100)));
    const taxAmount = Number(shippingAddr?.tax_amount || order.tax_amount || (totalAmount - taxableAmount));

    const state = (shippingAddr?.state || order.state || '').toLowerCase();
    const isIntraState = state.includes('uttar pradesh') || state === 'up';

    const cgstAmount = isIntraState ? Math.round(taxAmount / 2) : 0;
    const sgstAmount = isIntraState ? (taxAmount - cgstAmount) : 0;
    const igstAmount = !isIntraState ? taxAmount : 0;

    const buyerGstin = (shippingAddr?.gstin || order.gstin || '').trim().toUpperCase();
    const businessName = (shippingAddr?.companyName || shippingAddr?.company_name || order.company_name || order.business_name || '').trim();

    const invoiceNumber = `INV-${order.order_number || order.id.slice(0, 8).toUpperCase()}`;
    const invoiceDate = order.created_at
      ? new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const invoiceData = {
      invoiceNumber,
      invoiceDate,
      orderNumber: order.order_number || order.id,
      paymentMethod: shippingAddr?.payment_method || order.payment_method || (order.razorpay_payment_id ? 'Razorpay' : 'Prepaid'),
      paymentStatus: order.status === 'cancelled' ? 'CANCELLED' : (order.payment_status || (order.status === 'pending' ? 'PENDING' : 'PAID')),
      paymentId: order.razorpay_payment_id || order.payment_id || 'PAY-ONLINE-CONFIRMED',
      seller: {
        companyName: "RoseOil.in Botanical Laboratories",
        address: 'RoseOil.in Estate & Distillation Center, Kannauj, Uttar Pradesh - 209725, India',
        gstin: '09AAACR1234F1Z5',
        pan: 'AAACR1234F',
        state: 'Uttar Pradesh (09)',
        email: 'support@roseoil.in',
        phone: '+91 96486 78599',
        hsnCode: '330129',
      },
      buyer: {
        name: shippingAddr?.fullName || shippingAddr?.full_name || order.user_name || 'Valued Client',
        companyName: businessName || undefined,
        gstin: buyerGstin || undefined,
        email: order.email || shippingAddr?.email || '',
        phone: shippingAddr?.phone || order.phone || '',
        address: `${shippingAddr?.streetAddress || shippingAddr?.street_address || ''}, ${shippingAddr?.city || ''}, ${shippingAddr?.state || ''} - ${shippingAddr?.postalCode || shippingAddr?.postal_code || ''}, ${shippingAddr?.country || 'India'}`,
        state: shippingAddr?.state || 'Uttar Pradesh',
      },
      items: [
        ...(order.order_items || []).map((item: any, idx: number) => {
          const itemQty = Number(item.quantity || 1);
          const itemPrice = Number(item.price || 0);
          const itemTotal = itemPrice * itemQty;
          const itemTaxable = itemTotal;
          const itemTax = Math.round(itemTaxable * (taxRate / 100));

          return {
            slNo: idx + 1,
            productName: item.product_name || item.name || 'Artisanal Pure Hydro-Distilled Perfume',
            variant: item.variantName || 'Pure Attar Batch Extract',
            hsnCode: '330300',
            quantity: itemQty,
            unitPrice: itemPrice,
            taxableAmount: itemTaxable,
            taxRate,
            taxAmount: itemTax,
            totalAmount: itemTotal,
          };
        }),
        ...(Number(shippingAddr?.shipping_fee ?? order.shipping_fee ?? 0) > 0
          ? [
              {
                slNo: (order.order_items?.length || 0) + 1,
                productName: 'Freight & Courier Logistics Dispatch',
                variant: order.courier_name || 'Standard / Express Logistics Dispatch',
                hsnCode: '996812',
                quantity: 1,
                unitPrice: Number(shippingAddr?.shipping_fee ?? order.shipping_fee),
                taxableAmount: Number(shippingAddr?.shipping_fee ?? order.shipping_fee),
                taxRate,
                taxAmount: Math.round(Number(shippingAddr?.shipping_fee ?? order.shipping_fee) * (taxRate / 100)),
                totalAmount: Number(shippingAddr?.shipping_fee ?? order.shipping_fee),
              },
            ]
          : []),
      ],
      financials: {
        taxableAmount,
        taxRate,
        taxAmount,
        cgstRate: isIntraState ? taxRate / 2 : 0,
        cgstAmount,
        sgstRate: isIntraState ? taxRate / 2 : 0,
        sgstAmount,
        igstRate: !isIntraState ? taxRate : 0,
        igstAmount,
        shippingFee: Number(shippingAddr?.shipping_fee ?? order.shipping_fee ?? 0),
        totalWeightGrams: Number(shippingAddr?.total_weight_grams ?? order.total_weight_grams ?? 0),
        grandTotal: totalAmount,
        currency: 'INR',
      },
    };

    // Optionally backup / upload HTML invoice to Supabase Storage bucket 'invoices' if bucket exists
    try {
      const invoiceJsonStr = JSON.stringify(invoiceData, null, 2);
      await supabase.storage
        .from('invoices')
        .upload(`${order.id}.json`, invoiceJsonStr, {
          contentType: 'application/json',
          upsert: true,
        });
    } catch (storageErr) {
      // Storage bucket is optional; non-blocking
    }

    return NextResponse.json({ success: true, invoice: invoiceData });
  } catch (err: any) {
    console.error('Invoice generation error:', err);
    return NextResponse.json({ error: err.message || 'Failed to generate invoice' }, { status: 500 });
  }
}
