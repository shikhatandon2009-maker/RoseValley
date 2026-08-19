import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';

export const dynamic = 'force-dynamic';

function escapeCsv(val: any): string {
  if (val === null || val === undefined) return '""';
  let str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();

    // 1. Fetch products
    const { data: products, error: pErr } = await supabase
      .from('products')
      .select('*')
      .eq('store_id', STORE_ID)
      .order('created_at', { ascending: false });

    if (pErr) {
      return NextResponse.json({ error: pErr.message }, { status: 500 });
    }

    // 2. Fetch categories junction
    const { data: junctions } = await supabase
      .from('product_categories')
      .select('product_id, category_id, categories(name)')
      .eq('store_id', STORE_ID);

    const categoryLookup = new Map<string, string[]>();
    (junctions || []).forEach((j: any) => {
      const catName = j.categories?.name;
      if (catName) {
        const list = categoryLookup.get(j.product_id) || [];
        list.push(catName);
        categoryLookup.set(j.product_id, list);
      }
    });

    // 3. Fetch variants
    const { data: variants } = await supabase
      .from('product_variants')
      .select('*')
      .eq('store_id', STORE_ID);

    const variantLookup = new Map<string, any[]>();
    (variants || []).forEach((v: any) => {
      const list = variantLookup.get(v.product_id) || [];
      list.push(v);
      variantLookup.set(v.product_id, list);
    });

    // Build CSV Content
    const headers = [
      'Name',
      'Slug',
      'Base Price',
      'Compare Price',
      'Stock',
      'Categories',
      'Images',
      'Top Notes',
      'Heart Notes',
      'Base Notes',
      'Ingredients',
      'Description',
      'Is Featured',
      'Is Bestseller',
      'Meta Title',
      'Meta Description',
      'Meta Keywords',
      'Variants (Name:Price:Compare:SKU)',
    ];

    const rows: string[] = [];
    rows.push(headers.join(','));

    (products || []).forEach((p: any) => {
      const cats = (categoryLookup.get(p.id) || []).join('; ');
      const imgs = Array.isArray(p.images) ? p.images.join('; ') : '';
      const topNotes = (p.scent_notes?.top || []).join('; ');
      const heartNotes = (p.scent_notes?.heart || []).join('; ');
      const baseNotes = (p.scent_notes?.base || []).join('; ');
      const ingredients = Array.isArray(p.ingredients) ? p.ingredients.join('; ') : '';

      const pVars = (variantLookup.get(p.id) || []).map(
        (v: any) => `${v.name}:${v.price}:${v.compare_at_price || ''}:${v.sku || ''}`
      ).join('; ');

      const row = [
        escapeCsv(p.name),
        escapeCsv(p.slug),
        escapeCsv(p.price),
        escapeCsv(p.compare_at_price),
        escapeCsv(p.stock),
        escapeCsv(cats),
        escapeCsv(imgs),
        escapeCsv(topNotes),
        escapeCsv(heartNotes),
        escapeCsv(baseNotes),
        escapeCsv(ingredients),
        escapeCsv(p.description),
        escapeCsv(p.is_featured ? 'true' : 'false'),
        escapeCsv(p.is_bestseller ? 'true' : 'false'),
        escapeCsv(p.meta_title),
        escapeCsv(p.meta_description),
        escapeCsv(p.meta_keywords),
        escapeCsv(pVars),
      ];

      rows.push(row.join(','));
    });

    const csvContent = rows.join('\r\n');
    const filename = `products_export_${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: any) {
    console.error('Error exporting products CSV:', err);
    return NextResponse.json({ error: err.message || 'Export failed' }, { status: 500 });
  }
}
