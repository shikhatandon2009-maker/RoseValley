import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseCsvText(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentField.trim());
      if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0] !== '')) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  if (currentField !== '' || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0] !== '')) {
      rows.push(currentRow);
    }
  }

  return rows;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const body = await request.json();
    const csvContent = body.csvContent;

    if (!csvContent || typeof csvContent !== 'string') {
      return NextResponse.json({ error: 'CSV content is required.' }, { status: 400 });
    }

    const rows = parseCsvText(csvContent);
    if (rows.length < 2) {
      return NextResponse.json({ error: 'CSV file is empty or missing data rows.' }, { status: 400 });
    }

    const rawHeaders = rows[0].map((h) => h.toLowerCase().trim().replace(/[\s_-]+/g, '_'));

    // Fetch existing categories to map names to category IDs
    const { data: existingCategories } = await supabase
      .from('categories')
      .select('id, name, slug')
      .eq('store_id', STORE_ID);

    const categoryMapByName = new Map<string, string>();
    const categoryMapBySlug = new Map<string, string>();
    (existingCategories || []).forEach((c: any) => {
      categoryMapByName.set(c.name.toLowerCase(), c.id);
      categoryMapBySlug.set(c.slug.toLowerCase(), c.id);
    });

    let successCount = 0;
    const errors: string[] = [];

    for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex];
      if (row.length === 0 || (row.length === 1 && !row[0])) continue;

      const record: Record<string, string> = {};
      rawHeaders.forEach((header, colIndex) => {
        record[header] = row[colIndex] || '';
      });

      const name = record.name || record.product_name || record.title;
      if (!name) {
        errors.push(`Row ${rowIndex + 1}: Missing product name`);
        continue;
      }

      const slug = record.slug || generateSlug(name);
      const price = parseFloat(record.price) || 0;
      const compareAtPrice = record.compare_at_price ? parseFloat(record.compare_at_price) : null;
      const stock = parseInt(record.stock, 10) || 0;
      const description = record.description || '';
      const isFeatured = String(record.is_featured).toLowerCase() === 'true' || record.is_featured === '1';
      const isBestseller = String(record.is_bestseller).toLowerCase() === 'true' || record.is_bestseller === '1';
      const metaTitle = record.meta_title || '';
      const metaDescription = record.meta_description || '';

      const topNotes = (record.top_notes || record.top || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const heartNotes = (record.heart_notes || record.heart || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const baseNotes = (record.base_notes || record.base || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const ingredients = (record.ingredients || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const images = record.image_url || record.images
        ? (record.image_url || record.images).split(';').map((url) => url.trim()).filter(Boolean)
        : [];

      // Check if product already exists by slug
      const { data: existingProd } = await supabase
        .from('products')
        .select('id')
        .eq('store_id', STORE_ID)
        .eq('slug', slug)
        .maybeSingle();

      let productId: string;

      if (existingProd) {
        productId = existingProd.id;
        // Update product
        const { error: updateError } = await supabase
          .from('products')
          .update({
            name,
            description,
            price,
            compare_at_price: compareAtPrice,
            stock,
            scent_notes: { top: topNotes, heart: heartNotes, base: baseNotes },
            ingredients,
            is_featured: isFeatured,
            is_bestseller: isBestseller,
            meta_title: metaTitle,
            meta_description: metaDescription,
            ...(images.length > 0 ? { images } : {}),
            updated_at: new Date().toISOString(),
          })
          .eq('id', productId)
          .eq('store_id', STORE_ID);

        if (updateError) {
          errors.push(`Row ${rowIndex + 1} (${name}): ${updateError.message}`);
          continue;
        }
      } else {
        // Insert product
        const { data: newProd, error: insertError } = await supabase
          .from('products')
          .insert({
            store_id: STORE_ID,
            name,
            slug,
            description,
            price,
            compare_at_price: compareAtPrice,
            stock,
            images,
            scent_notes: { top: topNotes, heart: heartNotes, base: baseNotes },
            ingredients,
            is_featured: isFeatured,
            is_bestseller: isBestseller,
            meta_title: metaTitle,
            meta_description: metaDescription,
          })
          .select('id')
          .single();

        if (insertError || !newProd) {
          errors.push(`Row ${rowIndex + 1} (${name}): ${insertError?.message || 'Failed to insert'}`);
          continue;
        }
        productId = newProd.id;
      }

      // Map and link categories
      if (record.categories) {
        const catNames = record.categories.split(/[;,]/).map((s) => s.trim().toLowerCase()).filter(Boolean);
        const categoryIdsToLink: string[] = [];

        for (const catName of catNames) {
          let catId = categoryMapByName.get(catName) || categoryMapBySlug.get(catName);
          if (!catId) {
            // Auto-create category if doesn't exist
            const catSlug = generateSlug(catName);
            const { data: newCat } = await supabase
              .from('categories')
              .insert({
                store_id: STORE_ID,
                name: catName.charAt(0).toUpperCase() + catName.slice(1),
                slug: catSlug,
              })
              .select('id')
              .single();

            if (newCat && (newCat as any).id) {
              const createdId = (newCat as any).id as string;
              catId = createdId;
              categoryMapByName.set(catName, createdId);
              categoryMapBySlug.set(catSlug, createdId);
            }
          }
          if (catId && !categoryIdsToLink.includes(catId)) {
            categoryIdsToLink.push(catId);
          }
        }

        if (categoryIdsToLink.length > 0) {
          // Delete existing junctions and insert new
          await supabase.from('product_categories').delete().eq('product_id', productId).eq('store_id', STORE_ID);
          const junctionRows = categoryIdsToLink.map((catId) => ({
            store_id: STORE_ID,
            product_id: productId,
            category_id: catId,
          }));
          await supabase.from('product_categories').insert(junctionRows);
        }
      }

      // Parse and insert variants: Format "Name|SKU|Price|ComparePrice|Stock" separated by semicolon
      if (record.variants) {
        const variantItems = record.variants.split(';').map((v) => v.trim()).filter(Boolean);
        if (variantItems.length > 0) {
          // Delete old variants
          await supabase.from('product_variants').delete().eq('product_id', productId).eq('store_id', STORE_ID);

          const variantRows = variantItems.map((item) => {
            const parts = item.split('|').map((p) => p.trim());
            const vName = parts[0] || 'Standard Size';
            const vSku = parts[1] || '';
            const vPrice = parseFloat(parts[2]) || price;
            const vComparePrice = parts[3] ? parseFloat(parts[3]) : null;
            const vStock = parseInt(parts[4], 10) || stock;

            const rowData: any = {
              store_id: STORE_ID,
              product_id: productId,
              name: vName,
              price: vPrice,
              compare_at_price: vComparePrice,
              stock: vStock,
            };
            if (vSku) {
              rowData.sku = vSku;
            }

            return rowData;
          });

          await supabase.from('product_variants').insert(variantRows);
        }
      }

      successCount++;
    }

    return NextResponse.json({
      success: true,
      count: successCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err: any) {
    console.error('Import CSV error:', err);
    return NextResponse.json({ error: err.message || 'Failed to import products CSV' }, { status: 500 });
  }
}
