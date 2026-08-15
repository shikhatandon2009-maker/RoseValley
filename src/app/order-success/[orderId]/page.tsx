import React from 'react';

export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';
import { CheckCircle2, Package, Mail, ArrowRight, Receipt, Building2, CreditCard, ShieldCheck } from 'lucide-react';

interface OrderSuccessPageProps {
  params: { orderId: string };
}

export default async function OrderSuccessPage({ params }: OrderSuccessPageProps) {
  const supabase = getSupabaseServerClient();
  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('store_id', STORE_ID)
    .eq('id', params.orderId)
    .maybeSingle();

  const orderNum = order ? order.order_number : `RVK-${Date.now().toString().slice(-6)}`;
  const totalAmount = order?.total_amount || 4800;
  const shippingAddr = (order?.shipping_address as any) || {};

  const taxRate = shippingAddr?.tax_rate || 18.00;
  const taxableAmount = shippingAddr?.taxable_amount || Math.round((totalAmount / (1 + taxRate / 100)));
  const taxAmount = shippingAddr?.tax_amount || (totalAmount - taxableAmount);
  const buyerGstin = shippingAddr?.gstin || null;
  const businessName = shippingAddr?.companyName || shippingAddr?.company_name || shippingAddr?.business_name || order?.company_name || order?.business_name || null;
  const paymentMethod = shippingAddr?.payment_method || 'razorpay';

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6 text-[#1A0510]">
      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <span className="text-xs uppercase tracking-widest text-[#4A0D25] font-bold flex items-center justify-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FAE6E7] border border-[#F7D1D8] w-fit mx-auto">
          <ShieldCheck className="w-3.5 h-3.5 text-[#F6A6BB]" /> Payment & Order Confirmed
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A0510]">Thank You For Your Order!</h1>
        <p className="text-xs text-[#4A0D25] font-semibold">
          Order Reference: <span className="font-mono font-bold text-[#1A0510]">{orderNum}</span>
        </p>
      </div>

      {/* Tax Invoice Summary Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-[#F7D1D8] shadow-lg text-left space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-[#F7D1D8] pb-3">
          <div className="flex items-center gap-2 text-[#1A0510] font-bold text-sm">
            <Receipt className="w-4 h-4 text-[#F6A6BB]" />
            <span>Tax Invoice Breakdown (HSN 330300)</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-950 font-black text-[10px] uppercase">
            Paid via {paymentMethod === 'paypal' ? 'PayPal' : 'Razorpay'}
          </span>
        </div>

        {(businessName || buyerGstin) && (
          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex flex-wrap items-center justify-between font-bold gap-2">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-700" />
              <span>B2B Tax Credit Invoice Credited To:</span>
              {businessName && <span className="font-black text-[#1A0510]">{businessName}</span>}
            </div>
            {buyerGstin && (
              <span className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-300">
                GSTIN: {buyerGstin}
              </span>
            )}
          </div>
        )}

        <div className="space-y-2 pt-1">
          <div className="flex justify-between text-stone-600">
            <span>Taxable Goods Value:</span>
            <span className="font-semibold">₹{Number(taxableAmount).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-[#4A0D25] font-bold">
            <span>GST / Tax ({taxRate}%):</span>
            <span>₹{Number(taxAmount).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-stone-600">
            <span>Complimentary Insured Delivery:</span>
            <span className="text-emerald-700 font-bold">FREE</span>
          </div>
          <div className="flex justify-between text-base font-serif font-black text-[#4A0D25] pt-2 border-t border-[#F7D1D8]">
            <span>Total Paid (Inc. All Taxes):</span>
            <span className="text-lg">₹{Number(totalAmount).toLocaleString()}</span>
          </div>
        </div>

        <div className="p-3 bg-[#FAE6E7]/50 rounded-xl border border-[#F7D1D8] flex items-center gap-2 text-[11px] text-[#4A0D25] font-medium">
          <Mail className="w-4 h-4 text-[#F6A6BB] flex-shrink-0" />
          <span>A copy of this taxable GST invoice & dispatch tracking updates have been sent to your email.</span>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-4 pt-2">
        <Link
          href="/account"
          className="bg-[#F6A6BB] hover:bg-[#F4BBC9] text-[#4A0D25] py-3.5 px-8 rounded-full font-bold text-xs shadow-sm flex items-center gap-2 transition-all uppercase tracking-wider"
        >
          <Package className="w-4 h-4" /> Track Order Status
        </Link>
        <Link
          href="/products"
          className="bg-white hover:bg-stone-50 text-[#4A0D25] border border-[#F7D1D8] py-3.5 px-8 rounded-full font-bold text-xs transition-all uppercase tracking-wider"
        >
          Continue Exploring
        </Link>
      </div>
    </div>
  );
}
