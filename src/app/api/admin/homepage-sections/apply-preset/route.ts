import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';

const PRESET_LAYOUTS: Record<string, any> = {
  royal_heritage: {
    id: 'royal_heritage',
    name: 'Royal Heritage & Kannauj Distillery (Imperial Luxury)',
    description: 'Traditional opulent layout with Imperial Hero Banner, Kannauj Distillation Story Widget, Best-sellers Grid, Scent Finder AI, and Royal Testimonials.',
    thumbnail: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800&auto=format&fit=crop',
    theme_accent: 'Gold & Deep Velvet Burgundy',
    sections: [
      {
        section_type: 'hero_banner',
        title: 'Rose Royale & Kannauj Hydro-Distillates',
        subtitle: 'Hand-distilled in 400-year-old copper degs without alcohol or synthetic additives.',
        display_order: 1,
        is_active: true,
        content: {
          cta_text: 'Discover Royal Fragrances',
          cta_link: '/products',
          background_image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200&auto=format&fit=crop',
          badge: 'EST. 2026 • KANNAUJ PARFUM',
        },
      },
      {
        section_type: 'featured_grid',
        title: 'Master Perfumer Selection',
        subtitle: 'Explore our most requested attars, hydro-distilled floral elixirs, and aged sandalwood blends.',
        display_order: 2,
        is_active: true,
        content: {
          category_filter: 'artisanal-perfumes',
          grid_cols: 3,
        },
      },
      {
        section_type: 'scent_finder',
        title: 'Personalized Scent Finder AI',
        subtitle: 'Answer 3 olfactory questions to discover your signature Kannauj fragrance note.',
        display_order: 3,
        is_active: true,
        content: {
          widget_type: 'interactive_quiz',
          button_text: 'Launch Fragrance Concierge',
        },
      },
      {
        section_type: 'testimonials',
        title: 'Private Client Impressions',
        subtitle: 'Verified reviews from connoisseurs and fragrance collectors worldwide.',
        display_order: 4,
        is_active: true,
        content: {
          show_ratings: true,
          count: 4,
        },
      },
    ],
  },
  modern_minimalist: {
    id: 'modern_minimalist',
    name: 'Modern Minimalist Perfumery (Clean & Chic)',
    description: 'Sleek, high-contrast minimalist aesthetic featuring full-width product carousels, video distillation highlights, and customer review badges.',
    thumbnail: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800&auto=format&fit=crop',
    theme_accent: 'Pearl White & Rose Gold',
    sections: [
      {
        section_type: 'hero_banner',
        title: 'Purity in Every Drop',
        subtitle: 'Single-origin botanical extracts and hydro-distilled attars.',
        display_order: 1,
        is_active: true,
        content: {
          cta_text: 'Shop Collection',
          cta_link: '/products',
          background_image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1200&auto=format&fit=crop',
          badge: 'MINIMALIST LUXURY',
        },
      },
      {
        section_type: 'featured_grid',
        title: 'Pure Essential Oils Matrix',
        subtitle: '100% pure botanical oils extracted using steam-distillation.',
        display_order: 2,
        is_active: true,
        content: {
          category_filter: 'pure-essential-oils',
          grid_cols: 4,
        },
      },
      {
        section_type: 'journal_preview',
        title: 'The Kannauj Journal',
        subtitle: 'Behind the scenes of hydro-distillation and seasonal rose harvest.',
        display_order: 3,
        is_active: true,
        content: {
          show_excerpt: true,
          limit: 3,
        },
      },
    ],
  },
  botanical_elixirs: {
    id: 'botanical_elixirs',
    name: 'Botanical Elixirs & Aromatherapy (Nature Focus)',
    description: 'Wellness and botanical elixir focused layout with scent note pyramids guide, essential oil matrices, and artisanal sampler highlights.',
    thumbnail: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=800&auto=format&fit=crop',
    theme_accent: 'Emerald Forest & Warm Amber',
    sections: [
      {
        section_type: 'hero_banner',
        title: 'Aromatic Botanical Elixirs',
        subtitle: 'Hydro-distilled botanical oils designed for relaxation, clarity, and scent layering.',
        display_order: 1,
        is_active: true,
        content: {
          cta_text: 'Explore Botanical Oils',
          cta_link: '/products?category=pure-essential-oils',
          background_image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=1200&auto=format&fit=crop',
          badge: 'AROMATHERAPY & WELLNESS',
        },
      },
      {
        section_type: 'featured_grid',
        title: 'Synergy Elixirs & Sandalwood Blends',
        subtitle: 'Hand-crafted elixirs combined with vintage Mysore Sandalwood.',
        display_order: 2,
        is_active: true,
        content: {
          category_filter: 'luxury-elixirs-blends',
          grid_cols: 3,
        },
      },
      {
        section_type: 'scent_finder',
        title: 'Scent Note Pyramids & Layering Guide',
        subtitle: 'Learn how Top, Heart, and Base notes evolve over 12+ hours on skin.',
        display_order: 3,
        is_active: true,
        content: {
          widget_type: 'pyramid_guide',
          button_text: 'View Layering Guide',
        },
      },
    ],
  },
  flash_release: {
    id: 'flash_release',
    name: 'Flash Release & Limited Editions (High-Conversion)',
    description: 'Dynamic e-commerce layout featuring promotional countdown banners, limited vintage drops grid, coupon highlights, and bestseller lists.',
    thumbnail: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?q=80&w=800&auto=format&fit=crop',
    theme_accent: 'Royal Ruby & Polished Brass',
    sections: [
      {
        section_type: 'promo_banner',
        title: 'Limited Drop: 50 Bottles of Aged Ruh Gulab 2024 Harvest',
        subtitle: 'Use code ROYALROSE for complimentary 2ml discovery sampler.',
        display_order: 1,
        is_active: true,
        content: {
          discount_code: 'ROYALROSE',
          cta_link: '/products/rose-royale-eau-de-parfum',
        },
      },
      {
        section_type: 'hero_banner',
        title: 'Rare Vintage Attar Distillations',
        subtitle: 'Once a batch is sold out, it cannot be recreated until next year’s harvest.',
        display_order: 2,
        is_active: true,
        content: {
          cta_text: 'Claim Your Bottle',
          cta_link: '/products',
          background_image: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?q=80&w=1200&auto=format&fit=crop',
          badge: 'LIMITED EDITION RELEASE',
        },
      },
      {
        section_type: 'featured_grid',
        title: 'Bestselling Fragrances',
        subtitle: 'Our top customer-rated artisanal attars.',
        display_order: 3,
        is_active: true,
        content: {
          category_filter: 'all',
          grid_cols: 4,
        },
      },
    ],
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { preset_id } = body;

    if (!preset_id || !PRESET_LAYOUTS[preset_id]) {
      return NextResponse.json({ error: 'Valid preset_id is required.' }, { status: 400 });
    }

    const selectedPreset = PRESET_LAYOUTS[preset_id];
    const supabase = getSupabaseServerClient();

    // 1. Clear existing homepage sections for this store
    await supabase
      .from('homepage_sections')
      .delete()
      .eq('store_id', STORE_ID);

    // 2. Insert new preset sections
    const newRows = selectedPreset.sections.map((sec: any) => ({
      store_id: STORE_ID,
      section_type: sec.section_type,
      title: sec.title,
      subtitle: sec.subtitle,
      content: sec.content,
      display_order: sec.display_order,
      is_active: sec.is_active,
      created_at: new Date().toISOString(),
    }));

    const { data: insertedSections, error: insertError } = await supabase
      .from('homepage_sections')
      .insert(newRows)
      .select('*');

    if (insertError) {
      console.error('Error applying preset layout:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      message: `Successfully loaded "${selectedPreset.name}" layout preset!`,
      preset: selectedPreset,
      sections: insertedSections,
    });
  } catch (err: any) {
    console.error('API Error in POST /api/admin/homepage-sections/apply-preset:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
