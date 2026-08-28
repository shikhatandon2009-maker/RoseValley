export interface StandardVariantItem {
  name: string;
  sku?: string;
  price: number;
  compare_at_price?: number | null;
  net_weight: number;
  weight_unit: string;
  gross_weight: number;
  item_shipping_cost: number;
}

/**
 * Standard pricing formula for perfume oils / scents:
 * Base price (b) represents 1 Kg price.
 */
export function computeStandardVariants(basePrice: number | string): StandardVariantItem[] {
  const b = Math.max(10, Number(basePrice) || 1000);
  return [
    {
      name: 'Sample (2ml)',
      sku: '',
      price: 250,
      compare_at_price: 300,
      net_weight: 2,
      weight_unit: 'ml',
      gross_weight: 2.4,
      item_shipping_cost: 0,
    },
    {
      name: '100 ml',
      sku: '',
      price: Math.round(b / 10 + 200),
      compare_at_price: Math.round((b / 10 + 200) * 1.2),
      net_weight: 100,
      weight_unit: 'ml',
      gross_weight: 120,
      item_shipping_cost: 0,
    },
    {
      name: '250 ml',
      sku: '',
      price: Math.round(b / 4 + 200),
      compare_at_price: Math.round((b / 4 + 200) * 1.2),
      net_weight: 250,
      weight_unit: 'ml',
      gross_weight: 300,
      item_shipping_cost: 0,
    },
    {
      name: '500 ml',
      sku: '',
      price: Math.round(b / 2 + 200),
      compare_at_price: Math.round((b / 2 + 200) * 1.2),
      net_weight: 500,
      weight_unit: 'ml',
      gross_weight: 600,
      item_shipping_cost: 0,
    },
    {
      name: '1 Kg',
      sku: '',
      price: b,
      compare_at_price: Math.round(b * 1.2),
      net_weight: 1,
      weight_unit: 'kg',
      gross_weight: 1.2,
      item_shipping_cost: 0,
    },
    {
      name: '5 Kg',
      sku: '',
      price: Math.round(b * 5 * 0.98),
      compare_at_price: Math.round(b * 5 * 1.15),
      net_weight: 5,
      weight_unit: 'kg',
      gross_weight: 6.0,
      item_shipping_cost: 0,
    },
    {
      name: '10 Kg',
      sku: '',
      price: Math.round(b * 10 * 0.96),
      compare_at_price: Math.round(b * 10 * 1.15),
      net_weight: 10,
      weight_unit: 'kg',
      gross_weight: 12.0,
      item_shipping_cost: 0,
    },
    {
      name: '20 Kg',
      sku: '',
      price: Math.round(b * 20 * 0.93),
      compare_at_price: Math.round(b * 20 * 1.15),
      net_weight: 20,
      weight_unit: 'kg',
      gross_weight: 24.0,
      item_shipping_cost: 0,
    },
  ];
}

/**
 * Clean and format text into a valid URL slug
 */
export function sanitizeSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
