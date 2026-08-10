import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let cachedServerClient: any = null;

export const getSupabaseServerClient = () => {
  if (cachedServerClient) {
    return cachedServerClient;
  }

  // If Supabase environment variables are missing or placeholders, return a dummy safe client
  if (!supabaseUrl || !supabaseServiceKey || supabaseUrl.includes('placeholder')) {
    cachedServerClient = {
      from: (table: string) => ({
        select: () => ({
          eq: () => ({
            limit: () => Promise.resolve({ data: null, error: null }),
            order: () => Promise.resolve({ data: null, error: null }),
            maybeSingle: () => Promise.resolve({ data: null, error: null }),
            single: () => Promise.resolve({ data: null, error: null }),
            or: () => ({
              maybeSingle: () => Promise.resolve({ data: null, error: null }),
            }),
          }),
          order: () => Promise.resolve({ data: null, error: null }),
          limit: () => Promise.resolve({ data: null, error: null }),
        }),
        insert: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: { id: `mock-${Date.now()}` }, error: null }),
          }),
        }),
        update: () => ({
          eq: () => ({
            eq: () => ({
              select: () => ({
                single: () => Promise.resolve({ data: { id: `mock-${Date.now()}` }, error: null }),
              }),
            }),
          }),
        }),
        upsert: () => Promise.resolve({ data: null, error: null }),
      }),
    } as any;
    return cachedServerClient;
  }

  cachedServerClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
    },
    global: {
      headers: { 'x-application-name': 'luxury-perfumes-store' },
    },
  });

  return cachedServerClient;
};
