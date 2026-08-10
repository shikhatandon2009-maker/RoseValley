import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder'))
  ? ({
      from: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
        insert: () => Promise.resolve({ data: null, error: null }),
      }),
    } as any)
  : createClient(supabaseUrl, supabaseAnonKey);
