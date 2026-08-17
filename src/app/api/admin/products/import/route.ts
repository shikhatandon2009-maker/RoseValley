import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';

export const dynamic = 'force-dynamic';

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseCsvText(csvText: string): string[][] {
  // Strip BOM if present
  const cleanText = csvText.charCodeAt(0) === 0xFEFF ? csvText.slice(1) : csvText;
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

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
      if (currentRow.some((field) => field.length > 0)) {
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
    if (currentRow.some((field) => field.length > 0)) {
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

    const rawHeaders = rows[0].map((h) =>
      h.toLowerCase().trim().replace(/[\s_-]+/g, '_').replace(/[^\w]/g, '')
    );

    // 1. Pre-fetch all existing categories in 1 fast query
    const { data: existingCategories } = await supabase
      .from('categories')
      .select('id, name, slug')
      .eq('store_id', STORE_ID);

    const categoryMapByName = new Map<string, string>();
    const categoryMapBySlug = new Map<string, string>();
    (existingCategories || []).forEach((c: any) => {
      categoryMapByName.set(c.name.toLowerCase().trim(), c.id);
      categoryMapBySlug.set(c.slug.toLowerCase().trim(), c.id);
    });

    // 2. Pre-fetch all existing products in 1 fast query
    const { data: existingProducts } = await supabase
      .from('products')
      .select('id, slug')
      .eq('store_id', STORE_ID);

    const existingProductMapBySlug = new Map<string, string>();
    (existingProducts || []).forEach((p: any) => {
      if (p.slug) {
        existingProductMapBySlug.set(p.slug.toLowerCase().trim(), p.id);
      }
    });

    // 3. Pre-scan and bulk-insert missing categories to avoid per-row insertion overhead
    const missingCategoriesToCreate = new Set<string>();
    const parsedRowsData: Array<{
      rowIndex: number;
      name: string;
      slug: string;
      price: number;
      compareAtPrice: number | null;
      stock: number;
      description: string;
      isFeatured: boolean;
      isBestseller: boolean;
      metaTitle: string;
      metaDescription: string;
      topNotes: string[];
      heartNotes: string[];
      baseNotes: string[];
      ingredients: string[];
      images: string[];
      categoryNames: string[];
      variantItems: string[];
    }> = [];

    const errors: string[] = [];

    for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex];
      if (row.length === 0 || !row.some((cell) => cell.trim().length > 0)) continue;

      const record: Record<string, string> = {};
      rawHeaders.forEach((header, colIndex) => {
        record[header] = row[colIndex] || '';
      });

      const name =
        record.name ||
        record.product_name ||
        record.title ||
        record.productname ||
        record.item_name ||
        '';

      if (!name) {
        errors.push(`Row ${rowIndex + 1}: Missing product name`);
        continue;
      }

      const slug = (record.slug ? generateSlug(record.slug) : generateSlug(name)) || `prod-${Date.now()}-${rowIndex}`;
      const price = parseFloat(record.price?.replace(/[^\d.]/g, '') || '0') || 0;
      const compareAtRaw = record.compare_at_price || record.compareprice || record.mrp || record.original_price;
      const compareAtPrice = compareAtRaw ? parseFloat(compareAtRaw.replace(/[^\d.]/g, '')) || null : null;
      const stock = parseInt(record.stock?.replace(/[^\d]/g, '') || '10', 10) || 0;
      const description = record.description || record.body || record.desc || '';
      const isFeatured =
        String(record.is_featured || record.featured).toLowerCase() === 'true' ||
        record.is_featured === '1' ||
        record.is_featured === 'yes';
      const isBestseller =
        String(record.is_bestseller || record.bestseller).toLowerCase() === 'true' ||
        record.is_bestseller === '1' ||
        record.is_bestseller === 'yes';
      const metaTitle = record.meta_title || record.metatitle || name;
      const metaDescription = record.meta_description || record.metadescription || description.slice(0, 160);

      const topNotes = (record.top_notes || record.topnotes || record.top || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const heartNotes = (record.heart_notes || record.heartnotes || record.heart || record.middle_notes || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const baseNotes = (record.base_notes || record.basenotes || record.base || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const ingredients = (record.ingredients || record.notes || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const rawImages = record.image_url || record.images || record.image || record.img || '';
      const images = rawImages
        ? rawImages.split(/[;|\n]/).map((url) => url.trim()).filter((u) => u.startsWith('http') || u.startsWith('/'))
        : [];

      const rawCats = record.categories || record.category || record.collections || '';
      const categoryNames = rawCats
        ? rawCats.split(/[;,]/).map((s) => s.trim()).filter(Boolean)
        : [];

      categoryNames.forEach((catName) => {
        const lower = catName.toLowerCase();
        if (!categoryMapByName.has(lower) && !categoryMapBySlug.has(lower)) {
          missingCategoriesToCreate.add(catName);
        }
      });

      const rawVariants = record.variants || record.options || '';
      const variantItems = rawVariants ? rawVariants.split(';').map((v) => v.trim()).filter(Boolean) : [];

      parsedRowsData.push({
        rowIndex: rowIndex + 1,
        name,
        slug,
        price,
        compareAtPrice,
        stock,
        description,
        isFeatured,
        isBestseller,
        metaTitle,
        metaDescription,
        topNotes,
        heartNotes,
        baseNotes,
        ingredients,
        images,
        categoryNames,
        variantItems,
      });
    }

    // Bulk create any missing categories
    if (missingCategoriesToCreate.size > 0) {
      const newCategoryRows = Array.from(missingCategoriesToCreate).map((catName) => ({
        store_id: STORE_ID,
        name: catName.charAt(0).toUpperCase() + catName.slice(1),
        slug: generateSlug(catName),
      }));

      const { data: createdCats } = await supabase
        .from('categories')
        .insert(newCategoryRows)
        .select('id, name, slug');

      (createdCats || []).forEach((c: any) => {
        categoryMapByName.set(c.name.toLowerCase().trim(), c.id);
        categoryMapBySlug.set(c.slug.toLowerCase().trim(), c.id);
      });
    }

    let createdCount = 0;
    let updatedCount = 0;

    // 4. Process in parallel chunks of 15 for fast high-concurrency uploading
    const CHUNK_SIZE = 15;
    for (let i = 0; i < parsedRowsData.length; i += CHUNK_SIZE) {
      const chunk = parsedRowsData.slice(i, i + CHUNK_SIZE);

      await Promise.all(
        chunk.map(async (item) => {
          try {
            const existingId = existingProductMapBySlug.get(item.slug.toLowerCase().trim());
            let productId = existingId;
            const isUpdate = Boolean(existingId);

            if (isUpdate && productId) {
              // Update existing product
              const updatePayload: any = {
                name: item.name,
                description: item.description,
                price: item.price,
                compare_at_price: item.compareAtPrice,
                stock: item.stock,
                scent_notes: { top: item.topNotes, heart: item.heartNotes, base: item.baseNotes },
                ingredients: item.ingredients,
                is_featured: item.isFeatured,
                is_bestseller: item.isBestseller,
                meta_title: item.metaTitle,
                meta_description: item.metaDescription,
                updated_at: new Date().toISOString(),
              };

              if (item.images.length > 0) {
                updatePayload.images = item.images;
              }

              const { error: updateError } = await supabase
                .from('products')
                .update(updatePayload)
                .eq('id', productId)
                .eq('store_id', STORE_ID);

              if (updateError) {
                errors.push(`Row ${item.rowIndex} (${item.name}): ${updateError.message}`);
                return;
              }
              updatedCount++;
            } else {
              // Insert new product
              const { data: newProd, error: insertError } = await supabase
                .from('products')
                .insert({
                  store_id: STORE_ID,
                  name: item.name,
                  slug: item.slug,
                  description: item.description,
                  price: item.price,
                  compare_at_price: item.compareAtPrice,
                  stock: item.stock,
                  images: item.images,
                  scent_notes: { top: item.topNotes, heart: item.heartNotes, base: item.baseNotes },
                  ingredients: item.ingredients,
                  is_featured: item.isFeatured,
                  is_bestseller: item.isBestseller,
                  meta_title: item.metaTitle,
                  meta_description: item.metaDescription,
                })
                .select('id')
                .single();

              if (insertError || !newProd || !(newProd as any).id) {
                errors.push(`Row ${item.rowIndex} (${item.name}): ${insertError?.message || 'Insert failed'}`);
                return;
              }
              const createdId = String((newProd as any).id);
              productId = createdId;
              existingProductMapBySlug.set(item.slug.toLowerCase().trim(), createdId);
              createdCount++;
            }

            // Sync categories if present
            if (item.categoryNames.length > 0 && productId) {
              const categoryIdsToLink: string[] = [];
              item.categoryNames.forEach((catName) => {
                const lower = catName.toLowerCase();
                const catId = categoryMapByName.get(lower) || categoryMapBySlug.get(lower);
                if (catId && !categoryIdsToLink.includes(catId)) {
                  categoryIdsToLink.push(catId);
                }
              });

              if (categoryIdsToLink.length > 0) {
                await supabase
                  .from('product_categories')
                  .delete()
                  .eq('product_id', productId)
                  .eq('store_id', STORE_ID);

                const junctionRows = categoryIdsToLink.map((catId) => ({
                  store_id: STORE_ID,
                  product_id: productId,
                  category_id: catId,
                }));
                await supabase.from('product_categories').insert(junctionRows);
              }
            }

            // Sync variants if present
            if (item.variantItems.length > 0 && productId) {
              await supabase
                .from('product_variants')
                .delete()
                .eq('product_id', productId)
                .eq('store_id', STORE_ID);

              const variantRows = item.variantItems.map((vStr) => {
                const parts = vStr.split('|').map((p) => p.trim());
                const vName = parts[0] || 'Standard Size';
                const vSku = parts[1] || null;
                const vPrice = parseFloat(parts[2]?.replace(/[^\d.]/g, '') || '') || item.price;
                const vComparePrice = parts[3] ? parseFloat(parts[3].replace(/[^\d.]/g, '')) || null : null;
                const vStock = parseInt(parts[4]?.replace(/[^\d]/g, '') || '', 10) || item.stock;

                return {
                  store_id: STORE_ID,
                  product_id: productId,
                  name: vName,
                  sku: vSku,
                  price: vPrice,
                  compare_at_price: vComparePrice,
                  stock: vStock,
                };
              });

              await supabase.from('product_variants').insert(variantRows);
            }
          } catch (rowErr: any) {
            errors.push(`Row ${item.rowIndex} (${item.name}): ${rowErr.message}`);
          }
        })
      );
    }

    const totalProcessed = createdCount + updatedCount;

    return NextResponse.json({
      success: true,
      count: totalProcessed,
      createdCount,
      updatedCount,
      totalProcessed,
      errorCount: errors.length,
      errors: errors.length > 0 ? errors : undefined,
      summary: `Successfully processed ${totalProcessed} products (${updatedCount} updated, ${createdCount} created).`,
    });
  } catch (err: any) {
    console.error('Import CSV error:', err);
    return NextResponse.json({ error: err.message || 'Failed to import products CSV' }, { status: 500 });
  }
}
