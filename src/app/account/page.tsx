import React from 'react';
import { getSession } from '@/lib/auth/session';
import { fetchUserById } from '@/lib/supabase/store-scoped-queries';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';
import { AccountClient } from './AccountClient';
import { LuxuryHeader } from '@/components/layout/LuxuryHeader';
import { LuxuryFooter } from '@/components/layout/LuxuryFooter';

export const dynamic = 'force-dynamic';

export default async function AccountPage({ searchParams }: { searchParams: { tab?: string } }) {
  const session = await getSession();
  const user = session ? await fetchUserById(session.userId) : null;

  const supabase = getSupabaseServerClient();

  // Fetch customer's orders
  const { data: userOrders } = session
    ? await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('store_id', STORE_ID)
        .eq('user_id', session.userId)
        .order('created_at', { ascending: false })
    : { data: [] };

  return (
    <div className="min-h-screen bg-white text-black">
      <LuxuryHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AccountClient
          user={user || null}
          orders={userOrders || []}
          defaultTab={searchParams.tab || 'orders'}
        />
      </main>

      <LuxuryFooter />
    </div>
  );
}
