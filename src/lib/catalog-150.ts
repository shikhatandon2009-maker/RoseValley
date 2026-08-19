export interface CatalogProduct {
  id: string;
  store_id?: string;
  name: string;
  slug: string;
  category_slug?: string;
  category_id?: string;
  description: string;
  price: number;
  compare_at_price?: number;
  stock: number;
  images: string[];
  scent_notes?: { top?: string[]; heart?: string[]; base?: string[] };
  ingredients?: string[];
  is_featured?: boolean;
  is_bestseller?: boolean;
  created_at?: string;
}

export const CATALOG_150_PRODUCTS: CatalogProduct[] = [
  {
    "id": "rvk-prod-001-actress-fragrance-",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Actress Fragrance Concentrate",
    "slug": "actress-fragrance-concentrate",
    "category_slug": "artisanal-perfumes",
    "description": "100% Pure, hydro-distilled Actress Fragrance Concentrate crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 1200,
    "compare_at_price": 1500,
    "stock": 15,
    "images": [
      "/images/hero/champaca-bottle.png"
    ],
    "scent_notes": {
      "top": [
        "Actress Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Actress Fragrance Concentrate Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Actress Fragrance Concentrate Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": true,
    "is_bestseller": true,
    "created_at": "2026-08-19T02:20:48.869Z"
  },
  {
    "id": "rvk-prod-002-african-sandalwood",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "African Sandalwood Oil",
    "slug": "african-sandalwood-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled African Sandalwood Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 1300,
    "compare_at_price": 1600,
    "stock": 22,
    "images": [
      "/images/hero/champaca-bottle.png"
    ],
    "scent_notes": {
      "top": [
        "African Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "African Sandalwood Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure African Sandalwood Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": true,
    "is_bestseller": true,
    "created_at": "2026-08-19T01:20:48.870Z"
  },
  {
    "id": "rvk-prod-003-agarwood-oudh-atta",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Agarwood ( Oudh ) Attar",
    "slug": "agarwood-oudh-attar",
    "category_slug": "royal-attars",
    "description": "100% Pure, hydro-distilled Agarwood ( Oudh ) Attar crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 1500,
    "compare_at_price": 1800,
    "stock": 29,
    "images": [
      "/uploads/hero/champaca_bottle_1786262252250.png"
    ],
    "scent_notes": {
      "top": [
        "Agarwood Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Agarwood ( Oudh ) Attar Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Agarwood ( Oudh ) Attar Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": true,
    "is_bestseller": true,
    "created_at": "2026-08-19T00:20:48.870Z"
  },
  {
    "id": "rvk-prod-004-agarwood-oil-oud-h",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Agarwood Oil (Oud Hindi)",
    "slug": "agarwood-oil-oud-hindi",
    "category_slug": "royal-attars",
    "description": "100% Pure, hydro-distilled Agarwood Oil (Oud Hindi) crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 1600,
    "compare_at_price": 2000,
    "stock": 36,
    "images": [
      "/uploads/hero/champaca_bottle_1786262252250.png"
    ],
    "scent_notes": {
      "top": [
        "Agarwood Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Agarwood Oil (Oud Hindi) Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Agarwood Oil (Oud Hindi) Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": true,
    "is_bestseller": true,
    "created_at": "2026-08-18T23:20:48.870Z"
  },
  {
    "id": "rvk-prod-005-agarwood-oil-natur",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Agarwood Oil Natural Identical",
    "slug": "agarwood-oil-natural-identical",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Agarwood Oil Natural Identical crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 1700,
    "compare_at_price": 2100,
    "stock": 43,
    "images": [
      "/uploads/hero/champaca_bottle_1786262252250.png"
    ],
    "scent_notes": {
      "top": [
        "Agarwood Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Agarwood Oil Natural Identical Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Agarwood Oil Natural Identical Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": true,
    "is_bestseller": true,
    "created_at": "2026-08-18T22:20:48.870Z"
  },
  {
    "id": "rvk-prod-006-ajowain-oil",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Ajowain Oil",
    "slug": "ajowain-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Ajowain Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 1900,
    "compare_at_price": 2300,
    "stock": 50,
    "images": [
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Ajowain Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Ajowain Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Ajowain Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": true,
    "is_bestseller": true,
    "created_at": "2026-08-18T21:20:48.870Z"
  },
  {
    "id": "rvk-prod-007-allspice-essential",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Allspice Essential Oil",
    "slug": "allspice-essential-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Allspice Essential Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 2000,
    "compare_at_price": 2400,
    "stock": 57,
    "images": [
      "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Allspice Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Allspice Essential Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Allspice Essential Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": true,
    "is_bestseller": true,
    "created_at": "2026-08-18T20:20:48.870Z"
  },
  {
    "id": "rvk-prod-008-aloe-vera-fragranc",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Aloe Vera Fragrance Concentrate",
    "slug": "aloe-vera-fragrance-concentrate",
    "category_slug": "artisanal-perfumes",
    "description": "100% Pure, hydro-distilled Aloe Vera Fragrance Concentrate crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 2200,
    "compare_at_price": 2700,
    "stock": 19,
    "images": [
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Aloe Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Aloe Vera Fragrance Concentrate Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Aloe Vera Fragrance Concentrate Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": true,
    "is_bestseller": true,
    "created_at": "2026-08-18T19:20:48.870Z"
  },
  {
    "id": "rvk-prod-009-alpha-damascone",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Alpha Damascone",
    "slug": "alpha-damascone",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Alpha Damascone crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 2300,
    "compare_at_price": 2800,
    "stock": 26,
    "images": [
      "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Alpha Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Alpha Damascone Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Alpha Damascone Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": true,
    "is_bestseller": false,
    "created_at": "2026-08-18T18:20:48.870Z"
  },
  {
    "id": "rvk-prod-010-alpha-ionone",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Alpha Ionone",
    "slug": "alpha-ionone",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Alpha Ionone crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 2400,
    "compare_at_price": 2900,
    "stock": 33,
    "images": [
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Alpha Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Alpha Ionone Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Alpha Ionone Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": true,
    "is_bestseller": false,
    "created_at": "2026-08-18T17:20:48.870Z"
  },
  {
    "id": "rvk-prod-011-alpha-phellandrene",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Alpha Phellandrene",
    "slug": "alpha-phellandrene",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Alpha Phellandrene crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 2600,
    "compare_at_price": 3200,
    "stock": 40,
    "images": [
      "/images/hero/champaca-bottle.png"
    ],
    "scent_notes": {
      "top": [
        "Alpha Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Alpha Phellandrene Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Alpha Phellandrene Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": true,
    "is_bestseller": false,
    "created_at": "2026-08-18T16:20:48.870Z"
  },
  {
    "id": "rvk-prod-012-alpha-pinene-ex-eu",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Alpha Pinene Ex Eucalyptus Oil",
    "slug": "alpha-pinene-ex-eucalyptus-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Alpha Pinene Ex Eucalyptus Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 2700,
    "compare_at_price": 3300,
    "stock": 47,
    "images": [
      "/uploads/hero/ruhkhus1_removebg_preview_1786261510836.png"
    ],
    "scent_notes": {
      "top": [
        "Alpha Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Alpha Pinene Ex Eucalyptus Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Alpha Pinene Ex Eucalyptus Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": true,
    "is_bestseller": false,
    "created_at": "2026-08-18T15:20:48.870Z"
  },
  {
    "id": "rvk-prod-013-alpha-pinene-ex-tu",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Alpha Pinene Ex Turpentine Oil",
    "slug": "alpha-pinene-ex-turpentine-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Alpha Pinene Ex Turpentine Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 2800,
    "compare_at_price": 3400,
    "stock": 54,
    "images": [
      "/uploads/hero/ruhkhus1_removebg_preview_1786261510836.png"
    ],
    "scent_notes": {
      "top": [
        "Alpha Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Alpha Pinene Ex Turpentine Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Alpha Pinene Ex Turpentine Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": true,
    "created_at": "2026-08-18T14:20:48.870Z"
  },
  {
    "id": "rvk-prod-014-alpha-terpinene",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Alpha Terpinene",
    "slug": "alpha-terpinene",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Alpha Terpinene crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 3000,
    "compare_at_price": 3700,
    "stock": 16,
    "images": [
      "/uploads/hero/ruhkhus1_removebg_preview_1786261510836.png"
    ],
    "scent_notes": {
      "top": [
        "Alpha Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Alpha Terpinene Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Alpha Terpinene Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-18T13:20:48.870Z"
  },
  {
    "id": "rvk-prod-015-alpha-terpinyl-ace",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Alpha Terpinyl Acetate",
    "slug": "alpha-terpinyl-acetate",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Alpha Terpinyl Acetate crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 3100,
    "compare_at_price": 3800,
    "stock": 23,
    "images": [
      "/uploads/hero/champaca_bottle_1786262252250.png"
    ],
    "scent_notes": {
      "top": [
        "Alpha Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Alpha Terpinyl Acetate Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Alpha Terpinyl Acetate Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-18T12:20:48.870Z"
  },
  {
    "id": "rvk-prod-016-amber-oil-brown",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Amber Oil Brown",
    "slug": "amber-oil-brown",
    "category_slug": "luxury-elixirs-blends",
    "description": "100% Pure, hydro-distilled Amber Oil Brown crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 3300,
    "compare_at_price": 4000,
    "stock": 30,
    "images": [
      "/uploads/hero/ai_bottle_1786262186076.png"
    ],
    "scent_notes": {
      "top": [
        "Amber Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Amber Oil Brown Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Amber Oil Brown Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": true,
    "is_bestseller": false,
    "created_at": "2026-08-18T11:20:48.870Z"
  },
  {
    "id": "rvk-prod-017-amber-oil-white",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Amber Oil White",
    "slug": "amber-oil-white",
    "category_slug": "luxury-elixirs-blends",
    "description": "100% Pure, hydro-distilled Amber Oil White crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 3400,
    "compare_at_price": 4100,
    "stock": 37,
    "images": [
      "/uploads/hero/ai_bottle_1786262186076.png"
    ],
    "scent_notes": {
      "top": [
        "Amber Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Amber Oil White Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Amber Oil White Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-18T10:20:48.870Z"
  },
  {
    "id": "rvk-prod-018-amber-solid-incens",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Amber Solid Incense",
    "slug": "amber-solid-incense",
    "category_slug": "luxury-elixirs-blends",
    "description": "100% Pure, hydro-distilled Amber Solid Incense crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 3500,
    "compare_at_price": 4300,
    "stock": 44,
    "images": [
      "/uploads/hero/ai_bottle_1786262186076.png"
    ],
    "scent_notes": {
      "top": [
        "Amber Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Amber Solid Incense Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Amber Solid Incense Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-18T09:20:48.870Z"
  },
  {
    "id": "rvk-prod-019-ambergris-oil",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Ambergris Oil",
    "slug": "ambergris-oil",
    "category_slug": "luxury-elixirs-blends",
    "description": "100% Pure, hydro-distilled Ambergris Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 3700,
    "compare_at_price": 4500,
    "stock": 51,
    "images": [
      "/uploads/hero/ai_bottle_1786262186076.png"
    ],
    "scent_notes": {
      "top": [
        "Ambergris Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Ambergris Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Ambergris Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-18T08:20:48.870Z"
  },
  {
    "id": "rvk-prod-020-ambrette-seed-oil",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Ambrette Seed Oil",
    "slug": "ambrette-seed-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Ambrette Seed Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 3800,
    "compare_at_price": 4600,
    "stock": 58,
    "images": [
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Ambrette Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Ambrette Seed Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Ambrette Seed Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-18T07:20:48.870Z"
  },
  {
    "id": "rvk-prod-021-ambrettolide",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Ambrettolide",
    "slug": "ambrettolide",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Ambrettolide crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 3900,
    "compare_at_price": 4800,
    "stock": 20,
    "images": [
      "/images/hero/champaca-bottle.png"
    ],
    "scent_notes": {
      "top": [
        "Ambrettolide Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Ambrettolide Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Ambrettolide Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-18T06:20:48.870Z"
  },
  {
    "id": "rvk-prod-022-ambroxan",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Ambroxan",
    "slug": "ambroxan",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Ambroxan crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 4100,
    "compare_at_price": 5000,
    "stock": 27,
    "images": [
      "/uploads/hero/ruhkhus1_removebg_preview_1786261510836.png"
    ],
    "scent_notes": {
      "top": [
        "Ambroxan Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Ambroxan Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Ambroxan Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-18T05:20:48.870Z"
  },
  {
    "id": "rvk-prod-023-amyris-oil",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Amyris Oil",
    "slug": "amyris-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Amyris Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 4200,
    "compare_at_price": 5100,
    "stock": 34,
    "images": [
      "/uploads/hero/ai_bottle_1786262186076.png"
    ],
    "scent_notes": {
      "top": [
        "Amyris Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Amyris Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Amyris Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-18T04:20:48.870Z"
  },
  {
    "id": "rvk-prod-024-angelica-root-oil",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Angelica Root Oil",
    "slug": "angelica-root-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Angelica Root Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 4400,
    "compare_at_price": 5400,
    "stock": 41,
    "images": [
      "/uploads/hero/image__5__1786261765122.png"
    ],
    "scent_notes": {
      "top": [
        "Angelica Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Angelica Root Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Angelica Root Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-18T03:20:48.870Z"
  },
  {
    "id": "rvk-prod-025-anise-star-oil",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Anise Star Oil",
    "slug": "anise-star-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Anise Star Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 4500,
    "compare_at_price": 5500,
    "stock": 48,
    "images": [
      "/uploads/hero/champaca_bottle_1786262252250.png"
    ],
    "scent_notes": {
      "top": [
        "Anise Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Anise Star Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Anise Star Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": true,
    "created_at": "2026-08-18T02:20:48.870Z"
  },
  {
    "id": "rvk-prod-026-aniseed-oil",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Aniseed Oil",
    "slug": "aniseed-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Aniseed Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 4600,
    "compare_at_price": 5600,
    "stock": 55,
    "images": [
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Aniseed Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Aniseed Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Aniseed Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-18T01:20:48.870Z"
  },
  {
    "id": "rvk-prod-027-apricot-kernel-oil",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Apricot Kernel Oil",
    "slug": "apricot-kernel-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Apricot Kernel Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 4800,
    "compare_at_price": 5900,
    "stock": 17,
    "images": [
      "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Apricot Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Apricot Kernel Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Apricot Kernel Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-18T00:20:48.870Z"
  },
  {
    "id": "rvk-prod-028-argan-oil",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Argan Oil",
    "slug": "argan-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Argan Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 1300,
    "compare_at_price": 1600,
    "stock": 24,
    "images": [
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Argan Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Argan Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Argan Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-17T23:20:48.870Z"
  },
  {
    "id": "rvk-prod-029-armoise-oil",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Armoise Oil",
    "slug": "armoise-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Armoise Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 1400,
    "compare_at_price": 1700,
    "stock": 31,
    "images": [
      "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Armoise Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Armoise Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Armoise Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-17T22:20:48.870Z"
  },
  {
    "id": "rvk-prod-030-arnica-oil",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Arnica Oil",
    "slug": "arnica-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Arnica Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 1600,
    "compare_at_price": 2000,
    "stock": 38,
    "images": [
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Arnica Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Arnica Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Arnica Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-17T21:20:48.870Z"
  },
  {
    "id": "rvk-prod-031-asafoetida-oil",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Asafoetida Oil",
    "slug": "asafoetida-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Asafoetida Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 1700,
    "compare_at_price": 2100,
    "stock": 45,
    "images": [
      "/images/hero/champaca-bottle.png"
    ],
    "scent_notes": {
      "top": [
        "Asafoetida Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Asafoetida Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Asafoetida Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": true,
    "is_bestseller": false,
    "created_at": "2026-08-17T20:20:48.870Z"
  },
  {
    "id": "rvk-prod-032-avocado-oil",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Avocado Oil",
    "slug": "avocado-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Avocado Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 1800,
    "compare_at_price": 2200,
    "stock": 52,
    "images": [
      "/uploads/hero/ruhkhus1_removebg_preview_1786261510836.png"
    ],
    "scent_notes": {
      "top": [
        "Avocado Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Avocado Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Avocado Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-17T19:20:48.870Z"
  },
  {
    "id": "rvk-prod-033-bakuchi-babchi-oil",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Bakuchi (Babchi) Oil",
    "slug": "bakuchi-babchi-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Bakuchi (Babchi) Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 2000,
    "compare_at_price": 2400,
    "stock": 59,
    "images": [
      "/uploads/hero/ai_bottle_1786262186076.png"
    ],
    "scent_notes": {
      "top": [
        "Bakuchi Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Bakuchi (Babchi) Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Bakuchi (Babchi) Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-17T18:20:48.870Z"
  },
  {
    "id": "rvk-prod-034-bakuchiol-99-ex-ps",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "\"Bakuchiol 99% Ex psoralea corylifolia",
    "slug": "bakuchiol-99-ex-psoralea-corylifolia",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled \"Bakuchiol 99% Ex psoralea corylifolia crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 2100,
    "compare_at_price": 2600,
    "stock": 21,
    "images": [
      "/uploads/hero/image__5__1786261765122.png"
    ],
    "scent_notes": {
      "top": [
        "\"Bakuchiol Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "\"Bakuchiol 99% Ex psoralea corylifolia Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure \"Bakuchiol 99% Ex psoralea corylifolia Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-17T17:20:48.870Z"
  },
  {
    "id": "rvk-prod-035-balsam-peru-oil",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Balsam Peru Oil",
    "slug": "balsam-peru-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Balsam Peru Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 2300,
    "compare_at_price": 2800,
    "stock": 28,
    "images": [
      "/uploads/hero/champaca_bottle_1786262252250.png"
    ],
    "scent_notes": {
      "top": [
        "Balsam Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Balsam Peru Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Balsam Peru Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-17T16:20:48.870Z"
  },
  {
    "id": "rvk-prod-036-balsam-peru-oil-vi",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Balsam Peru Oil (Viscous resin)",
    "slug": "balsam-peru-oil-viscous-resin",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Balsam Peru Oil (Viscous resin) crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 2400,
    "compare_at_price": 2900,
    "stock": 35,
    "images": [
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Balsam Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Balsam Peru Oil (Viscous resin) Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Balsam Peru Oil (Viscous resin) Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-17T15:20:48.870Z"
  },
  {
    "id": "rvk-prod-037-balsam-tolu-oil",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Balsam Tolu Oil",
    "slug": "balsam-tolu-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Balsam Tolu Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 2500,
    "compare_at_price": 3100,
    "stock": 42,
    "images": [
      "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Balsam Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Balsam Tolu Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Balsam Tolu Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": true,
    "created_at": "2026-08-17T14:20:48.870Z"
  },
  {
    "id": "rvk-prod-038-basil-oil",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Basil Oil",
    "slug": "basil-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Basil Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 2700,
    "compare_at_price": 3300,
    "stock": 49,
    "images": [
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Basil Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Basil Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Basil Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-17T13:20:48.870Z"
  },
  {
    "id": "rvk-prod-039-bay-leaf-oilbay-oi",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Bay Leaf Oil/Bay Oil",
    "slug": "bay-leaf-oilbay-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Bay Leaf Oil/Bay Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 2800,
    "compare_at_price": 3400,
    "stock": 56,
    "images": [
      "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Bay Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Bay Leaf Oil/Bay Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Bay Leaf Oil/Bay Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-17T12:20:48.870Z"
  },
  {
    "id": "rvk-prod-040-benzaldehyde",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Benzaldehyde",
    "slug": "benzaldehyde",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Benzaldehyde crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 2900,
    "compare_at_price": 3500,
    "stock": 18,
    "images": [
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Benzaldehyde Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Benzaldehyde Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Benzaldehyde Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-17T11:20:48.870Z"
  },
  {
    "id": "rvk-prod-041-benzoin-oil-sumatr",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Benzoin Oil (Sumatra)",
    "slug": "benzoin-oil-sumatra",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Benzoin Oil (Sumatra) crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 3100,
    "compare_at_price": 3800,
    "stock": 25,
    "images": [
      "/images/hero/champaca-bottle.png"
    ],
    "scent_notes": {
      "top": [
        "Benzoin Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Benzoin Oil (Sumatra) Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Benzoin Oil (Sumatra) Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-17T10:20:48.871Z"
  },
  {
    "id": "rvk-prod-042-benzyl-acetate",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Benzyl Acetate",
    "slug": "benzyl-acetate",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Benzyl Acetate crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 3200,
    "compare_at_price": 3900,
    "stock": 32,
    "images": [
      "/uploads/hero/ruhkhus1_removebg_preview_1786261510836.png"
    ],
    "scent_notes": {
      "top": [
        "Benzyl Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Benzyl Acetate Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Benzyl Acetate Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-17T09:20:48.871Z"
  },
  {
    "id": "rvk-prod-043-benzyl-alcohol",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Benzyl Alcohol",
    "slug": "benzyl-alcohol",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Benzyl Alcohol crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 3400,
    "compare_at_price": 4100,
    "stock": 39,
    "images": [
      "/uploads/hero/ai_bottle_1786262186076.png"
    ],
    "scent_notes": {
      "top": [
        "Benzyl Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Benzyl Alcohol Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Benzyl Alcohol Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-17T08:20:48.871Z"
  },
  {
    "id": "rvk-prod-044-benzyl-benzoate",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Benzyl Benzoate",
    "slug": "benzyl-benzoate",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Benzyl Benzoate crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 3500,
    "compare_at_price": 4300,
    "stock": 46,
    "images": [
      "/uploads/hero/image__5__1786261765122.png"
    ],
    "scent_notes": {
      "top": [
        "Benzyl Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Benzyl Benzoate Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Benzyl Benzoate Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-17T07:20:48.871Z"
  },
  {
    "id": "rvk-prod-045-bergamot-bergapten",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Bergamot - Bergaptene Free (Calabrian) Oil",
    "slug": "bergamot-bergaptene-free-calabrian-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Bergamot - Bergaptene Free (Calabrian) Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 3600,
    "compare_at_price": 4400,
    "stock": 53,
    "images": [
      "/uploads/hero/image__5__1786261765122.png"
    ],
    "scent_notes": {
      "top": [
        "Bergamot Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Bergamot - Bergaptene Free (Calabrian) Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Bergamot - Bergaptene Free (Calabrian) Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-17T06:20:48.871Z"
  },
  {
    "id": "rvk-prod-046-bergamot-mint-oil-",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Bergamot Mint Oil (Mentha Citrata)",
    "slug": "bergamot-mint-oil-mentha-citrata",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Bergamot Mint Oil (Mentha Citrata) crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 3800,
    "compare_at_price": 4600,
    "stock": 15,
    "images": [
      "/uploads/hero/ruhkhus1_removebg_preview_1786261510836.png"
    ],
    "scent_notes": {
      "top": [
        "Bergamot Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Bergamot Mint Oil (Mentha Citrata) Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Bergamot Mint Oil (Mentha Citrata) Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": true,
    "is_bestseller": false,
    "created_at": "2026-08-17T05:20:48.871Z"
  },
  {
    "id": "rvk-prod-047-bergamot-oil",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Bergamot Oil",
    "slug": "bergamot-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Bergamot Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 3900,
    "compare_at_price": 4800,
    "stock": 22,
    "images": [
      "/uploads/hero/image__5__1786261765122.png"
    ],
    "scent_notes": {
      "top": [
        "Bergamot Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Bergamot Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Bergamot Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-17T04:20:48.871Z"
  },
  {
    "id": "rvk-prod-048-beta-caryophillene",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Beta Caryophillene",
    "slug": "beta-caryophillene",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Beta Caryophillene crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 4000,
    "compare_at_price": 4900,
    "stock": 29,
    "images": [
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Beta Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Beta Caryophillene Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Beta Caryophillene Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-17T03:20:48.871Z"
  },
  {
    "id": "rvk-prod-049-beta-damascone",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Beta Damascone",
    "slug": "beta-damascone",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Beta Damascone crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 4200,
    "compare_at_price": 5100,
    "stock": 36,
    "images": [
      "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Beta Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Beta Damascone Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Beta Damascone Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": true,
    "created_at": "2026-08-17T02:20:48.871Z"
  },
  {
    "id": "rvk-prod-050-beta-ionone",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Beta Ionone",
    "slug": "beta-ionone",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Beta Ionone crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 4300,
    "compare_at_price": 5200,
    "stock": 43,
    "images": [
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Beta Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Beta Ionone Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Beta Ionone Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-17T01:20:48.871Z"
  },
  {
    "id": "rvk-prod-051-beta-pinene",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Beta Pinene",
    "slug": "beta-pinene",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Beta Pinene crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 4500,
    "compare_at_price": 5500,
    "stock": 50,
    "images": [
      "/uploads/hero/ruhkhus1_removebg_preview_1786261510836.png"
    ],
    "scent_notes": {
      "top": [
        "Beta Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Beta Pinene Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Beta Pinene Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-17T00:20:48.871Z"
  },
  {
    "id": "rvk-prod-052-betel-leaf-oil",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Betel Leaf Oil",
    "slug": "betel-leaf-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Betel Leaf Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 4600,
    "compare_at_price": 5600,
    "stock": 57,
    "images": [
      "/uploads/hero/ruhkhus1_removebg_preview_1786261510836.png"
    ],
    "scent_notes": {
      "top": [
        "Betel Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Betel Leaf Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Betel Leaf Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-16T23:20:48.871Z"
  },
  {
    "id": "rvk-prod-053-birch-sweet-oil",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Birch sweet Oil",
    "slug": "birch-sweet-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Birch sweet Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 4700,
    "compare_at_price": 5700,
    "stock": 19,
    "images": [
      "/uploads/hero/ai_bottle_1786262186076.png"
    ],
    "scent_notes": {
      "top": [
        "Birch Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Birch sweet Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Birch sweet Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-16T22:20:48.871Z"
  },
  {
    "id": "rvk-prod-054-birch-tar-oil",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Birch Tar Oil",
    "slug": "birch-tar-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Birch Tar Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 1300,
    "compare_at_price": 1600,
    "stock": 26,
    "images": [
      "/uploads/hero/image__5__1786261765122.png"
    ],
    "scent_notes": {
      "top": [
        "Birch Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Birch Tar Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Birch Tar Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-16T21:20:48.871Z"
  },
  {
    "id": "rvk-prod-055-bitter-orange-oil",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Bitter Orange Oil",
    "slug": "bitter-orange-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Bitter Orange Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 1400,
    "compare_at_price": 1700,
    "stock": 33,
    "images": [
      "/uploads/hero/champaca_bottle_1786262252250.png"
    ],
    "scent_notes": {
      "top": [
        "Bitter Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Bitter Orange Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Bitter Orange Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-16T20:20:48.871Z"
  },
  {
    "id": "rvk-prod-056-black-currant-berr",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Black Currant Berry Absolute",
    "slug": "black-currant-berry-absolute",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Black Currant Berry Absolute crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 1500,
    "compare_at_price": 1800,
    "stock": 40,
    "images": [
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Black Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Black Currant Berry Absolute Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Black Currant Berry Absolute Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-16T19:20:48.871Z"
  },
  {
    "id": "rvk-prod-057-black-pepper-co2-e",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Black Pepper Co2 Extract Oil",
    "slug": "black-pepper-co2-extract-oil",
    "category_slug": "luxury-elixirs-blends",
    "description": "100% Pure, hydro-distilled Black Pepper Co2 Extract Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 1700,
    "compare_at_price": 2100,
    "stock": 47,
    "images": [
      "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Black Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Black Pepper Co2 Extract Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Black Pepper Co2 Extract Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-16T18:20:48.871Z"
  },
  {
    "id": "rvk-prod-058-black-pepper-oil",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Black Pepper Oil",
    "slug": "black-pepper-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Black Pepper Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 1800,
    "compare_at_price": 2200,
    "stock": 54,
    "images": [
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Black Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Black Pepper Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Black Pepper Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-16T17:20:48.871Z"
  },
  {
    "id": "rvk-prod-059-black-seed-oil",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Black Seed Oil",
    "slug": "black-seed-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Black Seed Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 1900,
    "compare_at_price": 2300,
    "stock": 16,
    "images": [
      "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Black Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Black Seed Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Black Seed Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-16T16:20:48.871Z"
  },
  {
    "id": "rvk-prod-060-black-spruce-oil",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Black Spruce Oil",
    "slug": "black-spruce-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Black Spruce Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 2100,
    "compare_at_price": 2600,
    "stock": 23,
    "images": [
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Black Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Black Spruce Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Black Spruce Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-16T15:20:48.871Z"
  },
  {
    "id": "rvk-prod-061-blood-orange-oil",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Blood Orange Oil",
    "slug": "blood-orange-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Blood Orange Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 2200,
    "compare_at_price": 2700,
    "stock": 30,
    "images": [
      "/images/hero/champaca-bottle.png"
    ],
    "scent_notes": {
      "top": [
        "Blood Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Blood Orange Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Blood Orange Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": true,
    "is_bestseller": true,
    "created_at": "2026-08-16T14:20:48.871Z"
  },
  {
    "id": "rvk-prod-062-blue-lotus-absolut",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Blue Lotus Absolute Oil",
    "slug": "blue-lotus-absolute-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Blue Lotus Absolute Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 2400,
    "compare_at_price": 2900,
    "stock": 37,
    "images": [
      "/uploads/hero/ruhkhus1_removebg_preview_1786261510836.png"
    ],
    "scent_notes": {
      "top": [
        "Blue Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Blue Lotus Absolute Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Blue Lotus Absolute Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-16T13:20:48.871Z"
  },
  {
    "id": "rvk-prod-063-blue-spruce-oil",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Blue Spruce Oil",
    "slug": "blue-spruce-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Blue Spruce Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 2500,
    "compare_at_price": 3100,
    "stock": 44,
    "images": [
      "/uploads/hero/ai_bottle_1786262186076.png"
    ],
    "scent_notes": {
      "top": [
        "Blue Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Blue Spruce Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Blue Spruce Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-16T12:20:48.871Z"
  },
  {
    "id": "rvk-prod-064-blue-tansy-oil",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Blue Tansy Oil",
    "slug": "blue-tansy-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Blue Tansy Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 2600,
    "compare_at_price": 3200,
    "stock": 51,
    "images": [
      "/uploads/hero/image__5__1786261765122.png"
    ],
    "scent_notes": {
      "top": [
        "Blue Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Blue Tansy Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Blue Tansy Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-16T11:20:48.871Z"
  },
  {
    "id": "rvk-prod-065-broom-absolute",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Broom Absolute",
    "slug": "broom-absolute",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Broom Absolute crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 2800,
    "compare_at_price": 3400,
    "stock": 58,
    "images": [
      "/uploads/hero/champaca_bottle_1786262252250.png"
    ],
    "scent_notes": {
      "top": [
        "Broom Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Broom Absolute Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Broom Absolute Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-16T10:20:48.871Z"
  },
  {
    "id": "rvk-prod-066-cade-oil",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Cade Oil",
    "slug": "cade-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Cade Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 2900,
    "compare_at_price": 3500,
    "stock": 20,
    "images": [
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Cade Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Cade Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Cade Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-16T09:20:48.871Z"
  },
  {
    "id": "rvk-prod-067-cajeput-oil",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Cajeput Oil",
    "slug": "cajeput-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Cajeput Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 3000,
    "compare_at_price": 3700,
    "stock": 27,
    "images": [
      "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Cajeput Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Cajeput Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Cajeput Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-16T08:20:48.871Z"
  },
  {
    "id": "rvk-prod-068-calamus-oil-high-a",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Calamus Oil (high Asaron)",
    "slug": "calamus-oil-high-asaron",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Calamus Oil (high Asaron) crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 3200,
    "compare_at_price": 3900,
    "stock": 34,
    "images": [
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Calamus Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Calamus Oil (high Asaron) Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Calamus Oil (high Asaron) Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-16T07:20:48.871Z"
  },
  {
    "id": "rvk-prod-069-calamus-oil-natura",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Calamus Oil (Natural Identical)",
    "slug": "calamus-oil-natural-identical",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Calamus Oil (Natural Identical) crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 3300,
    "compare_at_price": 4000,
    "stock": 41,
    "images": [
      "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Calamus Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Calamus Oil (Natural Identical) Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Calamus Oil (Natural Identical) Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-16T06:20:48.871Z"
  },
  {
    "id": "rvk-prod-070-calendula-infused-",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Calendula infused Oil",
    "slug": "calendula-infused-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Calendula infused Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 3500,
    "compare_at_price": 4300,
    "stock": 48,
    "images": [
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Calendula Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Calendula infused Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Calendula infused Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-16T05:20:48.871Z"
  },
  {
    "id": "rvk-prod-071-calendula-oil",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Calendula oil",
    "slug": "calendula-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Calendula oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 3600,
    "compare_at_price": 4400,
    "stock": 55,
    "images": [
      "/images/hero/champaca-bottle.png"
    ],
    "scent_notes": {
      "top": [
        "Calendula Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Calendula oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Calendula oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-16T04:20:48.871Z"
  },
  {
    "id": "rvk-prod-072-cambodian-agarwood",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Cambodian Agarwood Oil",
    "slug": "cambodian-agarwood-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Cambodian Agarwood Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 3700,
    "compare_at_price": 4500,
    "stock": 17,
    "images": [
      "/uploads/hero/ruhkhus1_removebg_preview_1786261510836.png"
    ],
    "scent_notes": {
      "top": [
        "Cambodian Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Cambodian Agarwood Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Cambodian Agarwood Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-16T03:20:48.871Z"
  },
  {
    "id": "rvk-prod-073-camphor-oil-brown",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Camphor Oil Brown",
    "slug": "camphor-oil-brown",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Camphor Oil Brown crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 3900,
    "compare_at_price": 4800,
    "stock": 24,
    "images": [
      "/uploads/hero/ai_bottle_1786262186076.png"
    ],
    "scent_notes": {
      "top": [
        "Camphor Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Camphor Oil Brown Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Camphor Oil Brown Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": true,
    "created_at": "2026-08-16T02:20:48.871Z"
  },
  {
    "id": "rvk-prod-074-camphor-oil-white",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Camphor Oil White",
    "slug": "camphor-oil-white",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Camphor Oil White crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 4000,
    "compare_at_price": 4900,
    "stock": 31,
    "images": [
      "/uploads/hero/image__5__1786261765122.png"
    ],
    "scent_notes": {
      "top": [
        "Camphor Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Camphor Oil White Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Camphor Oil White Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-16T01:20:48.871Z"
  },
  {
    "id": "rvk-prod-075-capsicum-oleoresin",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Capsicum oleoresin",
    "slug": "capsicum-oleoresin",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Capsicum oleoresin crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 4100,
    "compare_at_price": 5000,
    "stock": 38,
    "images": [
      "/uploads/hero/champaca_bottle_1786262252250.png"
    ],
    "scent_notes": {
      "top": [
        "Capsicum Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Capsicum oleoresin Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Capsicum oleoresin Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-16T00:20:48.871Z"
  },
  {
    "id": "rvk-prod-076-caraway-oil",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Caraway Oil",
    "slug": "caraway-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Caraway Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 4300,
    "compare_at_price": 5200,
    "stock": 45,
    "images": [
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Caraway Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Caraway Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Caraway Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": true,
    "is_bestseller": false,
    "created_at": "2026-08-15T23:20:48.871Z"
  },
  {
    "id": "rvk-prod-077-cardamom-oil",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Cardamom Oil",
    "slug": "cardamom-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Cardamom Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 4400,
    "compare_at_price": 5400,
    "stock": 52,
    "images": [
      "/uploads/hero/ai_bottle_1786262186076.png"
    ],
    "scent_notes": {
      "top": [
        "Cardamom Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Cardamom Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Cardamom Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-15T22:20:48.871Z"
  },
  {
    "id": "rvk-prod-078-cardamom-oil-fcc",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Cardamom Oil FCC",
    "slug": "cardamom-oil-fcc",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Cardamom Oil FCC crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 4500,
    "compare_at_price": 5500,
    "stock": 59,
    "images": [
      "/uploads/hero/ai_bottle_1786262186076.png"
    ],
    "scent_notes": {
      "top": [
        "Cardamom Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Cardamom Oil FCC Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Cardamom Oil FCC Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-15T21:20:48.871Z"
  },
  {
    "id": "rvk-prod-079-carnation-absolute",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Carnation Absolute",
    "slug": "carnation-absolute",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Carnation Absolute crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 4700,
    "compare_at_price": 5700,
    "stock": 21,
    "images": [
      "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Carnation Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Carnation Absolute Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Carnation Absolute Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-15T20:20:48.871Z"
  },
  {
    "id": "rvk-prod-080-carrot-seed-co2-ex",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Carrot Seed Co2 Extract Oil",
    "slug": "carrot-seed-co2-extract-oil",
    "category_slug": "luxury-elixirs-blends",
    "description": "100% Pure, hydro-distilled Carrot Seed Co2 Extract Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 1200,
    "compare_at_price": 1500,
    "stock": 28,
    "images": [
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Carrot Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Carrot Seed Co2 Extract Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Carrot Seed Co2 Extract Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-15T19:20:48.871Z"
  },
  {
    "id": "rvk-prod-081-carrot-seed-oil",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Carrot Seed Oil",
    "slug": "carrot-seed-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Carrot Seed Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 1400,
    "compare_at_price": 1700,
    "stock": 35,
    "images": [
      "/images/hero/champaca-bottle.png"
    ],
    "scent_notes": {
      "top": [
        "Carrot Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Carrot Seed Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Carrot Seed Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-15T18:20:48.871Z"
  },
  {
    "id": "rvk-prod-082-carrot-seed-oil-hi",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Carrot Seed Oil (high caratol)",
    "slug": "carrot-seed-oil-high-caratol",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Carrot Seed Oil (high caratol) crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 1500,
    "compare_at_price": 1800,
    "stock": 42,
    "images": [
      "/uploads/hero/ruhkhus1_removebg_preview_1786261510836.png"
    ],
    "scent_notes": {
      "top": [
        "Carrot Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Carrot Seed Oil (high caratol) Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Carrot Seed Oil (high caratol) Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-15T17:20:48.871Z"
  },
  {
    "id": "rvk-prod-083-cassia-oil-ip-grad",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Cassia Oil IP Grade",
    "slug": "cassia-oil-ip-grade",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Cassia Oil IP Grade crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 1600,
    "compare_at_price": 2000,
    "stock": 49,
    "images": [
      "/uploads/hero/ai_bottle_1786262186076.png"
    ],
    "scent_notes": {
      "top": [
        "Cassia Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Cassia Oil IP Grade Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Cassia Oil IP Grade Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-15T16:20:48.871Z"
  },
  {
    "id": "rvk-prod-084-cassie-sweet-absol",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Cassie Sweet Absolute",
    "slug": "cassie-sweet-absolute",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Cassie Sweet Absolute crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 1800,
    "compare_at_price": 2200,
    "stock": 56,
    "images": [
      "/uploads/hero/image__5__1786261765122.png"
    ],
    "scent_notes": {
      "top": [
        "Cassie Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Cassie Sweet Absolute Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Cassie Sweet Absolute Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-15T15:20:48.871Z"
  },
  {
    "id": "rvk-prod-085-catnip-oil-lemon-t",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Catnip Oil Lemon Type",
    "slug": "catnip-oil-lemon-type",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Catnip Oil Lemon Type crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 1900,
    "compare_at_price": 2300,
    "stock": 18,
    "images": [
      "/uploads/hero/champaca_bottle_1786262252250.png"
    ],
    "scent_notes": {
      "top": [
        "Catnip Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Catnip Oil Lemon Type Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Catnip Oil Lemon Type Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": true,
    "created_at": "2026-08-15T14:20:48.871Z"
  },
  {
    "id": "rvk-prod-086-cedarwood-oil-atla",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Cedarwood Oil Atlas",
    "slug": "cedarwood-oil-atlas",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Cedarwood Oil Atlas crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 2000,
    "compare_at_price": 2400,
    "stock": 25,
    "images": [
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Cedarwood Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Cedarwood Oil Atlas Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Cedarwood Oil Atlas Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-15T13:20:48.871Z"
  },
  {
    "id": "rvk-prod-087-cedarwood-oil-hima",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Cedarwood Oil Himalayan",
    "slug": "cedarwood-oil-himalayan",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Cedarwood Oil Himalayan crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 2200,
    "compare_at_price": 2700,
    "stock": 32,
    "images": [
      "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Cedarwood Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Cedarwood Oil Himalayan Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Cedarwood Oil Himalayan Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-15T12:20:48.871Z"
  },
  {
    "id": "rvk-prod-088-cedarwood-oil-texa",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Cedarwood Oil Texas",
    "slug": "cedarwood-oil-texas",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Cedarwood Oil Texas crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 2300,
    "compare_at_price": 2800,
    "stock": 39,
    "images": [
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Cedarwood Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Cedarwood Oil Texas Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Cedarwood Oil Texas Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-15T11:20:48.871Z"
  },
  {
    "id": "rvk-prod-089-cedarwood-oil-virg",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Cedarwood Oil Virginian",
    "slug": "cedarwood-oil-virginian",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Cedarwood Oil Virginian crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 2500,
    "compare_at_price": 3100,
    "stock": 46,
    "images": [
      "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Cedarwood Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Cedarwood Oil Virginian Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Cedarwood Oil Virginian Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-15T10:20:48.871Z"
  },
  {
    "id": "rvk-prod-090-celery-seed-oil",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Celery Seed Oil",
    "slug": "celery-seed-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Celery Seed Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 2600,
    "compare_at_price": 3200,
    "stock": 53,
    "images": [
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Celery Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Celery Seed Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Celery Seed Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-15T09:20:48.871Z"
  },
  {
    "id": "rvk-prod-091-chamomile-german-o",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Chamomile German Oil India",
    "slug": "chamomile-german-oil-india",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Chamomile German Oil India crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 2700,
    "compare_at_price": 3300,
    "stock": 15,
    "images": [
      "/images/hero/champaca-bottle.png"
    ],
    "scent_notes": {
      "top": [
        "Chamomile Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Chamomile German Oil India Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Chamomile German Oil India Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": true,
    "is_bestseller": false,
    "created_at": "2026-08-15T08:20:48.871Z"
  },
  {
    "id": "rvk-prod-092-chamomile-german-o",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Chamomile German Oil Nepal",
    "slug": "chamomile-german-oil-nepal",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Chamomile German Oil Nepal crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 2900,
    "compare_at_price": 3500,
    "stock": 22,
    "images": [
      "/uploads/hero/ruhkhus1_removebg_preview_1786261510836.png"
    ],
    "scent_notes": {
      "top": [
        "Chamomile Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Chamomile German Oil Nepal Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Chamomile German Oil Nepal Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-15T07:20:48.871Z"
  },
  {
    "id": "rvk-prod-093-chamomile-german-w",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Chamomile German Water",
    "slug": "chamomile-german-water",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Chamomile German Water crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 3000,
    "compare_at_price": 3700,
    "stock": 29,
    "images": [
      "/uploads/hero/ai_bottle_1786262186076.png"
    ],
    "scent_notes": {
      "top": [
        "Chamomile Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Chamomile German Water Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Chamomile German Water Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-15T06:20:48.871Z"
  },
  {
    "id": "rvk-prod-094-chamomile-oil-yell",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Chamomile Oil Yellow",
    "slug": "chamomile-oil-yellow",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Chamomile Oil Yellow crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 3100,
    "compare_at_price": 3800,
    "stock": 36,
    "images": [
      "/uploads/hero/image__5__1786261765122.png"
    ],
    "scent_notes": {
      "top": [
        "Chamomile Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Chamomile Oil Yellow Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Chamomile Oil Yellow Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-15T05:20:48.871Z"
  },
  {
    "id": "rvk-prod-095-chamomile-roman-oi",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Chamomile Roman Oil",
    "slug": "chamomile-roman-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Chamomile Roman Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 3300,
    "compare_at_price": 4000,
    "stock": 43,
    "images": [
      "/uploads/hero/champaca_bottle_1786262252250.png"
    ],
    "scent_notes": {
      "top": [
        "Chamomile Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Chamomile Roman Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Chamomile Roman Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-15T04:20:48.871Z"
  },
  {
    "id": "rvk-prod-096-champaca-absolute",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Champaca Absolute",
    "slug": "champaca-absolute",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Champaca Absolute crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 3400,
    "compare_at_price": 4100,
    "stock": 50,
    "images": [
      "/images/hero/champaca-bottle.png"
    ],
    "scent_notes": {
      "top": [
        "Champaca Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Champaca Absolute Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Champaca Absolute Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-15T03:20:48.871Z"
  },
  {
    "id": "rvk-prod-097-champaca-attar",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Champaca Attar",
    "slug": "champaca-attar",
    "category_slug": "royal-attars",
    "description": "100% Pure, hydro-distilled Champaca Attar crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 3600,
    "compare_at_price": 4400,
    "stock": 57,
    "images": [
      "/images/hero/champaca-bottle.png"
    ],
    "scent_notes": {
      "top": [
        "Champaca Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Champaca Attar Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Champaca Attar Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": true,
    "created_at": "2026-08-15T02:20:48.871Z"
  },
  {
    "id": "rvk-prod-098-champaca-leaf-oil",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Champaca Leaf Oil",
    "slug": "champaca-leaf-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Champaca Leaf Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 3700,
    "compare_at_price": 4500,
    "stock": 19,
    "images": [
      "/images/hero/champaca-bottle.png"
    ],
    "scent_notes": {
      "top": [
        "Champaca Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Champaca Leaf Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Champaca Leaf Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-15T01:20:48.871Z"
  },
  {
    "id": "rvk-prod-099-champaca-sc-absolu",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Champaca SC Absolute",
    "slug": "champaca-sc-absolute",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Champaca SC Absolute crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 3800,
    "compare_at_price": 4600,
    "stock": 26,
    "images": [
      "/images/hero/champaca-bottle.png"
    ],
    "scent_notes": {
      "top": [
        "Champaca Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Champaca SC Absolute Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Champaca SC Absolute Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-15T00:20:48.871Z"
  },
  {
    "id": "rvk-prod-100-cherry-fragrance-c",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Cherry Fragrance Concentrate",
    "slug": "cherry-fragrance-concentrate",
    "category_slug": "artisanal-perfumes",
    "description": "100% Pure, hydro-distilled Cherry Fragrance Concentrate crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 4000,
    "compare_at_price": 4900,
    "stock": 33,
    "images": [
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Cherry Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Cherry Fragrance Concentrate Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Cherry Fragrance Concentrate Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-14T23:20:48.871Z"
  },
  {
    "id": "rvk-prod-101-chili-seed-oil",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Chili Seed Oil",
    "slug": "chili-seed-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Chili Seed Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 4100,
    "compare_at_price": 5000,
    "stock": 40,
    "images": [
      "/images/hero/champaca-bottle.png"
    ],
    "scent_notes": {
      "top": [
        "Chili Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Chili Seed Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Chili Seed Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-14T22:20:48.871Z"
  },
  {
    "id": "rvk-prod-102-chypre-absolute",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Chypre Absolute",
    "slug": "chypre-absolute",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Chypre Absolute crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 4200,
    "compare_at_price": 5100,
    "stock": 47,
    "images": [
      "/uploads/hero/ruhkhus1_removebg_preview_1786261510836.png"
    ],
    "scent_notes": {
      "top": [
        "Chypre Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Chypre Absolute Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Chypre Absolute Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-14T21:20:48.871Z"
  },
  {
    "id": "rvk-prod-103-cinnamic-acetate",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Cinnamic Acetate",
    "slug": "cinnamic-acetate",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Cinnamic Acetate crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 4400,
    "compare_at_price": 5400,
    "stock": 54,
    "images": [
      "/uploads/hero/ai_bottle_1786262186076.png"
    ],
    "scent_notes": {
      "top": [
        "Cinnamic Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Cinnamic Acetate Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Cinnamic Acetate Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-14T20:20:48.871Z"
  },
  {
    "id": "rvk-prod-104-cinnamic-alcohol",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Cinnamic Alcohol",
    "slug": "cinnamic-alcohol",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Cinnamic Alcohol crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 4500,
    "compare_at_price": 5500,
    "stock": 16,
    "images": [
      "/uploads/hero/image__5__1786261765122.png"
    ],
    "scent_notes": {
      "top": [
        "Cinnamic Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Cinnamic Alcohol Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Cinnamic Alcohol Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-14T19:20:48.871Z"
  },
  {
    "id": "rvk-prod-105-cinnamic-aldehyde",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Cinnamic Aldehyde",
    "slug": "cinnamic-aldehyde",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Cinnamic Aldehyde crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 4600,
    "compare_at_price": 5600,
    "stock": 23,
    "images": [
      "/uploads/hero/champaca_bottle_1786262252250.png"
    ],
    "scent_notes": {
      "top": [
        "Cinnamic Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Cinnamic Aldehyde Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Cinnamic Aldehyde Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-14T18:20:48.871Z"
  },
  {
    "id": "rvk-prod-106-cinnamon-bark-oil-",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Cinnamon Bark Oil Dark",
    "slug": "cinnamon-bark-oil-dark",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Cinnamon Bark Oil Dark crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 4800,
    "compare_at_price": 5900,
    "stock": 30,
    "images": [
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Cinnamon Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Cinnamon Bark Oil Dark Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Cinnamon Bark Oil Dark Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": true,
    "is_bestseller": false,
    "created_at": "2026-08-14T17:20:48.871Z"
  },
  {
    "id": "rvk-prod-107-cinnamon-bark-oil-",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Cinnamon Bark Oil Light",
    "slug": "cinnamon-bark-oil-light",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Cinnamon Bark Oil Light crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 1300,
    "compare_at_price": 1600,
    "stock": 37,
    "images": [
      "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Cinnamon Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Cinnamon Bark Oil Light Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Cinnamon Bark Oil Light Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-14T16:20:48.871Z"
  },
  {
    "id": "rvk-prod-108-cinnamon-cassia-ba",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Cinnamon Cassia Bark Co2 Extract",
    "slug": "cinnamon-cassia-bark-co2-extract",
    "category_slug": "luxury-elixirs-blends",
    "description": "100% Pure, hydro-distilled Cinnamon Cassia Bark Co2 Extract crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 1500,
    "compare_at_price": 1800,
    "stock": 44,
    "images": [
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Cinnamon Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Cinnamon Cassia Bark Co2 Extract Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Cinnamon Cassia Bark Co2 Extract Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-14T15:20:48.871Z"
  },
  {
    "id": "rvk-prod-109-cinnamon-leaf-oil-",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Cinnamon Leaf Oil (Aldehyde Type)",
    "slug": "cinnamon-leaf-oil-aldehyde-type",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Cinnamon Leaf Oil (Aldehyde Type) crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 1600,
    "compare_at_price": 2000,
    "stock": 51,
    "images": [
      "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Cinnamon Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Cinnamon Leaf Oil (Aldehyde Type) Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Cinnamon Leaf Oil (Aldehyde Type) Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": true,
    "created_at": "2026-08-14T14:20:48.871Z"
  },
  {
    "id": "rvk-prod-110-cinnamon-leaf-oil-",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Cinnamon Leaf Oil (Eugenol Type)",
    "slug": "cinnamon-leaf-oil-eugenol-type",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Cinnamon Leaf Oil (Eugenol Type) crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 1700,
    "compare_at_price": 2100,
    "stock": 58,
    "images": [
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Cinnamon Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Cinnamon Leaf Oil (Eugenol Type) Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Cinnamon Leaf Oil (Eugenol Type) Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-14T13:20:48.871Z"
  },
  {
    "id": "rvk-prod-111-cis-3-hexenol",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Cis 3 Hexenol",
    "slug": "cis-3-hexenol",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Cis 3 Hexenol crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 1900,
    "compare_at_price": 2300,
    "stock": 20,
    "images": [
      "/images/hero/champaca-bottle.png"
    ],
    "scent_notes": {
      "top": [
        "Cis Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Cis 3 Hexenol Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Cis 3 Hexenol Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-14T12:20:48.871Z"
  },
  {
    "id": "rvk-prod-112-cis-3-hexenyl-acet",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Cis 3 hexenyl Acetate",
    "slug": "cis-3-hexenyl-acetate",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Cis 3 hexenyl Acetate crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 2000,
    "compare_at_price": 2400,
    "stock": 27,
    "images": [
      "/uploads/hero/ruhkhus1_removebg_preview_1786261510836.png"
    ],
    "scent_notes": {
      "top": [
        "Cis Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Cis 3 hexenyl Acetate Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Cis 3 hexenyl Acetate Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-14T11:20:48.871Z"
  },
  {
    "id": "rvk-prod-113-cis-3-hexenyl-benz",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Cis 3 Hexenyl Benzoate",
    "slug": "cis-3-hexenyl-benzoate",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Cis 3 Hexenyl Benzoate crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 2100,
    "compare_at_price": 2600,
    "stock": 34,
    "images": [
      "/uploads/hero/ai_bottle_1786262186076.png"
    ],
    "scent_notes": {
      "top": [
        "Cis Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Cis 3 Hexenyl Benzoate Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Cis 3 Hexenyl Benzoate Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-14T10:20:48.871Z"
  },
  {
    "id": "rvk-prod-114-cis-3-hexenyl-sali",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Cis 3 Hexenyl Salicylate",
    "slug": "cis-3-hexenyl-salicylate",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Cis 3 Hexenyl Salicylate crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 2300,
    "compare_at_price": 2800,
    "stock": 41,
    "images": [
      "/uploads/hero/image__5__1786261765122.png"
    ],
    "scent_notes": {
      "top": [
        "Cis Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Cis 3 Hexenyl Salicylate Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Cis 3 Hexenyl Salicylate Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-14T09:20:48.871Z"
  },
  {
    "id": "rvk-prod-115-citral",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Citral",
    "slug": "citral",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Citral crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 2400,
    "compare_at_price": 2900,
    "stock": 48,
    "images": [
      "/uploads/hero/champaca_bottle_1786262252250.png"
    ],
    "scent_notes": {
      "top": [
        "Citral Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Citral Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Citral Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-14T08:20:48.871Z"
  },
  {
    "id": "rvk-prod-116-citron-citrus-medi",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Citron (Citrus Medica) Oil",
    "slug": "citron-citrus-medica-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Citron (Citrus Medica) Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 2600,
    "compare_at_price": 3200,
    "stock": 55,
    "images": [
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Citron Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Citron (Citrus Medica) Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Citron (Citrus Medica) Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-14T07:20:48.871Z"
  },
  {
    "id": "rvk-prod-117-citronella-oil-jav",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Citronella Oil Java",
    "slug": "citronella-oil-java",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Citronella Oil Java crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 2700,
    "compare_at_price": 3300,
    "stock": 17,
    "images": [
      "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Citronella Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Citronella Oil Java Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Citronella Oil Java Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-14T06:20:48.871Z"
  },
  {
    "id": "rvk-prod-118-citronellol",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Citronellol",
    "slug": "citronellol",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Citronellol crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 2800,
    "compare_at_price": 3400,
    "stock": 24,
    "images": [
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Citronellol Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Citronellol Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Citronellol Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-14T05:20:48.871Z"
  },
  {
    "id": "rvk-prod-119-citronellyl-acetat",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Citronellyl Acetate",
    "slug": "citronellyl-acetate",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Citronellyl Acetate crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 3000,
    "compare_at_price": 3700,
    "stock": 31,
    "images": [
      "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Citronellyl Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Citronellyl Acetate Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Citronellyl Acetate Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-14T04:20:48.871Z"
  },
  {
    "id": "rvk-prod-120-citronellyl-format",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Citronellyl Formate",
    "slug": "citronellyl-formate",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Citronellyl Formate crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 3100,
    "compare_at_price": 3800,
    "stock": 38,
    "images": [
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Citronellyl Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Citronellyl Formate Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Citronellyl Formate Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-14T03:20:48.871Z"
  },
  {
    "id": "rvk-prod-121-citronellyl-propio",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Citronellyl Propionate",
    "slug": "citronellyl-propionate",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Citronellyl Propionate crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 3200,
    "compare_at_price": 3900,
    "stock": 45,
    "images": [
      "/images/hero/champaca-bottle.png"
    ],
    "scent_notes": {
      "top": [
        "Citronellyl Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Citronellyl Propionate Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Citronellyl Propionate Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": true,
    "is_bestseller": true,
    "created_at": "2026-08-14T02:20:48.871Z"
  },
  {
    "id": "rvk-prod-122-clary-sage-oil",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Clary sage Oil",
    "slug": "clary-sage-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Clary sage Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 3400,
    "compare_at_price": 4100,
    "stock": 52,
    "images": [
      "/uploads/hero/ruhkhus1_removebg_preview_1786261510836.png"
    ],
    "scent_notes": {
      "top": [
        "Clary Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Clary sage Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Clary sage Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-14T01:20:48.871Z"
  },
  {
    "id": "rvk-prod-123-clementine-oil",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Clementine Oil",
    "slug": "clementine-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Clementine Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 3500,
    "compare_at_price": 4300,
    "stock": 59,
    "images": [
      "/uploads/hero/ai_bottle_1786262186076.png"
    ],
    "scent_notes": {
      "top": [
        "Clementine Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Clementine Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Clementine Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-14T00:20:48.871Z"
  },
  {
    "id": "rvk-prod-124-clove-bud-oil",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Clove Bud Oil",
    "slug": "clove-bud-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Clove Bud Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 3700,
    "compare_at_price": 4500,
    "stock": 21,
    "images": [
      "/uploads/hero/ai_bottle_1786262186076.png"
    ],
    "scent_notes": {
      "top": [
        "Clove Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Clove Bud Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Clove Bud Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-13T23:20:48.871Z"
  },
  {
    "id": "rvk-prod-125-clove-co2-extract-",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Clove Co2 Extract Oil",
    "slug": "clove-co2-extract-oil",
    "category_slug": "luxury-elixirs-blends",
    "description": "100% Pure, hydro-distilled Clove Co2 Extract Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 3800,
    "compare_at_price": 4600,
    "stock": 28,
    "images": [
      "/uploads/hero/ai_bottle_1786262186076.png"
    ],
    "scent_notes": {
      "top": [
        "Clove Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Clove Co2 Extract Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Clove Co2 Extract Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-13T22:20:48.871Z"
  },
  {
    "id": "rvk-prod-126-clove-leaf-oil",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Clove Leaf Oil",
    "slug": "clove-leaf-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Clove Leaf Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 3900,
    "compare_at_price": 4800,
    "stock": 35,
    "images": [
      "/uploads/hero/ai_bottle_1786262186076.png"
    ],
    "scent_notes": {
      "top": [
        "Clove Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Clove Leaf Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Clove Leaf Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-13T21:20:48.871Z"
  },
  {
    "id": "rvk-prod-127-clove-oil-85-eugen",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Clove Oil 85% Eugenol",
    "slug": "clove-oil-85-eugenol",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Clove Oil 85% Eugenol crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 4100,
    "compare_at_price": 5000,
    "stock": 42,
    "images": [
      "/uploads/hero/ai_bottle_1786262186076.png"
    ],
    "scent_notes": {
      "top": [
        "Clove Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Clove Oil 85% Eugenol Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Clove Oil 85% Eugenol Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-13T20:20:48.871Z"
  },
  {
    "id": "rvk-prod-128-coconut-fragrance-",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Coconut Fragrance Concentrate",
    "slug": "coconut-fragrance-concentrate",
    "category_slug": "artisanal-perfumes",
    "description": "100% Pure, hydro-distilled Coconut Fragrance Concentrate crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 4200,
    "compare_at_price": 5100,
    "stock": 49,
    "images": [
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Coconut Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Coconut Fragrance Concentrate Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Coconut Fragrance Concentrate Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-13T19:20:48.871Z"
  },
  {
    "id": "rvk-prod-129-coffee-co2-extract",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Coffee Co2 Extract Oil",
    "slug": "coffee-co2-extract-oil",
    "category_slug": "luxury-elixirs-blends",
    "description": "100% Pure, hydro-distilled Coffee Co2 Extract Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 4300,
    "compare_at_price": 5200,
    "stock": 56,
    "images": [
      "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Coffee Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Coffee Co2 Extract Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Coffee Co2 Extract Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-13T18:20:48.871Z"
  },
  {
    "id": "rvk-prod-130-copaiba-balsam-oil",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Copaiba Balsam Oil",
    "slug": "copaiba-balsam-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Copaiba Balsam Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 4500,
    "compare_at_price": 5500,
    "stock": 18,
    "images": [
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Copaiba Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Copaiba Balsam Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Copaiba Balsam Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-13T17:20:48.871Z"
  },
  {
    "id": "rvk-prod-131-coriander-seed-co2",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Coriander Seed Co2 Extract Oil",
    "slug": "coriander-seed-co2-extract-oil",
    "category_slug": "luxury-elixirs-blends",
    "description": "100% Pure, hydro-distilled Coriander Seed Co2 Extract Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 4600,
    "compare_at_price": 5600,
    "stock": 25,
    "images": [
      "/images/hero/champaca-bottle.png"
    ],
    "scent_notes": {
      "top": [
        "Coriander Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Coriander Seed Co2 Extract Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Coriander Seed Co2 Extract Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-13T16:20:48.871Z"
  },
  {
    "id": "rvk-prod-132-coriander-seed-oil",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Coriander Seed Oil",
    "slug": "coriander-seed-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Coriander Seed Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 4700,
    "compare_at_price": 5700,
    "stock": 32,
    "images": [
      "/uploads/hero/ruhkhus1_removebg_preview_1786261510836.png"
    ],
    "scent_notes": {
      "top": [
        "Coriander Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Coriander Seed Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Coriander Seed Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-13T15:20:48.871Z"
  },
  {
    "id": "rvk-prod-133-costus-root-oil",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Costus Root Oil",
    "slug": "costus-root-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Costus Root Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 1300,
    "compare_at_price": 1600,
    "stock": 39,
    "images": [
      "/uploads/hero/ai_bottle_1786262186076.png"
    ],
    "scent_notes": {
      "top": [
        "Costus Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Costus Root Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Costus Root Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": true,
    "created_at": "2026-08-13T14:20:48.871Z"
  },
  {
    "id": "rvk-prod-134-cucumber-oil",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Cucumber Oil",
    "slug": "cucumber-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Cucumber Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 1400,
    "compare_at_price": 1700,
    "stock": 46,
    "images": [
      "/uploads/hero/image__5__1786261765122.png"
    ],
    "scent_notes": {
      "top": [
        "Cucumber Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Cucumber Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Cucumber Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-13T13:20:48.871Z"
  },
  {
    "id": "rvk-prod-135-cumin-seed-co2-ext",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Cumin Seed Co2 Extract Oil",
    "slug": "cumin-seed-co2-extract-oil",
    "category_slug": "luxury-elixirs-blends",
    "description": "100% Pure, hydro-distilled Cumin Seed Co2 Extract Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 1600,
    "compare_at_price": 2000,
    "stock": 53,
    "images": [
      "/uploads/hero/champaca_bottle_1786262252250.png"
    ],
    "scent_notes": {
      "top": [
        "Cumin Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Cumin Seed Co2 Extract Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Cumin Seed Co2 Extract Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-13T12:20:48.872Z"
  },
  {
    "id": "rvk-prod-136-cumin-seed-oil",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Cumin seed oil",
    "slug": "cumin-seed-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Cumin seed oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 1700,
    "compare_at_price": 2100,
    "stock": 15,
    "images": [
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Cumin Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Cumin seed oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Cumin seed oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": true,
    "is_bestseller": false,
    "created_at": "2026-08-13T11:20:48.872Z"
  },
  {
    "id": "rvk-prod-137-curcuma-zedoaria-o",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Curcuma Zedoaria Oil",
    "slug": "curcuma-zedoaria-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Curcuma Zedoaria Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 1800,
    "compare_at_price": 2200,
    "stock": 22,
    "images": [
      "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Curcuma Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Curcuma Zedoaria Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Curcuma Zedoaria Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-13T10:20:48.872Z"
  },
  {
    "id": "rvk-prod-138-curry-leaf-oil",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Curry Leaf Oil",
    "slug": "curry-leaf-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Curry Leaf Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 2000,
    "compare_at_price": 2400,
    "stock": 29,
    "images": [
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Curry Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Curry Leaf Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Curry Leaf Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-13T09:20:48.872Z"
  },
  {
    "id": "rvk-prod-139-cyclamen-absolute",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Cyclamen Absolute",
    "slug": "cyclamen-absolute",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Cyclamen Absolute crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 2100,
    "compare_at_price": 2600,
    "stock": 36,
    "images": [
      "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Cyclamen Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Cyclamen Absolute Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Cyclamen Absolute Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-13T08:20:48.872Z"
  },
  {
    "id": "rvk-prod-140-cypress-oil",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Cypress Oil",
    "slug": "cypress-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Cypress Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 2200,
    "compare_at_price": 2700,
    "stock": 43,
    "images": [
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Cypress Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Cypress Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Cypress Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-13T07:20:48.872Z"
  },
  {
    "id": "rvk-prod-141-d-carvone",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "D Carvone",
    "slug": "d-carvone",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled D Carvone crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 2400,
    "compare_at_price": 2900,
    "stock": 50,
    "images": [
      "/images/hero/champaca-bottle.png"
    ],
    "scent_notes": {
      "top": [
        "D Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "D Carvone Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure D Carvone Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-13T06:20:48.872Z"
  },
  {
    "id": "rvk-prod-142-d-limonene",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "D Limonene",
    "slug": "d-limonene",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled D Limonene crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 2500,
    "compare_at_price": 3100,
    "stock": 57,
    "images": [
      "/uploads/hero/ruhkhus1_removebg_preview_1786261510836.png"
    ],
    "scent_notes": {
      "top": [
        "D Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "D Limonene Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure D Limonene Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-13T05:20:48.872Z"
  },
  {
    "id": "rvk-prod-143-davana-oil",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Davana Oil",
    "slug": "davana-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Davana Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 2700,
    "compare_at_price": 3300,
    "stock": 19,
    "images": [
      "/uploads/hero/ai_bottle_1786262186076.png"
    ],
    "scent_notes": {
      "top": [
        "Davana Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Davana Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Davana Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-13T04:20:48.872Z"
  },
  {
    "id": "rvk-prod-144-delta-3-carene",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Delta 3 Carene",
    "slug": "delta-3-carene",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Delta 3 Carene crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 2800,
    "compare_at_price": 3400,
    "stock": 26,
    "images": [
      "/uploads/hero/image__5__1786261765122.png"
    ],
    "scent_notes": {
      "top": [
        "Delta Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Delta 3 Carene Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Delta 3 Carene Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-13T03:20:48.872Z"
  },
  {
    "id": "rvk-prod-145-di-hydro-myrcenol",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Di Hydro Myrcenol",
    "slug": "di-hydro-myrcenol",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Di Hydro Myrcenol crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 2900,
    "compare_at_price": 3500,
    "stock": 33,
    "images": [
      "/uploads/hero/champaca_bottle_1786262252250.png"
    ],
    "scent_notes": {
      "top": [
        "Di Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Di Hydro Myrcenol Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Di Hydro Myrcenol Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": true,
    "created_at": "2026-08-13T02:20:48.872Z"
  },
  {
    "id": "rvk-prod-146-dill-seed-oil",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Dill Seed Oil",
    "slug": "dill-seed-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Dill Seed Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 3100,
    "compare_at_price": 3800,
    "stock": 40,
    "images": [
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Dill Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Dill Seed Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Dill Seed Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-13T01:20:48.872Z"
  },
  {
    "id": "rvk-prod-147-dragon-blood-oil",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Dragon Blood Oil",
    "slug": "dragon-blood-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Dragon Blood Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 3200,
    "compare_at_price": 3900,
    "stock": 47,
    "images": [
      "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Dragon Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Dragon Blood Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Dragon Blood Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-13T00:20:48.872Z"
  },
  {
    "id": "rvk-prod-148-elemi-oil",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Elemi Oil",
    "slug": "elemi-oil",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Elemi Oil crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 3300,
    "compare_at_price": 4000,
    "stock": 54,
    "images": [
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Elemi Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Elemi Oil Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Elemi Oil Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-12T23:20:48.872Z"
  },
  {
    "id": "rvk-prod-149-ethylene-brassylat",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Ethylene Brassylate ( Musk T)",
    "slug": "ethylene-brassylate-musk-t",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Ethylene Brassylate ( Musk T) crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 3500,
    "compare_at_price": 4300,
    "stock": 16,
    "images": [
      "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Ethylene Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Ethylene Brassylate ( Musk T) Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Ethylene Brassylate ( Musk T) Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-12T22:20:48.872Z"
  },
  {
    "id": "rvk-prod-150-eucalyptol",
    "store_id": "essential_oils_perfumes_store_01",
    "name": "Eucalyptol",
    "slug": "eucalyptol",
    "category_slug": "pure-essential-oils",
    "description": "100% Pure, hydro-distilled Eucalyptol crafted using traditional Kannauj copper deg stills. Formulated with authentic pre-dawn botanicals for remarkable longevity and pure aromatherapeutic excellence.",
    "price": 3600,
    "compare_at_price": 4400,
    "stock": 23,
    "images": [
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1000&auto=format&fit=crop"
    ],
    "scent_notes": {
      "top": [
        "Eucalyptol Petals",
        "Calabrian Bergamot"
      ],
      "heart": [
        "Eucalyptol Core",
        "Damask Rose Absolute"
      ],
      "base": [
        "Mysore Sandalwood Base",
        "Golden Amber Resin"
      ]
    },
    "ingredients": [
      "100% Pure Eucalyptol Extract",
      "Botanical Carrier Oil"
    ],
    "is_featured": false,
    "is_bestseller": false,
    "created_at": "2026-08-12T21:20:48.872Z"
  }
];
