import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export const HIGH_QUALITY_PAGES_SEED = [
  // ----------------------------------------------------
  // BLOG ARTICLES (page_type: 'blog')
  // ----------------------------------------------------
  {
    title: 'The Art of Fragrance Layering: Creating Your Scent Signature',
    slug: 'art-of-fragrance-layering',
    page_type: 'blog',
    featured_image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000&auto=format&fit=crop',
    excerpt: 'Discover how master perfumers combine pure Kannauj hydro-distilled Ruh Gulab with Mysore Sandalwood for an enduring, personal scent trail.',
    meta_title: 'The Art of Fragrance Layering | Rose Valley Kannauj',
    meta_description: 'Learn traditional Kannauj fragrance layering techniques using pure hydro-distilled attars and Sandalwood oils.',
    content: `Fragrance layering is an intimate, creative ritual. Rather than wearing a single linear scent, layering pure Kannauj hydro-distilled Ruh Gulab underneath Mysore Sandalwood allows you to compose a sensory signature that reacts uniquely to your personal skin chemistry.

1. Prepare with Pure Botanicals
Aromatic molecules adhere best to warm, hydrated skin. Apply a few drops of 100% pure alcohol-free Kannauj rose water or Sandalwood oil immediately after bathing to create a rich moisture barrier.

2. Anchor with Aged Mysore Sandalwood
Apply deeper, resinous attars first—such as Aged Mysore Sandalwood, Velvet Oud, or Shamama. These dense molecules act as anchors for lighter pre-dawn rose top notes applied subsequently.

3. The Finishing Touch: Pre-Dawn Damask Rose
Dab Ruh Gulab on pulse points: behind earlobes, wrists, and collarbones. The heat from your pulse points diffuses the ethereal floral bouquet, producing a subtle sillage that lingers gracefully for over 14 hours.`,
  },
  {
    title: 'Dawn Harvest: Inside Kannauj’s Pre-Dawn Damask Rose Fields',
    slug: 'harvesting-damask-roses',
    page_type: 'blog',
    featured_image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop',
    excerpt: 'Step into the fields at 4:30 AM as delicate Rosa Damascena petals are hand-picked before the morning sun evaporates volatile aromatic compounds.',
    meta_title: 'Dawn Harvest: Kannauj Damask Rose Fields | Rose Valley',
    meta_description: 'Experience the pre-dawn harvest in Kannauj rose fields where master harvesters pick fresh Damask rose petals for traditional Deg-Bhapka hydro-distillation.',
    content: `In the quiet mist of 4:30 AM in Kannauj, Uttar Pradesh, the air carries a sweet, dew-kissed perfume. Harvesters move swiftly through rows of Rosa Damascena bushes, carefully hand-selecting opening blossoms before sunrise.

Why Harvest Before Dawn?
The essential oil content within Damask rose petals reaches its absolute peak during cool pre-dawn hours. As the sun rises, solar warmth causes delicate volatile aromatic terpenes to evaporate into the atmosphere.

Immediate Copper Deg Sealing
Within two hours of picking, thousands of rose petals are transferred into heavy copper Deg vessels, submerged in natural spring water, and sealed airtight with mud clay—ready for wood-fired hydro-distillation.`,
  },
  {
    title: 'The 400-Year Heritage of Copper Deg-Bhapka Hydro-Distillation',
    slug: 'copper-deg-bhapka-legacy',
    page_type: 'blog',
    featured_image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=1000&auto=format&fit=crop',
    excerpt: 'Explore why wood-fired copper vessels and clay sealing techniques create unmatchable depth that modern industrial factories cannot replicate.',
    meta_title: '400-Year Copper Deg-Bhapka Heritage | Rose Valley Kannauj',
    meta_description: 'Discover the ancient Deg-Bhapka hydro-distillation apparatus preserved in Kannauj since 1620.',
    content: `For over four centuries, Kannauj has preserved the ancient Deg-Bhapka hydro-distillation process. Unlike modern steam distillation plants that utilize high pressure and solvent extraction, traditional Deg-Bhapka relies entirely on copper vessels, natural bamboo pipes (chonga), and wood fires.

The Deg: Heavy Hand-Hammered Copper Still
Fresh botanical materials and water are placed inside the copper Deg. Copper acts as a natural catalyst, neutralizing sulfurous notes and enhancing sweet floral nuances.

The Bhapka: Water-Cooled Receiver Tank
As steam rises, it passes through bamboo pipes into the Bhapka—a copper receiver vessel submerged in cold water tanks. The aromatic vapor condenses back into liquid attar oil, naturally absorbing into pure sandalwood base.`,
  },
  {
    title: 'Ruh Khus: The Ancient Indian Cooling Elixir Distilled from Wild Vetiver',
    slug: 'ruh-khus-cooling-elixir',
    page_type: 'blog',
    featured_image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1000&auto=format&fit=crop',
    excerpt: 'How wild vetiver roots harvested along riverbanks produce a deep, earthy emerald extract revered for centuries during hot summer months.',
    meta_title: 'Ruh Khus: Wild Vetiver Hydro-Extract | Rose Valley Kannauj',
    meta_description: 'Learn about Ruh Khus, the rare green vetiver extract distilled in copper stills.',
    content: `Ruh Khus is distilled exclusively from the wild roots of Chrysopogon zizanioides (Vetiveria zizanioides) harvested along the riverbeds of North India. Known as the "Oil of Tranquility," it yields a natural emerald-green distillate celebrated for its remarkable cooling properties.

A Scent of Damp Earth and Rain
Unlike cultivated vetiver, wild Khus possesses an unmistakable woody-earthy profile reminiscent of monsoon rain touching dry soil (Petrichor). It calms the mind, lowers body temperature, and offers a grounded, serene sillage.`,
  },
  {
    title: 'Why Pure Alcohol-Free Attars Outlast Synthetic Alcohol Perfumes',
    slug: 'alcohol-free-attar-purity',
    page_type: 'blog',
    featured_image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop',
    excerpt: 'Uncover the science of oil-based fragrance retention: how natural botanical oils bond with skin lipids for a 12+ hour intimate sillage.',
    meta_title: 'Why Alcohol-Free Attars Last Longer | Rose Valley Kannauj',
    meta_description: 'Understand the science of oil-based natural attars vs commercial alcohol sprays.',
    content: `Commercial eau de parfums often contain 80% to 90% denatured alcohol. While alcohol provides an intense initial scent burst, it rapidly evaporates within 2 to 3 hours, stripping the skin of moisture and breaking down delicate floral top notes.

The Longevity of Pure Botanical Oil
Pure hydro-distilled attars are 100% oil-based. Natural plant lipids seamlessly merge with your skin's natural moisture barrier, creating a slow-release aromatic warmth that develops over 12 to 16 hours without dry synthetic harshness.`,
  },

  // ----------------------------------------------------
  // PRESS RELEASES / MEDIA MENTIONS (page_type: 'press')
  // ----------------------------------------------------
  {
    title: 'Vogue India: Inside Kannauj’s 400-Year-Old Copper Deg Stills with Rose Valley',
    slug: 'press-vogue-india-feature',
    page_type: 'press',
    featured_image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000&auto=format&fit=crop',
    excerpt: 'Vogue India highlights Rose Valley Kannauj for preserving ancient pre-dawn hydro-distillation and bringing pure Ruh Gulab to international luxury fragrance connoisseurs.',
    meta_title: 'Vogue India Feature | Rose Valley Kannauj Press',
    meta_description: 'Vogue India feature on Rose Valley Kannauj pure hydro-distilled rose attars.',
    content: `Publisher: Vogue India (Luxury Feature & Print Cover)

"Rose Valley Kannauj preserves the sacred art of pre-dawn hydro-distillation. Their Ruh Gulab and Ruh Khus extracts represent the pinnacle of Indian luxury perfumery."

Full Article Highlights:
- Pre-dawn harvesting of Damask Roses in Kannauj.
- Preservation of 400-year-old copper Deg-Bhapka wood-fired stills.
- 100% alcohol-free purity certified by batch QR passports.`,
  },
  {
    title: 'Harper’s Bazaar: The Liquid Gold of Kannauj - Why Natural Attars Are Replacing Synthetics',
    slug: 'press-harpers-bazaar-feature',
    page_type: 'press',
    featured_image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop',
    excerpt: 'Harper\'s Bazaar selects Rose Valley\'s Damask Rose hydro-distillates as the top artisanal selection for pure, alcohol-free fragrance longevity.',
    meta_title: 'Harper’s Bazaar Feature | Rose Valley Press',
    meta_description: 'Harper\'s Bazaar feature on natural Kannauj attars and alcohol-free perfumery.',
    content: `Publisher: Harper's Bazaar (Artisanal Selection)

"Free from synthetic alcohol and parabens, Rose Valley’s Damask Rose distillates unfold with an extraordinary 14-hour longevity on pulse points."

Full Article Highlights:
- Deep dive into natural botanical oil chemistry.
- Comparison of synthetic spray diffusion vs. organic oil intimacy.
- Sustainable harvesting along the Ganges basin.`,
  },
  {
    title: 'The Economic Times: Reviving Ancient Craftsmanship - How Rose Valley Took Kannauj Attar Global',
    slug: 'press-economic-times-feature',
    page_type: 'press',
    featured_image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=1000&auto=format&fit=crop',
    excerpt: 'The Economic Times covers Rose Valley\'s QR provenance passport integration with traditional 1620 Deg-Bhapka distillation to pioneer heritage luxury exports.',
    meta_title: 'The Economic Times Feature | Rose Valley Press',
    meta_description: 'The Economic Times business profile on Rose Valley Kannauj global exports.',
    content: `Publisher: The Economic Times (Heritage & Enterprise)

"Combining QR provenance passports with traditional copper deg distillation, Rose Valley has redefined heritage luxury exports for discerning international collectors."

Full Article Highlights:
- Economic revival of Kannauj master artisan families.
- Modern QR provenance spectrum tracking.
- Worldwide shipping of authentic alcohol-free distillates.`,
  },
  {
    title: 'GQ Magazine: The Best Artisanal Alcohol-Free Fragrances Every Collector Needs',
    slug: 'press-gq-magazine-feature',
    page_type: 'press',
    featured_image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1000&auto=format&fit=crop',
    excerpt: 'GQ Magazine awards Rose Valley Ruh Khus Vetiver Extract top honors in Gentlemen\'s Artisanal Grooming.',
    meta_title: 'GQ Magazine Grooming Choice | Rose Valley Press',
    meta_description: 'GQ Magazine feature on Rose Valley Ruh Khus Vetiver Extract.',
    content: `Publisher: GQ Magazine (Gentlemen Grooming Choice)

"Ruh Khus Vetiver Extract by Rose Valley is an olfactory masterpiece—cooling, earthy, and steeped in four centuries of Kannauj craftsmanship."

Full Article Highlights:
- Selection of top natural vetiver extracts worldwide.
- Cooling olfactory notes for hot summer weather.
- Zero synthetic additives or fixatives.`,
  },
];

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();

    const { searchParams } = new URL(request.url);
    const forceReset = searchParams.get('reset') === 'true';

    if (forceReset) {
      await supabase
        .from('pages')
        .delete()
        .eq('store_id', STORE_ID);
    }

    const inserted: any[] = [];
    const errors: any[] = [];

    for (const item of HIGH_QUALITY_PAGES_SEED) {
      const { data: existing } = await supabase
        .from('pages')
        .select('id')
        .eq('store_id', STORE_ID)
        .eq('slug', item.slug)
        .maybeSingle();

      if (existing) {
        const { data: updated, error: updateErr } = await supabase
          .from('pages')
          .update({
            title: item.title,
            page_type: item.page_type,
            content: item.content,
            excerpt: item.excerpt,
            featured_image: item.featured_image,
            meta_title: item.meta_title,
            meta_description: item.meta_description,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select('*')
          .single();

        if (updateErr) errors.push({ slug: item.slug, error: updateErr.message });
        else inserted.push(updated);
      } else {
        const { data: insertedItem, error: insertErr } = await supabase
          .from('pages')
          .insert([
            {
              store_id: STORE_ID,
              slug: item.slug,
              title: item.title,
              page_type: item.page_type,
              content: item.content,
              excerpt: item.excerpt,
              featured_image: item.featured_image,
              meta_title: item.meta_title,
              meta_description: item.meta_description,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select('*')
          .single();

        if (insertErr) errors.push({ slug: item.slug, error: insertErr.message });
        else inserted.push(insertedItem);
      }
    }

    return NextResponse.json({
      message: `Successfully seeded ${inserted.length} high quality blog posts & press releases into database!`,
      count: inserted.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err: any) {
    console.error('API Error in POST /api/admin/pages/seed:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    availableSeedCount: HIGH_QUALITY_PAGES_SEED.length,
    seedItems: HIGH_QUALITY_PAGES_SEED.map((p) => ({ title: p.title, slug: p.slug, type: p.page_type })),
  });
}
