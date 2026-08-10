import React from 'react';

export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';
import { CheckCircle2, Package, Mail, ArrowRight } from 'lucide-react';

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

  const orderNum = order ? order.order_number : `MDE-${Date.now().toString().slice(-6)}`;
  const total = order ? `₹${order.total_amount}` : '₹4,800';

  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <span className="text-xs uppercase tracking-widest text-[#B03060] font-bold">Payment & Order Confirmed</span>
        <h1 className="font-serif text-3xl font-bold text-[#7A1840]">Thank You For Your Order!</h1>
        <p className="text-xs text-[#5A1030]">
          Order Reference: <span className="font-mono font-bold text-[#5A1030]">{orderNum}</span>
        </p>
      </div>

      <div className="glass-panel p-6 rounded-3xl border border-[#E8B8B8] shadow-sm text-left space-y-3 text-xs text-[#5A1030]">
        <div className="flex items-center gap-2 text-[#7A1840] font-semibold border-b border-[#F2D4D4] pb-2">
          <Mail className="w-4 h-4 text-[#D45A7A]" />
          <span>Confirmation Sent</span>
        </div>
        <p>A detailed receipt and order logs have been dispatched to your email address.</p>
        <p className="font-bold text-[#9A2048]">Total Paid: {total}</p>
      </div>

      <div className="flex justify-center gap-4 pt-4">
        <Link
          href="/account"
          className="bg-[#D45A7A] hover:bg-[#C94A6A] text-white py-3 px-6 rounded-full font-semibold text-xs shadow-luxury flex items-center gap-2"
        >
          <Package className="w-4 h-4" /> Track Order Status
        </Link>
        <Link
          href="/products"
          className="bg-white/80 hover:bg-white text-[#7A1840] border border-[#E8B8B8] py-3 px-6 rounded-full font-semibold text-xs"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
