const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf-8');
const getEnv = (k) => {
  const lines = env.split(/\r?\n/);
  for (const l of lines) {
    if (l.startsWith(k + '=')) return l.slice(k.length + 1).trim().replace(/^['"]|['"]$/g, '');
  }
  return null;
};

const supabase = createClient(
  getEnv('NEXT_PUBLIC_SUPABASE_URL'),
  getEnv('SUPABASE_SERVICE_ROLE_KEY') || getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
);

(async () => {
  const { data: prods } = await supabase.from('products').select('*');
  const { data: vars } = await supabase.from('product_variants').select('*');
  const { data: cats } = await supabase.from('categories').select('*');

  console.log('Archive contents:', prods?.length, 'products,', vars?.length, 'variants,', cats?.length, 'categories');

  const payload = {
    metadata: {
      store_id: 'essential_oils_perfumes_store_01',
      export_date: new Date().toISOString(),
      summary: { total_products: prods?.length, total_variants: vars?.length, total_categories: cats?.length }
    },
    data: {
      products: prods || [],
      variants: vars || [],
      categories: cats || []
    }
  };

  console.log('Sending restore request to http://localhost:3000/api/admin/settings/restore ...');
  const res = await fetch('http://localhost:3000/api/admin/settings/restore', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const resText = await res.text();
  console.log('Restore API status:', res.status);
  try {
    const restoreOutput = JSON.parse(resText);
    console.log('Restore API output:', restoreOutput);
  } catch (e) {
    console.log('Restore API raw response (first 200 chars):', resText.slice(0, 200));
  }

  const adminRes = await fetch('http://localhost:3000/api/admin/products');
  console.log('Admin API status:', adminRes.status);
  const adminText = await adminRes.text();
  try {
    const adminJson = JSON.parse(adminText);
    console.log('Products visible in admin API after restore:', adminJson.products?.length);
  } catch (e) {
    console.log('Admin API raw response (first 200 chars):', adminText.slice(0, 200));
  }

  const catRes = await fetch('http://localhost:3000/products');
  console.log('Frontend /products HTTP status:', catRes.status);
})();
