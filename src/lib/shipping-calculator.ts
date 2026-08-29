/**
 * Luxury Perfumes & Essential Oils Store - Shipping & Logistics Calculation Engine
 * 
 * Rules:
 * 1. Gross Weight = Net Weight * 1.20 (+20% packaging buffer, e.g., 2.25 kg net -> 2.70 kg gross)
 * 2. India Domestic:
 *    - Structured weight slab table from 10ml up to 200 Kg gross.
 *    - Over 200 Kg: Flat ₹100 / kg.
 * 3. International / Export:
 *    - Up to 200 Kg: $9 USD / kg with a Minimum of $30 USD.
 *    - Over 200 Kg (Tiered by Region):
 *        * USA, Canada: $8 USD / kg
 *        * Asiana (East/SE Asia): $8 USD / kg
 *        * Asia Pacific (AU, NZ): $6 USD / kg
 *        * Gulf & Middle East: $6 USD / kg
 *        * Africa: $11 USD / kg
 *        * South America: $10 USD / kg
 *        * Europe: $7 USD / kg
 *        * Rest of World: $9 USD / kg
 *    - Minimum export charge: $30 USD.
 */

export interface WeightSlab {
  maxKg: number;
  rateINR: number;
  label: string;
}

export const DEFAULT_INDIA_WEIGHT_SLABS: WeightSlab[] = [
  { maxKg: 0.1, rateINR: 60, label: 'Up to 100 gm (Sample / 10ml-50ml)' },
  { maxKg: 0.25, rateINR: 80, label: 'Up to 250 gm (100ml Attar)' },
  { maxKg: 0.5, rateINR: 100, label: 'Up to 500 gm' },
  { maxKg: 1.0, rateINR: 140, label: 'Up to 1.0 Kg' },
  { maxKg: 2.0, rateINR: 200, label: 'Up to 2.0 Kg' },
  { maxKg: 5.0, rateINR: 380, label: 'Up to 5.0 Kg' },
  { maxKg: 10.0, rateINR: 650, label: 'Up to 10.0 Kg' },
  { maxKg: 20.0, rateINR: 1100, label: 'Up to 20.0 Kg' },
  { maxKg: 50.0, rateINR: 2500, label: 'Up to 50.0 Kg' },
  { maxKg: 100.0, rateINR: 4600, label: 'Up to 100.0 Kg' },
  { maxKg: 200.0, rateINR: 8000, label: 'Up to 200.0 Kg' },
];

export type ExportRegion = 
  | 'usa_canada'
  | 'asiana'
  | 'asia_pacific'
  | 'gulf_middle_east'
  | 'africa'
  | 'south_america'
  | 'europe'
  | 'rest_of_world';

export interface ExportRegionConfig {
  region: ExportRegion;
  name: string;
  under200KgRateUSD: number;
  over200KgRateUSD: number;
  minChargeUSD: number;
  countryCodes: string[];
}

export const EXPORT_REGIONS: Record<ExportRegion, ExportRegionConfig> = {
  usa_canada: {
    region: 'usa_canada',
    name: 'USA & Canada',
    under200KgRateUSD: 9,
    over200KgRateUSD: 8,
    minChargeUSD: 30,
    countryCodes: ['US', 'CA', 'USA', 'CAN'],
  },
  asiana: {
    region: 'asiana',
    name: 'Asiana (East & SE Asia)',
    under200KgRateUSD: 9,
    over200KgRateUSD: 8,
    minChargeUSD: 30,
    countryCodes: ['JP', 'KR', 'CN', 'HK', 'TW', 'SG', 'MY', 'TH', 'VN', 'PH', 'ID'],
  },
  asia_pacific: {
    region: 'asia_pacific',
    name: 'Asia Pacific',
    under200KgRateUSD: 9,
    over200KgRateUSD: 6,
    minChargeUSD: 30,
    countryCodes: ['AU', 'NZ', 'FJ', 'PG'],
  },
  gulf_middle_east: {
    region: 'gulf_middle_east',
    name: 'Gulf & Middle East',
    under200KgRateUSD: 9,
    over200KgRateUSD: 6,
    minChargeUSD: 30,
    countryCodes: ['AE', 'SA', 'QA', 'OM', 'KW', 'BH', 'JO', 'LB'],
  },
  africa: {
    region: 'africa',
    name: 'Africa',
    under200KgRateUSD: 9,
    over200KgRateUSD: 11,
    minChargeUSD: 30,
    countryCodes: ['ZA', 'NG', 'KE', 'EG', 'GH', 'MA', 'TZ', 'UG', 'ET', 'DZ', 'MU'],
  },
  south_america: {
    region: 'south_america',
    name: 'South America',
    under200KgRateUSD: 9,
    over200KgRateUSD: 10,
    minChargeUSD: 30,
    countryCodes: ['BR', 'AR', 'CL', 'CO', 'PE', 'EC', 'UY', 'VE', 'BO', 'PY'],
  },
  europe: {
    region: 'europe',
    name: 'Europe & UK',
    under200KgRateUSD: 9,
    over200KgRateUSD: 7,
    minChargeUSD: 30,
    countryCodes: [
      'GB', 'FR', 'DE', 'IT', 'ES', 'NL', 'BE', 'AT', 'GR', 'PT', 
      'IE', 'LU', 'MC', 'FI', 'SE', 'NO', 'DK', 'HU', 'CZ', 'PL', 
      'RO', 'IS', 'UA', 'CH'
    ],
  },
  rest_of_world: {
    region: 'rest_of_world',
    name: 'Rest of World',
    under200KgRateUSD: 9,
    over200KgRateUSD: 9,
    minChargeUSD: 30,
    countryCodes: [],
  },
};

/**
 * Resolve country code to Export Region
 */
export function getExportRegionForCountry(countryCode: string): ExportRegionConfig {
  const code = (countryCode || '').toUpperCase().trim();
  for (const key of Object.keys(EXPORT_REGIONS) as ExportRegion[]) {
    const reg = EXPORT_REGIONS[key];
    if (reg.countryCodes.includes(code)) {
      return reg;
    }
  }
  return EXPORT_REGIONS.rest_of_world;
}

export interface ItemWeightBreakdown {
  unitNetGrams: number;
  unitGrossGrams: number;
  totalNetGrams: number;
  totalGrossGrams: number;
  totalNetKg: number;
  totalGrossKg: number;
  formattedNet: string;
  formattedGross: string;
}

/**
 * Robust Item Weight Extractor that accurately handles ml, g, kg, and text heuristics
 */
export function extractItemWeights(item: {
  net_weight?: number | string;
  weight_unit?: string;
  gross_weight?: number | string;
  quantity?: number;
  name?: string;
  variantName?: string;
  [key: string]: any;
}): ItemWeightBreakdown {
  const q = Math.max(1, Number(item.quantity) || 1);
  const text = `${item.variantName || ''} ${item.name || ''}`.toLowerCase();
  const rawUnit = (item.weight_unit || '').toLowerCase().trim();
  const rawNet = Number(item.net_weight);
  const rawGross = Number(item.gross_weight);

  // 1. Is unit explicitly in Kg or Litres?
  const isKgUnit = 
    rawUnit === 'kg' || rawUnit === 'kgs' || rawUnit === 'kilo' || rawUnit === 'kilogram' || rawUnit === 'kilograms' ||
    rawUnit === 'l' || rawUnit === 'lt' || rawUnit === 'ltr' || rawUnit === 'liter' || rawUnit === 'litre' || rawUnit === 'litres';

  // 2. Extract numeric weight mentions from variant / product name
  const kgMatch = /\b(\d+(?:\.\d+)?)\s*(?:kg|kgs|kilo|kilogram|kilograms|litre|liter|l|ltr)\b/i.exec(text);
  const gMatch = /\b(\d+(?:\.\d+)?)\s*(?:ml|milliliter|gm|g|gram|grams)\b/i.exec(text);

  let unitNetGrams = 100; // default 100g

  if (kgMatch) {
    unitNetGrams = parseFloat(kgMatch[1]) * 1000;
  } else if (gMatch) {
    unitNetGrams = parseFloat(gMatch[1]);
  } else if (!isNaN(rawNet) && rawNet > 0) {
    if (isKgUnit) {
      unitNetGrams = rawNet * 1000;
    } else if (rawNet <= 25 && !text.includes('sample') && !text.includes('2ml') && !text.includes('10ml')) {
      // Numbers <= 25 without 'ml' (like 1, 5, 10) are kilograms
      unitNetGrams = rawNet * 1000;
    } else {
      unitNetGrams = rawNet;
    }
  } else if (!isNaN(rawGross) && rawGross > 0) {
    if (isKgUnit || (rawGross <= 30 && !text.includes('sample'))) {
      unitNetGrams = (rawGross * 1000) / 1.20;
    } else {
      unitNetGrams = rawGross / 1.20;
    }
  }

  // Unit Gross Weight = Net Weight + 20% packaging overhead
  let unitGrossGrams = Math.round(unitNetGrams * 1.20);
  if (!isNaN(rawGross) && rawGross > 0) {
    const rawGrossGrams = isKgUnit ? Math.round(rawGross * 1000) : Math.round(rawGross);
    if (rawGrossGrams >= unitNetGrams) {
      unitGrossGrams = rawGrossGrams;
    }
  }

  const totalNetGrams = Math.round(unitNetGrams * q);
  const totalGrossGrams = Math.round(unitGrossGrams * q);
  const totalNetKg = Number((totalNetGrams / 1000).toFixed(3));
  const totalGrossKg = Number((totalGrossGrams / 1000).toFixed(3));

  const formattedNet = totalNetGrams >= 1000
    ? `${totalNetGrams % 1000 === 0 ? totalNetGrams / 1000 : (totalNetGrams / 1000).toFixed(2)} Kg`
    : `${totalNetGrams}g`;

  const formattedGross = totalGrossGrams >= 1000
    ? `${totalGrossGrams % 1000 === 0 ? totalGrossGrams / 1000 : (totalGrossGrams / 1000).toFixed(2)} Kg`
    : `${totalGrossGrams}g`;

  return {
    unitNetGrams,
    unitGrossGrams,
    totalNetGrams,
    totalGrossGrams,
    totalNetKg,
    totalGrossKg,
    formattedNet,
    formattedGross,
  };
}

export interface ShippingCalculationResult {
  isDomestic: boolean;
  totalNetWeightGrams: number;
  totalNetWeightKg: number;
  totalGrossWeightKg: number;
  totalGrossWeightGrams: number;
  shippingFeeINR: number;
  shippingFeeTargetCurrency: number;
  currency: string;
  exchangeRate: number;
  appliedRatePerKgUSD?: number;
  isMinChargeApplied?: boolean;
  isFreeShippingApplied?: boolean;
  regionName?: string;
  slabLabel?: string;
  isOver200Kg: boolean;
}

/**
 * Robust Shipping Calculator based on exact User Logic
 */
export function calculateWeightBasedShipping({
  items,
  destinationCountryCode = 'IN',
  targetCurrency = 'INR',
  rates = { INR: 1.0, USD: 0.012, EUR: 0.011, GBP: 0.0095, AED: 0.044 },
  customIndiaSlabs = DEFAULT_INDIA_WEIGHT_SLABS,
  freeShippingThresholdINR = 0,
  orderSubtotalINR,
}: {
  items: Array<{
    net_weight?: number | string;
    weight_unit?: string;
    gross_weight?: number | string;
    quantity: number;
    name?: string;
    variantName?: string;
    price?: number;
    item_shipping_cost?: number;
    [key: string]: any;
  }>;
  destinationCountryCode?: string;
  targetCurrency?: string;
  rates?: Record<string, number>;
  customIndiaSlabs?: WeightSlab[];
  freeShippingThresholdINR?: number;
  orderSubtotalINR?: number;
}): ShippingCalculationResult {
  const isDomestic = (destinationCountryCode || 'IN').toUpperCase() === 'IN';

  // 1. Calculate Total Net Weight, Gross Weight & Subtotal (in grams & INR)
  let totalNetGrams = 0;
  let totalGrossWeightGrams = 0;
  let computedSubtotalINR = 0;

  for (const item of items) {
    const q = Number(item.quantity) || 1;
    const qty = q > 99 ? 1 : Math.max(1, q);
    const p = Number(item.price) || 0;
    computedSubtotalINR += p * qty;

    const breakdown = extractItemWeights(item);
    totalNetGrams += breakdown.unitNetGrams * qty;
    totalGrossWeightGrams += breakdown.unitGrossGrams * qty;
  }

  const effectiveSubtotalINR = typeof orderSubtotalINR === 'number' ? orderSubtotalINR : computedSubtotalINR;
  const totalNetWeightGrams = totalNetGrams;
  const totalNetWeightKg = Number((totalNetGrams / 1000).toFixed(3));
  const totalGrossWeightKg = Number((totalGrossWeightGrams / 1000).toFixed(3));
  const isOver200Kg = totalGrossWeightKg > 200;

  // Conversion rates: USD to INR conversion base (typically ~83-84 INR per USD)
  const usdRateInStore = rates['USD'] || 0.012;
  const inrPerUSD = usdRateInStore > 0 ? (1 / usdRateInStore) : 83.33;

  if (isDomestic) {
    // ----------------------------------------------------
    // INDIA DOMESTIC SHIPPING
    // ----------------------------------------------------
    let shippingFeeINR = 0;
    let slabLabel = '';
    let isFreeShippingApplied = false;

    // Check Free Shipping Threshold (if configured > 0)
    if (freeShippingThresholdINR > 0 && effectiveSubtotalINR >= freeShippingThresholdINR) {
      shippingFeeINR = 0;
      slabLabel = `Free Shipping Qualified (Orders over ₹${freeShippingThresholdINR.toLocaleString('en-IN')})`;
      isFreeShippingApplied = true;
    } else if (isOver200Kg) {
      // Over 200 Kg: Flat ₹100 per kg
      shippingFeeINR = Math.round(totalGrossWeightKg * 100);
      slabLabel = `Bulk Cargo Over 200 Kg (₹100/kg × ${totalGrossWeightKg} Kg)`;
    } else {
      // Find matching slab from sizes 10ml (0.012 kg) to 200 Kg
      const sortedSlabs = [...customIndiaSlabs].sort((a, b) => a.maxKg - b.maxKg);
      let matched = sortedSlabs.find(s => totalGrossWeightKg <= s.maxKg);
      if (!matched) {
        matched = sortedSlabs[sortedSlabs.length - 1];
      }
      shippingFeeINR = matched ? matched.rateINR : Math.max(100, Math.ceil(totalGrossWeightKg) * 80);
      slabLabel = matched ? matched.label : `Weight Slab (${totalGrossWeightKg} Kg)`;
    }

    return {
      isDomestic: true,
      totalNetWeightGrams,
      totalNetWeightKg,
      totalGrossWeightKg,
      totalGrossWeightGrams,
      shippingFeeINR,
      shippingFeeTargetCurrency: shippingFeeINR,
      currency: 'INR',
      exchangeRate: 1.0,
      slabLabel,
      isOver200Kg,
      isFreeShippingApplied,
    };
  } else {
    // ----------------------------------------------------
    // INTERNATIONAL / EXPORT SHIPPING
    // ----------------------------------------------------
    const regionConfig = getExportRegionForCountry(destinationCountryCode);
    const applicableRatePerKgUSD = isOver200Kg 
      ? regionConfig.over200KgRateUSD 
      : regionConfig.under200KgRateUSD;

    // Minimum charge: $30 USD
    const minChargeUSD = regionConfig.minChargeUSD || 30;

    // Calculate USD shipping cost
    const billedKg = Math.max(0.1, totalGrossWeightKg);
    const calculatedUSD = billedKg * applicableRatePerKgUSD;
    const isMinChargeApplied = calculatedUSD < minChargeUSD;
    const finalShippingUSD = Math.max(minChargeUSD, calculatedUSD);

    // Convert USD to INR (for internal payment gateway / database)
    const shippingFeeINR = Math.round(finalShippingUSD * inrPerUSD);

    // Convert to User Target Currency
    let shippingFeeTargetCurrency = finalShippingUSD;
    const targetCurr = targetCurrency.toUpperCase();

    if (targetCurr === 'INR') {
      shippingFeeTargetCurrency = shippingFeeINR;
    } else if (targetCurr === 'USD') {
      shippingFeeTargetCurrency = Number(finalShippingUSD.toFixed(2));
    } else {
      // Use relative rate between USD and Target Currency
      const targetRateAgainstINR = rates[targetCurr] || usdRateInStore;
      const targetToUSD = targetRateAgainstINR / usdRateInStore;
      shippingFeeTargetCurrency = Number((finalShippingUSD * targetToUSD).toFixed(2));
    }

    return {
      isDomestic: false,
      totalNetWeightGrams,
      totalNetWeightKg,
      totalGrossWeightKg,
      totalGrossWeightGrams,
      shippingFeeINR,
      shippingFeeTargetCurrency,
      currency: targetCurrency,
      exchangeRate: inrPerUSD,
      appliedRatePerKgUSD: applicableRatePerKgUSD,
      isMinChargeApplied,
      regionName: regionConfig.name,
      slabLabel: isOver200Kg
        ? `${regionConfig.name} Bulk Freight ($${applicableRatePerKgUSD}/kg for ${totalGrossWeightKg} kg)`
        : `Export Air Express ($${applicableRatePerKgUSD}/kg${isMinChargeApplied ? ' • Min $30 applied' : ''})`,
      isOver200Kg,
    };
  }
}
