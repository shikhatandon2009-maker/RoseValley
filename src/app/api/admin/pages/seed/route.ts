import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';

export const dynamic = 'force-dynamic';

const HIGH_QUALITY_PAGES_SEED = [
  // ----------------------------------------------------
  // BLOG ARTICLES (page_type: 'blog')
  // ----------------------------------------------------
  {
    title: 'The Art of Fragrance Layering: Creating Your Scent Signature',
    slug: 'art-of-fragrance-layering',
    page_type: 'blog',
    featured_image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000&auto=format&fit=crop',
    excerpt: 'Discover how master distillers combine pure hydro-distilled Rose Oil with Mysore Sandalwood for an enduring, personal scent trail.',
    meta_title: 'The Art of Fragrance Layering | RoseOil.in',
    meta_description: 'Learn botanical fragrance layering techniques using pure hydro-distilled essential oils and Sandalwood oils from RoseOil.in.',
    content: `Fragrance layering is an intimate, creative ritual. Rather than wearing a single linear scent, layering pure hydro-distilled Rose Oil with Mysore Sandalwood allows you to compose a sensory signature that reacts uniquely to your personal skin chemistry.

1. Prepare with Pure Botanicals
Aromatic molecules adhere best to warm, hydrated skin. Apply a few drops of 100% pure alcohol-free Rose water or botanical carrier oil immediately after bathing to create a rich moisture barrier.

2. Anchor with Aged Mysore Sandalwood
Apply deeper, resinous oils first—such as Aged Mysore Sandalwood or Vetiver. These dense molecules act as anchors for lighter pre-dawn rose top notes applied subsequently.

3. The Finishing Touch: Pure Damask Rose
Dab pure Rose Oil on pulse points: behind earlobes, wrists, and collarbones. The heat from your pulse points diffuses the ethereal floral bouquet, producing a subtle sillage that lingers gracefully for over 14 hours.`,
  },
  {
    title: 'Dawn Harvest: Inside Pre-Dawn Damask Rose Fields',
    slug: 'harvesting-damask-roses',
    page_type: 'blog',
    featured_image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop',
    excerpt: 'Step into the fields at 4:30 AM as delicate Rosa Damascena petals are hand-picked before the morning sun evaporates volatile aromatic compounds.',
    meta_title: 'Dawn Harvest: Damask Rose Fields | RoseOil.in',
    meta_description: 'Experience the pre-dawn harvest in rose fields where fresh Damask rose petals are picked for pure hydro-distillation at RoseOil.in.',
    content: `In the quiet mist of 4:30 AM, the air carries a sweet, dew-kissed perfume. Harvesters move swiftly through rows of Rosa Damascena bushes, carefully hand-selecting opening blossoms before sunrise.

Why Harvest Before Dawn?
The essential oil content within Damask rose petals reaches its absolute peak during cool pre-dawn hours. As the sun rises, solar warmth causes delicate volatile aromatic terpenes to evaporate into the atmosphere.

Immediate Distillation
Within hours of picking, thousands of fresh rose petals are transferred into stills, submerged in natural spring water, and prepared for slow hydro-distillation.`,
  },
  {
    title: 'The Science and Art of Botanical Hydro-Distillation',
    slug: 'copper-deg-bhapka-legacy',
    page_type: 'blog',
    featured_image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=1000&auto=format&fit=crop',
    excerpt: 'Explore why slow hydro-distillation creates unmatchable depth and purity that synthetic modern chemicals cannot replicate.',
    meta_title: 'Botanical Hydro-Distillation Science | RoseOil.in',
    meta_description: 'Discover the artisanal hydro-distillation techniques preserved at RoseOil.in.',
    content: `Pure hydro-distillation is a time-honored botanical art. Unlike modern solvent extraction that leaves chemical residues, traditional hydro-distillation relies entirely on pure water, gentle heat, and cold condensation.

Natural Steam Vapor
Fresh botanical materials and water are heated gently. The rising steam ruptures the delicate microscopic oil glands in petals, carrying volatile aromatic molecules upward.

Cold Condensation
As steam rises, it condenses into pure liquid essential oil and floral water, completely free of harsh petrochemicals.`,
  },
  {
    title: 'Ruh Khus: The Natural Cooling Elixir Distilled from Wild Vetiver',
    slug: 'ruh-khus-cooling-elixir',
    page_type: 'blog',
    featured_image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1000&auto=format&fit=crop',
    excerpt: 'How wild vetiver roots produce a deep, earthy emerald extract revered for its grounding, cooling aromatherapeutic properties.',
    meta_title: 'Ruh Khus: Wild Vetiver Extract | RoseOil.in',
    meta_description: 'Learn about Ruh Khus, the rare green vetiver extract from RoseOil.in.',
    content: `Ruh Khus is distilled exclusively from the wild roots of Chrysopogon zizanioides (Vetiveria zizanioides). Known as the "Oil of Tranquility," it yields a natural emerald-green distillate celebrated for its remarkable cooling properties.

A Scent of Damp Earth and Rain
Wild Khus possesses an unmistakable woody-earthy profile reminiscent of monsoon rain touching dry soil (Petrichor). It calms the mind, lowers stress, and offers a grounded, serene sillage.`,
  },
  {
    title: 'Why Pure Alcohol-Free Essential Oils Outlast Synthetic Perfumes',
    slug: 'alcohol-free-attar-purity',
    page_type: 'blog',
    featured_image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop',
    excerpt: 'Uncover the science of oil-based fragrance retention: how natural botanical oils bond with skin lipids for long-lasting intimate sillage.',
    meta_title: 'Why Pure Essential Oils Last Longer | RoseOil.in',
    meta_description: 'Understand the science of oil-based natural extracts vs commercial alcohol perfumes.',
    content: `Commercial perfumes often contain 80% to 90% denatured alcohol. While alcohol provides an intense initial burst, it rapidly evaporates within 2 hours, drying the skin.

The Longevity of Pure Botanical Oil
Pure botanical oils are 100% oil-based. Natural plant lipids seamlessly merge with your skin's natural moisture barrier, creating a slow-release aromatic warmth that develops over 12 to 16 hours without synthetic harshness.`,
  },

  // ----------------------------------------------------
  // PRESS RELEASES / MEDIA MENTIONS (page_type: 'press')
  // ----------------------------------------------------
  {
    title: 'Vogue India: Pure Botanical Extraction with RoseOil.in',
    slug: 'press-vogue-india-feature',
    page_type: 'press',
    featured_image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000&auto=format&fit=crop',
    excerpt: 'Vogue India highlights RoseOil.in for preserving pure botanical distillation and bringing therapeutic Rose Otto to luxury connoisseurs.',
    meta_title: 'Vogue India Feature | RoseOil.in Press',
    meta_description: 'Vogue India feature on RoseOil.in pure hydro-distilled essential oils.',
    content: `Publisher: Vogue India (Luxury Feature & Print Cover)

"RoseOil.in preserves the authentic science of pure botanical distillation. Their pure Rose Otto and Vetiver extracts represent the pinnacle of natural luxury."

Full Article Highlights:
- Pre-dawn harvesting of Damask Roses.
- Pure steam hydro-distillation without chemical solvents.
- 100% alcohol-free purity verified by GC-MS lab testing.`,
  },
  {
    title: 'Harper’s Bazaar: The Liquid Gold of Botanicals - Why Pure Essential Oils Lead Skincare',
    slug: 'press-harpers-bazaar-feature',
    page_type: 'press',
    featured_image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop',
    excerpt: 'Harper\'s Bazaar selects RoseOil.in\'s Damask Rose distillates as the top artisanal selection for pure, alcohol-free aromatic longevity.',
    meta_title: 'Harper’s Bazaar Feature | RoseOil.in Press',
    meta_description: 'Harper\'s Bazaar feature on natural botanical extracts and alcohol-free perfumery.',
    content: `Publisher: Harper's Bazaar (Artisanal Selection)

"Free from synthetic chemicals and parabens, RoseOil.in’s Damask Rose distillates unfold with an extraordinary 14-hour longevity on pulse points."

Full Article Highlights:
- Deep dive into natural botanical oil chemistry.
- Comparison of synthetic spray diffusion vs. organic oil intimacy.
- Sustainable harvesting and ethical sourcing.`,
  },
  {
    title: 'The Economic Times: Redefining Purity - How RoseOil.in Built a Global Botanical Legacy',
    slug: 'press-economic-times-feature',
    page_type: 'press',
    featured_image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=1000&auto=format&fit=crop',
    excerpt: 'The Economic Times covers RoseOil.in\'s digital batch provenance and GC-MS certified distillation to set the benchmark in global exports.',
    meta_title: 'The Economic Times Feature | RoseOil.in Press',
    meta_description: 'The Economic Times business profile on RoseOil.in global exports.',
    content: `Publisher: The Economic Times (Heritage & Enterprise)

"Combining rigorous GC-MS testing with traditional hydro-distillation, RoseOil.in has set the benchmark for pure botanical exports."

Full Article Highlights:
- Rigorous purity standards and ethical farming partnerships.
- Batch transparency and provenance tracking.
- Worldwide shipping of authentic therapeutic distillates.`,
  },
  {
    title: 'GQ Magazine: The Best Therapeutic Essential Oils Every Connoisseur Needs',
    slug: 'press-gq-magazine-feature',
    page_type: 'press',
    featured_image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1000&auto=format&fit=crop',
    excerpt: 'GQ Magazine awards RoseOil.in Wild Vetiver Extract top honors in Men\'s Artisanal Grooming.',
    meta_title: 'GQ Magazine Grooming Choice | RoseOil.in Press',
    meta_description: 'GQ Magazine feature on RoseOil.in Wild Vetiver Essential Oil.',
    content: `Publisher: GQ Magazine (Gentlemen Grooming Choice)

"Wild Vetiver Essential Oil by RoseOil.in is a grounding botanical masterpiece—cooling, earthy, and deeply restorative."

Full Article Highlights:
- Selection of top natural essential oils worldwide.
- Cooling olfactory notes for hot summer weather.
- Zero synthetic additives or fixatives.`,
  },
];

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database client unavailable. Configure Supabase credentials in settings.' },
        { status: 500 }
      );
    }

    let insertedCount = 0;
    let updatedCount = 0;

    for (const page of HIGH_QUALITY_PAGES_SEED) {
      const { data: existing } = await supabase
        .from('pages')
        .select('id')
        .eq('store_id', STORE_ID)
        .eq('slug', page.slug)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('pages')
          .update({
            title: page.title,
            page_type: page.page_type,
            featured_image: page.featured_image,
            excerpt: page.excerpt,
            meta_title: page.meta_title,
            meta_description: page.meta_description,
            content: page.content,
            is_published: true,
          })
          .eq('id', existing.id);
        updatedCount++;
      } else {
        await supabase.from('pages').insert({
          store_id: STORE_ID,
          slug: page.slug,
          title: page.title,
          page_type: page.page_type,
          featured_image: page.featured_image,
          excerpt: page.excerpt,
          meta_title: page.meta_title,
          meta_description: page.meta_description,
          content: page.content,
          is_published: true,
        });
        insertedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully seeded editorial pages (${insertedCount} added, ${updatedCount} updated).`,
      total: HIGH_QUALITY_PAGES_SEED.length,
    });
  } catch (error: any) {
    console.error('Error seeding editorial pages:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to seed editorial pages.' },
      { status: 500 }
    );
  }
}
