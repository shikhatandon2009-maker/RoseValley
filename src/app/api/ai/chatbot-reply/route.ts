import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { generateAIContent } from '@/lib/ai/ai-service';
import { STORE_ID } from '@/lib/constants';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    // Check if user is asking for order status: Look for pattern MDE-XXXX or email matching
    const orderMatch = message.match(/MDE-[\w-]+/i);
    const emailMatch = message.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);

    let dbContext: any = {};

    if (orderMatch) {
      const orderNum = orderMatch[0].toUpperCase();
      // Requirement: Order status requires BOTH order ID and matching email to prevent leaking order data
      if (emailMatch) {
        const userEmail = emailMatch[0].toLowerCase();
        const { data: order } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('store_id', STORE_ID)
          .eq('order_number', orderNum)
          .or(`guest_email.eq.${userEmail}, shipping_address->>email.eq.${userEmail}`)
          .maybeSingle();

        if (order) {
          dbContext = {
            foundOrder: {
              number: order.order_number,
              status: order.status,
              courier: order.courier_name || 'Processing',
              tracking: order.tracking_number || 'Preparing label',
              total: order.total_amount,
            },
          };
        } else {
          return NextResponse.json({
            reply: `No order matching ${orderNum} was found for email ${userEmail}. Please double-check your order confirmation email.`,
          });
        }
      } else {
        return NextResponse.json({
          reply: `For security purposes, please provide both your Order Number (${orderNum}) AND the matching email address used at checkout to view your order status.`,
        });
      }
    } else {
      // Fetch current featured products & categories context for chatbot
      const { data: products } = await supabase
        .from('products')
        .select('name, price, scent_notes, stock')
        .eq('store_id', STORE_ID)
        .limit(5);

      dbContext = { products: products || [] };
    }

    const reply = await generateAIContent({
      type: 'chatbot',
      prompt: message,
      context: dbContext,
    });

    return NextResponse.json({ success: true, reply });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Chatbot Error' }, { status: 500 });
  }
}
