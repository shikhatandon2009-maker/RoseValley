import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';
import { sendEmail } from '@/lib/email/mailer';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const orderId = params.id;
    const body = await request.json().catch(() => ({}));
    const targetEmail = body.email;

    const supabase = getSupabaseServerClient();

    const { data: order, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('store_id', STORE_ID)
      .or(`id.eq.${orderId},order_number.eq.${orderId}`)
      .maybeSingle();

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const shippingAddr = (order.shipping_address as any) || {};
    const recipientEmail = targetEmail || order.email || shippingAddr?.email;

    if (!recipientEmail) {
      return NextResponse.json({ error: 'No recipient email found for this order' }, { status: 400 });
    }

    const totalAmount = Number(order.total_amount || 0);
    const invoiceNumber = `INV-${order.order_number || order.id.slice(0, 8).toUpperCase()}`;
    const buyerGstin = (shippingAddr?.gstin || order.gstin || '').trim().toUpperCase();
    const businessName = (shippingAddr?.companyName || shippingAddr?.company_name || order.company_name || order.business_name || '').trim();
    const clientName = shippingAddr?.fullName || shippingAddr?.full_name || order.user_name || 'Valued Client';

    const itemsRows = (order.order_items || [])
      .map(
        (item: any, idx: number) => `
        <tr style="border-bottom: 1px solid #F7D1D8;">
          <td style="padding: 10px; font-size: 12px; color: #1A0510;">${idx + 1}</td>
          <td style="padding: 10px; font-size: 12px; color: #1A0510; font-weight: bold;">
            ${item.product_name || item.name}
            <div style="font-size: 10px; color: #888; font-weight: normal;">HSN 330300 • ${item.variantName || 'Standard'}</div>
          </td>
          <td style="padding: 10px; font-size: 12px; color: #1A0510; text-align: center;">${item.quantity || 1}</td>
          <td style="padding: 10px; font-size: 12px; color: #1A0510; text-align: right; font-weight: bold;">₹${Number(item.price || 0).toLocaleString('en-IN')}</td>
        </tr>
      `
      )
      .join('');

    const htmlContent = `
      <div style="max-width: 650px; margin: 0 auto; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background: #ffffff; border: 2px solid #F7D1D8; border-radius: 16px; overflow: hidden;">
        <div style="background: #4A0D25; padding: 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 22px; letter-spacing: 2px; text-transform: uppercase;">Rose Valley Kannauj</h1>
          <p style="margin: 4px 0 0; font-size: 11px; opacity: 0.85; letter-spacing: 1px;">Maison De L'Essence • Official GST Tax Invoice</p>
        </div>

        <div style="padding: 24px; color: #1A0510;">
          <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #F7D1D8; padding-bottom: 16px; margin-bottom: 16px;">
            <div>
              <p style="margin: 0; font-size: 11px; color: #888; text-transform: uppercase; font-weight: bold;">Tax Invoice Reference</p>
              <p style="margin: 2px 0 0; font-size: 16px; font-weight: bold; color: #4A0D25;">${invoiceNumber}</p>
              <p style="margin: 2px 0 0; font-size: 11px; color: #666;">Date: ${new Date(order.created_at || Date.now()).toLocaleDateString('en-IN')}</p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 0; font-size: 11px; color: #888; text-transform: uppercase; font-weight: bold;">Supplier Details</p>
              <p style="margin: 2px 0 0; font-size: 12px; font-weight: bold; color: #1A0510;">Rose Valley Kannauj</p>
              <p style="margin: 2px 0 0; font-size: 11px; color: #666;">GSTIN: <strong>09AAACR1234F1Z5</strong></p>
              <p style="margin: 2px 0 0; font-size: 10px; color: #666;">Kannauj, Uttar Pradesh - 209725</p>
            </div>
          </div>

          <div style="background: #FAE6E7; padding: 14px; border-radius: 12px; margin-bottom: 20px; font-size: 12px;">
            <p style="margin: 0 0 4px; font-weight: bold; color: #4A0D25;">Billed & Shipped To:</p>
            <p style="margin: 0; font-weight: bold; color: #1A0510;">${clientName}</p>
            ${businessName ? `<p style="margin: 2px 0 0; color: #1A0510;"><strong>Company:</strong> ${businessName}</p>` : ''}
            ${buyerGstin ? `<p style="margin: 2px 0 0; color: #047857;"><strong>Buyer GSTIN:</strong> ${buyerGstin} (Input Tax Credit Eligible)</p>` : ''}
            <p style="margin: 2px 0 0; color: #666;">${shippingAddr?.streetAddress || shippingAddr?.street_address || ''}, ${shippingAddr?.city || ''}, ${shippingAddr?.state || ''} - ${shippingAddr?.postalCode || shippingAddr?.postal_code || ''}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background: #FAF5F5; border-bottom: 2px solid #F7D1D8; text-align: left;">
                <th style="padding: 8px 10px; font-size: 11px; color: #4A0D25; text-transform: uppercase;">#</th>
                <th style="padding: 8px 10px; font-size: 11px; color: #4A0D25; text-transform: uppercase;">Description (HSN 330300)</th>
                <th style="padding: 8px 10px; font-size: 11px; color: #4A0D25; text-transform: uppercase; text-align: center;">Qty</th>
                <th style="padding: 8px 10px; font-size: 11px; color: #4A0D25; text-transform: uppercase; text-align: right;">Amount (INR)</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>

          <div style="border-top: 2px solid #4A0D25; padding-top: 12px; margin-bottom: 24px; text-align: right;">
            <p style="margin: 0; font-size: 14px; font-weight: bold; color: #4A0D25;">
              Grand Total (Inc. 18% GST): ₹${totalAmount.toLocaleString('en-IN')}
            </p>
            <p style="margin: 4px 0 0; font-size: 10px; color: #047857; font-weight: bold;">
              ✓ Payment Received & Verified • Complimentary Insured Shipping (FREE)
            </p>
          </div>

          <div style="background: #FDF2F4; padding: 12px; border-radius: 8px; font-size: 10px; color: #666; text-align: center;">
            This is a computer-generated official GST Tax Invoice under CGST/SGST/IGST Act. For concierge queries, contact us at concierge@rosevalleykannauj.com.
          </div>
        </div>
      </div>
    `;

    const emailResult = await sendEmail({
      to: recipientEmail,
      subject: `Official GST Tax Invoice #${invoiceNumber} • Rose Valley Kannauj`,
      html: htmlContent,
      type: 'tax_invoice',
    });

    return NextResponse.json({
      success: emailResult.success,
      message: `Tax Invoice #${invoiceNumber} successfully dispatched to ${recipientEmail}`,
    });
  } catch (err: any) {
    console.error('Error sending invoice email:', err);
    return NextResponse.json({ error: err.message || 'Failed to send invoice email' }, { status: 500 });
  }
}
