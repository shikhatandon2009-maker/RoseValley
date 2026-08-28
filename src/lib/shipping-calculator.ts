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

export interface ShippingCalculationResult {
  isDomestic: boolean;
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
    net_weight?: number;
    weight_unit?: string;
    gross_weight?: number;
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

  // 1. Calculate Total Net Weight & Subtotal (in grams & INR)
  let totalNetGrams = 0;
  let computedSubtotalINR = 0;

  for (const item of items) {
    const q = Number(item.quantity) || 1;
    const qty = q > 99 ? 1 : Math.max(1, q);
    const p = Number(item.price) || 0;
    computedSubtotalINR += p * qty;

    let unitNetGrams = 100; // default 100ml / 100gm net
    if (item.net_weight && Number(item.net_weight) > 0) {
      const nw = Number(item.net_weight);
      unitNetGrams = (item.weight_unit === 'kg' || item.weight_unit === 'L') ? nw * 1000 : nw;
    } else if (item.gross_weight && Number(item.gross_weight) > 0) {
      const gw = Number(item.gross_weight);
      const grossGrams = (item.weight_unit === 'kg' || item.weight_unit === 'L') ? gw * 1000 : gw;
      unitNetGrams = grossGrams / 1.20;
    } else {
      // Heuristic extraction from item name or variant
      const text = `${item.name || ''} ${item.variantName || ''}`.toLowerCase();
      if (text.includes('20 kg')) unitNetGrams = 20000;
      else if (text.includes('10 kg')) unitNetGrams = 10000;
      else if (text.includes('5 kg')) unitNetGrams = 5000;
      else if (text.includes('1 kg') || text.includes('1 litre') || text.includes('1 l')) unitNetGrams = 1000;
      else if (text.includes('500 ml') || text.includes('500 gm') || text.includes('500g')) unitNetGrams = 500;
      else if (text.includes('250 ml') || text.includes('250 gm') || text.includes('250g')) unitNetGrams = 250;
      else if (text.includes('100 ml') || text.includes('100 gm') || text.includes('100g')) unitNetGrams = 100;
      else if (text.includes('50 ml') || text.includes('50 gm')) unitNetGrams = 50;
      else if (text.includes('10 ml') || text.includes('10 gm')) unitNetGrams = 10;
      else if (text.includes('2ml') || text.includes('sample')) unitNetGrams = 2;
      else unitNetGrams = 100;
    }

    totalNetGrams += unitNetGrams * qty;
  }

  const effectiveSubtotalINR = typeof orderSubtotalINR === 'number' ? orderSubtotalINR : computedSubtotalINR;
  const totalNetWeightKg = Number((totalNetGrams / 1000).toFixed(3));

  // 2. Gross Weight = Total Net Weight + 20%
  const totalGrossWeightGrams = Math.round(totalNetGrams * 1.20);
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
