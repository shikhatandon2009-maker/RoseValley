const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length > 0) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing connection to:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
  try {
    const { data: products, error: pErr } = await supabase.from('products').select('id, name, price, stock, meta_keywords');
    if (pErr) {
      console.error('❌ Products Table Error:', pErr.message);
    } else {
      console.log('✅ Products Table OK! Count:', products.length);
    }

    const { data: users, error: uErr } = await supabase.from('users').select('id, email, role');
    if (uErr) {
      console.error('❌ Users Table Error:', uErr.message);
    } else {
      console.log('✅ Users Table OK! Count:', users.length);
    }

    const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
    if (bErr) {
      console.error('❌ Storage Buckets Error:', bErr.message);
    } else {
      console.log('✅ Storage Buckets OK! Found buckets:', buckets.map(b => b.name));
    }
  } catch (err) {
    console.error('Fatal connection error:', err);
  }
}

verify();
