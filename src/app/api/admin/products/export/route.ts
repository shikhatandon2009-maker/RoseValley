import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';

function escapeCsvCell(val: any): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();

    // 1. Fetch all products
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('id, name, slug, price, compare_at_price, stock, scent_notes, ingredients, description, is_featured, is_bestseller, meta_title, meta_description')
      .eq('store_id', STORE_ID)
      .order('created_at', { ascending: false });

    if (prodError) {
      return NextResponse.json({ error: prodError.message }, { status: 500 });
    }

    // 2. Fetch all categories
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name, slug')
      .eq('store_id', STORE_ID);

    const catMap = new Map<string, string>();
    (categories || []).forEach((c: any) => catMap.set(c.id, c.name));

    // 3. Fetch product_categories junction
    const { data: junctions } = await supabase
      .from('product_categories')
      .select('product_id, category_id')
      .eq('store_id', STORE_ID);

    const productCategoriesMap = new Map<string, string[]>();
    (junctions || []).forEach((j: any) => {
      const catName = catMap.get(j.category_id);
      if (catName) {
        const existing = productCategoriesMap.get(j.product_id) || [];
        productCategoriesMap.set(j.product_id, [...existing, catName]);
      }
    });

    // 4. Fetch all variants
    const { data: variants } = await supabase
      .from('product_variants')
      .select('product_id, name, sku, price, compare_at_price, stock')
      .eq('store_id', STORE_ID);

    const productVariantsMap = new Map<string, any[]>();
    (variants || []).forEach((v: any) => {
      const existing = productVariantsMap.get(v.product_id) || [];
      productVariantsMap.set(v.product_id, [...existing, v]);
    });

    // Clean CSV Headers (Excluding image_url to avoid huge data bloat)
    const headers = [
      'name',
      'slug',
      'price',
      'compare_at_price',
      'stock',
      'categories',
      'top_notes',
      'heart_notes',
      'base_notes',
      'ingredients',
      'description',
      'is_featured',
      'is_bestseller',
      'meta_title',
      'meta_description',
      'variants'
    ];

    const rows: string[] = [headers.join(',')];

    for (const p of products || []) {
      const catNames = (productCategoriesMap.get(p.id) || []).join('; ');
      const topNotes = (p.scent_notes?.top || []).join(', ');
      const heartNotes = (p.scent_notes?.heart || []).join(', ');
      const baseNotes = (p.scent_notes?.base || []).join(', ');
      const ingredients = (p.ingredients || []).join(', ');

      // Format variants: Name|SKU|Price|ComparePrice|Stock
      const pVariants = productVariantsMap.get(p.id) || [];
      const variantStr = pVariants
        .map((v: any) => `${v.name || ''}|${v.sku || ''}|${v.price || ''}|${v.compare_at_price || ''}|${v.stock || 0}`)
        .join('; ');

      const row = [
        escapeCsvCell(p.name),
        escapeCsvCell(p.slug),
        escapeCsvCell(p.price),
        escapeCsvCell(p.compare_at_price || ''),
        escapeCsvCell(p.stock),
        escapeCsvCell(catNames),
        escapeCsvCell(topNotes),
        escapeCsvCell(heartNotes),
        escapeCsvCell(baseNotes),
        escapeCsvCell(ingredients),
        escapeCsvCell(p.description || ''),
        escapeCsvCell(p.is_featured ? 'TRUE' : 'FALSE'),
        escapeCsvCell(p.is_bestseller ? 'TRUE' : 'FALSE'),
        escapeCsvCell(p.meta_title || ''),
        escapeCsvCell(p.meta_description || ''),
        escapeCsvCell(variantStr)
      ];

      rows.push(row.join(','));
    }

    const csvContent = rows.join('\r\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="products_catalog_export_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (err: any) {
    console.error('Export CSV error:', err);
    return NextResponse.json({ error: err.message || 'Failed to export products CSV' }, { status: 500 });
  }
}
