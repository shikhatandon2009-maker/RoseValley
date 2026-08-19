import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow sufficient execution window

function parseCsv(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (c === '"' && next === '"') {
        cell += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        cell += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ',') {
        row.push(cell.trim());
        cell = '';
      } else if (c === '\r' || c === '\n') {
        if (c === '\r' && next === '\n') i++;
        row.push(cell.trim());
        if (row.some((val) => val !== '')) lines.push(row);
        row = [];
        cell = '';
      } else {
        cell += c;
      }
    }
  }
  if (cell || row.length > 0) {
    row.push(cell.trim());
    if (row.some((val) => val !== '')) lines.push(row);
  }
  return lines;
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const contentType = request.headers.get('content-type') || '';
    let csvText = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      if (!file) {
        return NextResponse.json({ error: 'No CSV file provided.' }, { status: 400 });
      }
      csvText = await file.text();
    } else {
      const body = await request.json();
      csvText = body.csv || '';
    }

    if (!csvText.trim()) {
      return NextResponse.json({ error: 'CSV file is empty.' }, { status: 400 });
    }

    const rows = parseCsv(csvText);
    if (rows.length < 2) {
      return NextResponse.json({ error: 'CSV must contain headers and at least 1 product row.' }, { status: 400 });
    }

    const headers = rows[0].map((h) => h.toLowerCase().trim());
    const dataRows = rows.slice(1);

    // Map header indices
    const nameIdx = headers.findIndex((h) => h.includes('name'));
    const slugIdx = headers.findIndex((h) => h.includes('slug'));
    const priceIdx = headers.findIndex((h) => h.includes('base price') || h === 'price');
    const compareIdx = headers.findIndex((h) => h.includes('compare'));
    const stockIdx = headers.findIndex((h) => h.includes('stock'));
    const descIdx = headers.findIndex((h) => h.includes('desc'));
    const imgIdx = headers.findIndex((h) => h.includes('image'));
    const topIdx = headers.findIndex((h) => h.includes('top note'));
    const heartIdx = headers.findIndex((h) => h.includes('heart note'));
    const baseIdx = headers.findIndex((h) => h.includes('base note'));
    const ingIdx = headers.findIndex((h) => h.includes('ingredient'));
    const featIdx = headers.findIndex((h) => h.includes('feature'));
    const bestIdx = headers.findIndex((h) => h.includes('bestseller'));
    const metaTitleIdx = headers.findIndex((h) => h.includes('meta title'));
    const metaDescIdx = headers.findIndex((h) => h.includes('meta desc'));
    const metaKeyIdx = headers.findIndex((h) => h.includes('meta key'));
    const varIdx = headers.findIndex((h) => h.includes('variant'));

    if (nameIdx === -1 || priceIdx === -1) {
      return NextResponse.json(
        { error: 'CSV must have at least "Name" and "Base Price" columns.' },
        { status: 400 }
      );
    }

    // Fetch existing products for fast slug/id mapping
    const { data: existingProds } = await supabase
      .from('products')
      .select('id, slug')
      .eq('store_id', STORE_ID);

    const slugToIdMap = new Map<string, string>();
    (existingProds || []).forEach((p: any) => slugToIdMap.set(p.slug, p.id));

    let processedCount = 0;
    let insertedCount = 0;
    let updatedCount = 0;

    // Process in batches of 25 for maximum speed and zero timeouts
    const BATCH_SIZE = 25;
    for (let i = 0; i < dataRows.length; i += BATCH_SIZE) {
      const batch = dataRows.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async (row) => {
          const name = (row[nameIdx] || '').trim();
          if (!name) return;

          const rawSlug = slugIdx !== -1 ? (row[slugIdx] || '').trim() : '';
          const slug = rawSlug || generateSlug(name);
          const price = Number(row[priceIdx]) || 0;
          const comparePrice = compareIdx !== -1 && row[compareIdx] ? Number(row[compareIdx]) : null;
          const stock = stockIdx !== -1 && row[stockIdx] ? Number(row[stockIdx]) : 10;
          const description = descIdx !== -1 ? (row[descIdx] || '').trim() : '';
          
          const images = imgIdx !== -1 && row[imgIdx]
            ? row[imgIdx].split(/[;,|]/).map((s) => s.trim()).filter(Boolean)
            : [];

          const topNotes = topIdx !== -1 && row[topIdx]
            ? row[topIdx].split(/[;,|]/).map((s) => s.trim()).filter(Boolean)
            : [];
          const heartNotes = heartIdx !== -1 && row[heartIdx]
            ? row[heartIdx].split(/[;,|]/).map((s) => s.trim()).filter(Boolean)
            : [];
          const baseNotes = baseIdx !== -1 && row[baseIdx]
            ? row[baseIdx].split(/[;,|]/).map((s) => s.trim()).filter(Boolean)
            : [];

          const ingredients = ingIdx !== -1 && row[ingIdx]
            ? row[ingIdx].split(/[;,|]/).map((s) => s.trim()).filter(Boolean)
            : [];

          const isFeatured = featIdx !== -1 ? row[featIdx]?.toLowerCase() === 'true' : false;
          const isBestseller = bestIdx !== -1 ? row[bestIdx]?.toLowerCase() === 'true' : false;
          const metaTitle = metaTitleIdx !== -1 ? (row[metaTitleIdx] || '').trim() : '';
          const metaDesc = metaDescIdx !== -1 ? (row[metaDescIdx] || '').trim() : '';
          const metaKey = metaKeyIdx !== -1 ? (row[metaKeyIdx] || '').trim() : '';

          const productPayload: Record<string, any> = {
            store_id: STORE_ID,
            name,
            slug,
            description,
            price,
            compare_at_price: comparePrice,
            stock,
            images,
            scent_notes: { top: topNotes, heart: heartNotes, base: baseNotes },
            ingredients,
            is_featured: isFeatured,
            is_bestseller: isBestseller,
            meta_title: metaTitle,
            meta_description: metaDesc,
            meta_keywords: metaKey,
            updated_at: new Date().toISOString(),
          };

          const existingId = slugToIdMap.get(slug);
          let targetProductId = existingId;

          if (existingId) {
            await supabase
              .from('products')
              .update(productPayload)
              .eq('id', existingId)
              .eq('store_id', STORE_ID);
            updatedCount++;
          } else {
            productPayload.created_at = new Date().toISOString();
            const { data: newProd } = await supabase
              .from('products')
              .insert([productPayload])
              .select('id')
              .single();
            if (newProd) {
              targetProductId = newProd.id;
              slugToIdMap.set(slug, newProd.id);
              insertedCount++;
            }
          }

          // Process variants if provided in column (Format: "100 ml:1200:1500:SKU; 1 Kg:4500::SKU2")
          if (targetProductId && varIdx !== -1 && row[varIdx]) {
            const rawVars = row[varIdx].split(';').map((s) => s.trim()).filter(Boolean);
            if (rawVars.length > 0) {
              const variantRows = rawVars.map((vStr) => {
                const parts = vStr.split(':').map((p) => p.trim());
                const vName = parts[0] || '100 ml';
                const vPrice = Number(parts[1]) || price;
                const vCompare = parts[2] ? Number(parts[2]) : null;
                const vSku = parts[3] || null;
                return {
                  store_id: STORE_ID,
                  product_id: targetProductId,
                  name: vName,
                  sku: vSku,
                  price: vPrice,
                  compare_at_price: vCompare,
                };
              });

              await supabase
                .from('product_variants')
                .delete()
                .eq('store_id', STORE_ID)
                .eq('product_id', targetProductId);

              await supabase.from('product_variants').insert(variantRows);
            }
          }

          processedCount++;
        })
      );
    }

    return NextResponse.json({
      success: true,
      message: `CSV import completed: ${processedCount} products processed (${insertedCount} new, ${updatedCount} updated).`,
      stats: { processedCount, insertedCount, updatedCount },
    });
  } catch (err: any) {
    console.error('Error importing products CSV:', err);
    return NextResponse.json({ error: err.message || 'Import failed' }, { status: 500 });
  }
}
