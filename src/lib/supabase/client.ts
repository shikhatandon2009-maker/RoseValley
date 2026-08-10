import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

function isValidUrl(url?: string): boolean {
  if (!url || typeof url !== 'string') return false;
  if (url.includes('placeholder') || url.includes('your-supabase-project')) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export const supabase = (!isValidUrl(supabaseUrl) || !supabaseAnonKey)
  ? ({
      from: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
        insert: () => Promise.resolve({ data: null, error: null }),
      }),
    } as any)
  : createClient(supabaseUrl!, supabaseAnonKey);
