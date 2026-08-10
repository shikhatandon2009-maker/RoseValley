import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { createRazorpayOrder } from '@/lib/razorpay/razorpay-client';
import { generateOrderNumber } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const { amount, currency = 'INR' } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid order amount.' }, { status: 400 });
    }

    const orderNumber = generateOrderNumber();
    const rzpOrder = await createRazorpayOrder({
      amount: amount,
      currency: currency,
      receipt: orderNumber,
    });

    return NextResponse.json({
      success: true,
      orderNumber,
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      isMock: rzpOrder.isMock || false,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
