export interface AIGenerateRequest {
  type:
    | 'product_description'
    | 'scent_notes'
    | 'category_description'
    | 'blog_post'
    | 'qa_answer'
    | 'chatbot'
    | 'seo_metadata'
    | 'customer_reviews'
    | 'all_in_one_seo_and_description';
  prompt: string;
  context?: any;
}

export async function generateAIContent(request: AIGenerateRequest): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_PROVIDER_API_KEY;
  const configuredModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

  // Candidate models to try in order
  const modelsToTry = [
    configuredModel,
    'gemini-1.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-pro',
  ].filter((v, i, a) => a.indexOf(v) === i);

  if (apiKey) {
    for (const model of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `System: You are an internationally acclaimed Master Perfumer, Botanical Chemist, and Chief Luxury SEO Strategist for Rose Valley Kannauj (Maison De L'Essence, Kannauj, India — home of authentic 400-year sacred Deg-Bhapka copper hydro-distillation since 1620). 

Generate world-class, ultra-bespoke, evocative, and high-converting copy. Do NOT use boilerplate templates, robotic keyword stuffing, or generic macro phrasing. Tailor every word to the specific botanical character, olfactory notes, and therapeutic aura of the product.\n\nTask: ${constructPrompt(request)}`
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 3500,
            }
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;

          if (resultText && resultText.trim()) {
            if (request.type === 'all_in_one_seo_and_description') {
              const parsedResult = parseAllInOneResponse(resultText, request.prompt);
              return JSON.stringify(parsedResult, null, 2);
            }

            let cleaned = resultText.trim();
            const matchFence = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
            if (matchFence && matchFence[1]) {
              cleaned = matchFence[1].trim();
            }

            return cleaned;
          }
        }
      } catch (err) {
        console.warn(`[Gemini API with ${model} failed, trying fallback]:`, err);
      }
    }
  }

  // High-intelligence localized engine
  return fallbackAIGeneration(request);
}

export function parseAllInOneResponse(raw: string, productName: string): any {
  if (!raw || typeof raw !== 'string') {
    return JSON.parse(fallbackAIGeneration({ type: 'all_in_one_seo_and_description', prompt: productName }));
  }

  let cleaned = raw.trim();
  const matchFence = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (matchFence && matchFence[1]) {
    cleaned = matchFence[1].trim();
  }

  // 1. Direct JSON parse
  try {
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed === 'object') return parsed;
  } catch (_) {}

  // 2. Substring between first { and last }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      const parsed = JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
      if (parsed && typeof parsed === 'object') return parsed;
    } catch (_) {}
  }

  // 3. Lenient Regex Extraction for unclosed / streamed JSON
  const metaTitleMatch = cleaned.match(/"meta_title"\s*:\s*"([^"]+)"/i);
  const metaDescMatch = cleaned.match(/"meta_description"\s*:\s*"([^"]+)"/i);
  const metaKeywordsMatch = cleaned.match(/"meta_keywords"\s*:\s*"([^"]+)"/i);
  const descMatch = cleaned.match(/"description"\s*:\s*"([\s\S]*?)(?:"\s*,\s*"scent_notes"|"\s*\}|$)/i);

  const fallback = JSON.parse(fallbackAIGeneration({ type: 'all_in_one_seo_and_description', prompt: productName }));

  return {
    meta_title: metaTitleMatch ? metaTitleMatch[1].trim() : fallback.meta_title,
    meta_description: metaDescMatch ? metaDescMatch[1].trim() : fallback.meta_description,
    meta_keywords: metaKeywordsMatch ? metaKeywordsMatch[1].trim() : fallback.meta_keywords,
    description: descMatch
      ? descMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').trim()
      : cleaned.length > 100 && !cleaned.startsWith('{')
      ? cleaned
      : fallback.description,
    scent_notes: fallback.scent_notes,
  };
}

function constructPrompt(req: AIGenerateRequest): string {
  switch (req.type) {
    case 'all_in_one_seo_and_description':
      return `DEEP THINKING & BESPOKE CREATION FOR: "${req.prompt}"

Context:
- Product Name: "${req.prompt}"
- Category Context: ${req.context?.category || 'Artisanal Essential Oils & Pure Heritage Attars'}

INSTRUCTIONS FOR MASTER COPYWRITER & SEO ARCHITECT:
1. Deep Botanical Analysis: Analyze the core essence of "${req.prompt}". Is it a sleep/relaxation remedy, cognitive energy elixir, sacred floral attar, rare Ayurvedic root distillate, sunlit citrus, or deep oriental oud/wood?
2. World-Class Luxury SEO Metadata:
   - "meta_title": (Strictly 50-60 characters). High-CTR executive title tag tailored specifically to "${req.prompt}". Must be elegant, natural, and never use repetitive macro templates.
   - "meta_description": (Strictly 140-155 characters). High-conversion Google search snippet highlighting unique botanical benefits, 400-year Deg-Bhapka distillation, 100% alcohol-free purity, and 12+ hour sillage.
   - "meta_keywords": (12-16 high-value search queries). Target buyer-intent terms specific to "${req.prompt}" (e.g. therapeutic properties, aromatherapy uses, perfume notes).
3. World-Class Luxury Product Description (300-350 words in 3-4 rich, sensory paragraphs):
   - Paragraph 1: Scent character, emotional aura, and dawn-harvested botanical origin.
   - Paragraph 2: Olfactory evolution (top notes opening into a harmonious heart and deep drydown).
   - Paragraph 3: Authentic Kannauj Deg-Bhapka copper hydro-distillation, zero alcohol or synthetic carrier oils.
   - Paragraph 4: Sacred application ritual (pulse points, aromatherapy diffusion, or evening meditation).
4. Olfactory Pyramid:
   - "top": Array of 3 precise opening notes.
   - "heart": Array of 3 nuanced heart notes.
   - "base": Array of 3 grounding drydown notes.

RETURN STRICTLY A VALID JSON OBJECT with NO markdown, NO preambles:
{
  "meta_title": "...",
  "meta_description": "...",
  "meta_keywords": "...",
  "description": "...",
  "scent_notes": {
    "top": ["...", "...", "..."],
    "heart": ["...", "...", "..."],
    "base": ["...", "...", "..."]
  }
}`;

    case 'product_description':
      return `Write a bespoke, 250-word luxury product description for "${req.prompt}". Emphasize its authentic 400-year Kannauj copper still (Deg-Bhapka) hydro-distillation heritage, 100% alcohol-free purity, unique scent notes, and 12-hour sillage.`;

    case 'scent_notes':
      return `Analyze the fragrance "${req.prompt}". Return ONLY a valid JSON object with {"top": ["...","...","..."], "heart": ["...","...","..."], "base": ["...","...","..."]}.`;

    case 'seo_metadata':
      return `Perform deep SEO market research for "${req.prompt}". Return ONLY valid JSON: {"meta_title": "...", "meta_keywords": "...", "meta_description": "..."}.`;

    case 'customer_reviews':
      return `Return ONLY a valid JSON array of 3 authentic, 5-star customer reviews specifically for "${req.prompt}".`;

    case 'category_description':
      return `Write a rich, poetic 100-word SEO category description for "${req.prompt}". Highlight 400-year Kannauj copper still heritage and 100% alcohol-free botanical purity.`;

    default:
      return req.prompt;
  }
}

// INTELLIGENT BOTANICAL CLASSIFICATION & DYNAMIC GENERATOR
interface BotanicalProfile {
  top: string[];
  heart: string[];
  base: string[];
  mood: string;
  benefits: string;
  ritual: string;
  categoryName: string;
}

function classifyProduct(productName: string): BotanicalProfile {
  const name = (productName || 'Royal Damask Rose').toLowerCase();

  // 1. SLEEP & CALMING AROMATHERAPY
  if (name.includes('sleep') || name.includes('calm') || name.includes('relax') || name.includes('peace') || name.includes('night') || name.includes('dream')) {
    return {
      top: ['French High-Altitude Lavender', 'Roman Chamomile Blossom', 'Sweet Wild Mandarin'],
      heart: ['Clary Sage Infusion', 'Neroli Petal Nectar', 'Night-Blooming Marjoram'],
      base: ['Kashmir Cedarwood', 'Aged Mysore Sandalwood', 'Warm Vanilla Absolute'],
      mood: 'deep tranquility, nervous system restoration, and restorative twilight calm',
      benefits: 'soothes racing thoughts, eases muscular tension, and encourages uninterrupted deep REM sleep',
      ritual: 'Gently warm 2-3 drops between your palms, inhale deeply before bedtime, and massage across temples, neck, and soles of feet.',
      categoryName: 'Therapeutic Aromatherapy Blend',
    };
  }

  // 2. ENERGY, FOCUS & CLARITY
  if (name.includes('energy') || name.includes('focus') || name.includes('alert') || name.includes('clarity') || name.includes('breathe') || name.includes('clear') || name.includes('mint')) {
    return {
      top: ['Crisp Spearmint Leaves', 'Calabrian Pink Grapefruit', 'Crushed Rosemary Needles'],
      heart: ['Eucalyptus Globulus Leaf', 'Sweet Basil Steam Extract', 'Wild Cardamom Pod'],
      base: ['Himalayan Silver Pine', 'Aged Atlas Cedar', 'Clean White Musk'],
      mood: 'invigorating cognitive clarity, open respiration, and revitalized mental focus',
      benefits: 'sharpens concentration, clears sinus congestion, and provides a clean surge of sustained natural energy without caffeine jitters',
      ritual: 'Apply to inner wrists and chest before meditation, study sessions, or morning yoga for instant cerebral vitality.',
      categoryName: 'Invigorating Botanical Tonic',
    };
  }

  // 3. RARE ROOTS & WILD AYURVEDIC RHIZOMES (Zedoary, Nagarmotha, Vetiver, Jatamansi)
  if (name.includes('zedoary') || name.includes('root') || name.includes('turmeric') || name.includes('vetiver') || name.includes('khus') || name.includes('nagarmotha') || name.includes('spikenard') || name.includes('jatamansi') || name.includes('ginger')) {
    return {
      top: ['Fresh Wild Rhizome Zest', 'Spiced Lemongrass Mist', 'Dewy Riverbed Clay'],
      heart: ['Warm Zedoary Curcuma', 'Hydro-Distilled Vetiver Root', 'Ancient Nagarmotha'],
      base: ['Aged Earthen Terracotta', 'Smoky Earth Resinoid', 'Warm Mysore Sandalwood Catalyst'],
      mood: 'deep Ayurvedic grounding, ancestral earthy warmth, and bio-active cellular wellness',
      benefits: 'stimulates lymphatic circulation, purifies the skin barrier, and grounds uncentered spiritual energy with rare earthen sesquiterpenes',
      ritual: 'Blend with pure cold-pressed carrier oil for restorative facial lymphatic drainage or apply neat on pulse points for grounding composure.',
      categoryName: 'Sacred Wildcraft Root Extract',
    };
  }

  // 4. CITRUS & SPARKLING ZEST (Yuzu, Bergamot, Neroli, Sweet Orange)
  if (name.includes('yuzu') || name.includes('bergamot') || name.includes('lemon') || name.includes('orange') || name.includes('grapefruit') || name.includes('citrus') || name.includes('mandarin') || name.includes('neroli')) {
    return {
      top: ['Sun-Drenched Japanese Yuzu', 'Sparkling Sicilian Bergamot', 'Crisp Bitter Orange Peel'],
      heart: ['Blossoming Orange Flower', 'Crushed Petitgrain Twigs', 'White Freesia Nectar'],
      base: ['Solar Amber Crystals', 'Soft Blonde Woods', 'Golden Benzoin Drop'],
      mood: 'radiant sunlit euphoria, luminous warmth, and effervescent sophistication',
      benefits: 'elevates serotonin and mood, brightens dull skin complexion, and dispels sluggish afternoon fatigue',
      ritual: 'Incorporate into your morning awakening ritual by diffusing into living spaces or applying to wrists as a crisp solar fragrance.',
      categoryName: 'Cold-Distilled Citrus Essence',
    };
  }

  // 5. EXOTIC FLOWERS & CANANGA (Ylang Ylang, Jasmine, Mogra, Tuberose, Lotus)
  if (name.includes('ylang') || name.includes('jasmine') || name.includes('mogra') || name.includes('chameli') || name.includes('tuberose') || name.includes('lotus') || name.includes('rajnigandha')) {
    return {
      top: ['Dawn-Picked Dewy Petals', 'Creamy Yellow Cananga', 'Green Stem Accord'],
      heart: ['Madagascan Ylang Ylang Extra', 'Royal Sambac Jasmine Nectar', 'Sensual White Frangipani'],
      base: ['Creamy Coconut Flesh', 'Warm Ambergris Harmony', 'Mysore White Sandalwood'],
      mood: 'hypnotic floral euphoria, romantic intimacy, and regal indulgence',
      benefits: 'melts away emotional tension, enhances natural sensuality, and delivers a captivating 14-hour floral trail',
      ritual: 'Dab lightly behind ears and clavicle as a signature evening extrait, allowing the warmth of your skin to radiate its lush sillage.',
      categoryName: 'Artisanal Floral Extrait',
    };
  }

  // 6. SACRED DAMASK ROSE (Rose, Ruh Gulab, Damascena)
  if (name.includes('rose') || name.includes('gulab') || name.includes('damask')) {
    return {
      top: ['Dawn Harvest Rosa Damascena', 'Pink Peppercorn Sparkle', 'Morning Dewdrops'],
      heart: ['Sacred Kannauj Ruh Gulab', 'French May Rose Absolute', 'Geranium Leaf Essence'],
      base: ['Aged Sandalwood Heartwood', 'Liquid Royal Amber', 'Silken Velvet Musk'],
      mood: 'heart-centered majesty, timeless royal romance, and spiritual equilibrium',
      benefits: 'deeply balances heart chakra energy, hydrates delicate skin tissue, and radiates an unmistakable aura of timeless luxury',
      ritual: 'Apply a single drop to pulse points or mix with pure rosewater for an intoxicating royal facial aura.',
      categoryName: 'Sacred Damask Rose Distillate',
    };
  }

  // 7. SACRED WOODS & ORIENTAL OUD (Sandalwood, Chandan, Oud, Agarwood, Amber, Frankincense)
  if (name.includes('sandalwood') || name.includes('chandan') || name.includes('oud') || name.includes('agarwood') || name.includes('amber') || name.includes('frankincense') || name.includes('myrrh') || name.includes('cedar')) {
    return {
      top: ['Smoky Cardamom Pods', 'Frankincense Resin Tears', 'Golden Bergamot'],
      heart: ['Wild Assam Agarwood', 'Pure Mysore Chandan Heartwood', 'Dark Rose Velvet'],
      base: ['Aged Cambodian Oud Concentrate', 'Fossil Amber Resin', 'Benzoin Tears'],
      mood: 'meditative spiritual elevation, ancient imperial power, and infinite warmth',
      benefits: 'enhances deep meditation, purifies the surrounding energy field, and delivers an unmatched 16-hour imperial sillage',
      ritual: 'Anoint the third eye and collarbone before mindfulness practice or gala evenings for an aura of regal command.',
      categoryName: 'Imperial Sacred Wood Attar',
    };
  }

  // 8. GENERAL BOTANICAL ESSENCE
  const words = productName.split(' ').map((w) => w.trim()).filter(Boolean);
  const main = words[0] || 'Artisanal';
  const sub = words[1] || 'Botanical';

  return {
    top: [`${main} Mountain Harvest`, 'Calabrian Bergamot Zest', 'Pink Pepper Sparkle'],
    heart: [`Pure ${sub} Hydro-Extract`, 'Wild Damask Petals', 'Saffron Crocus Threads'],
    base: ['Aged Mysore Sandalwood', 'Golden Amber Resin', 'Silken Cashmere Accord'],
    mood: 'harmonious holistic wellness, captivating olfactory distinction, and ancient Kannauj grace',
    benefits: 'elevates personal presence, harmonizes sensory well-being, and envelopes skin in pure non-greasy botanical nourishment',
    ritual: 'Smooth 2-3 drops over pulse points, allowing natural body heat to unfold the intricate aromatics throughout the day.',
    categoryName: 'Artisanal Botanical Elixir',
  };
}

function fallbackAIGeneration(req: AIGenerateRequest): string {
  const name = req.prompt || 'Artisanal Botanical Oil';
  const profile = classifyProduct(name);

  switch (req.type) {
    case 'all_in_one_seo_and_description': {
      const topList = profile.top.join(', ');
      const heartList = profile.heart.join(', ');
      const baseList = profile.base.join(', ');

      const desc = `Discover the transformative sensory artistry of ${name}, a masterwork hand-crafted in the sacred 400-year copper Deg-Bhapka distillation tradition of Kannauj. Formulated as a 100% alcohol-free pure oil elixir, this rare botanical creation embodies ${profile.mood}, offering fragrance connoisseurs an intimate, skin-nourishing luxury that unfolds with profound elegance.

The olfactory journey awakens with radiant top notes of ${topList}, delivering an immediate impression of crisp vitality and refined botanical freshness. As the opening notes settle, the fragrance unfurls into an intricate heart of ${heartList}, releasing potent aromatherapeutic compounds that ${profile.benefits}.

In the drydown, ${name} anchors into a rich, enduring foundation of ${baseList}, leaving an unforgettable signature with over 12 hours of authentic sillage. Distilled without synthetic spirits, phthalates, or chemical carriers, each bottle represents an unbroken lineage of perfumery mastery. ${profile.ritual}`;

      return JSON.stringify(
        {
          meta_title: `${name} | 100% Pure Botanical Oil | Rose Valley Kannauj`,
          meta_description: `Experience pure ${name}. Handcrafted in 400-year Kannauj copper stills. 100% alcohol-free, featuring ${profile.top[0]} & ${profile.heart[0]} for 12+ hr sillage.`,
          meta_keywords: `${name.toLowerCase()}, buy ${name.toLowerCase()} online, pure ${name.toLowerCase()} oil, ${profile.categoryName.toLowerCase()}, alcohol free ${name.toLowerCase()}, 100 pure essential oil, kannauj botanical distillate, aromatherapy ${profile.top[0].toLowerCase()}, luxury attar India, Rose Valley Kannauj`,
          description: desc,
          scent_notes: {
            top: profile.top,
            heart: profile.heart,
            base: profile.base,
          },
        },
        null,
        2
      );
    }

    case 'product_description': {
      return `Immerse your senses in ${name}, an artisanal creation hydro-distilled in the 400-year Deg-Bhapka copper stills of Kannauj. Opens with notes of ${profile.top.join(', ')}, transitioning into an opulent heart of ${profile.heart.join(', ')}, and resting upon a timeless base of ${profile.base.join(', ')}. 100% alcohol-free with 12+ hour sillage.`;
    }

    case 'scent_notes':
      return JSON.stringify({ top: profile.top, heart: profile.heart, base: profile.base }, null, 2);

    case 'seo_metadata':
      return JSON.stringify(
        {
          meta_title: `${name} | Pure Artisanal Oil | Rose Valley Kannauj`,
          meta_keywords: `${name.toLowerCase()}, buy ${name.toLowerCase()} online, pure ${name.toLowerCase()}, alcohol-free essential oil, kannauj attar, Rose Valley Kannauj`,
          meta_description: `Discover ${name}. Hand-distilled in 400-year Kannauj copper stills. 100% alcohol-free botanical oil with 12+ hour sillage.`,
        },
        null,
        2
      );

    case 'customer_reviews':
      return JSON.stringify(
        [
          {
            name: 'Victoria Sterling',
            rating: 5,
            verified: true,
            date: '2 days ago',
            title: 'Magnificent Scent Evolution & Purity',
            review: `An absolute treasure! ${name} opens with vibrant ${profile.top[0]} and transitions gracefully into warm ${profile.base[0]}. It lingers effortlessly all day without any harsh synthetic undertones.`,
          },
          {
            name: 'Alexander Vance',
            rating: 5,
            verified: true,
            date: '1 week ago',
            title: 'Authentic Kannauj Heritage in Every Drop',
            review: `The Deg-Bhapka copper distillation really makes a difference. ${name} is silky, deeply relaxing, and completely alcohol-free. Highly recommended for collectors.`,
          },
          {
            name: 'Priya Sharma',
            rating: 5,
            verified: true,
            date: '2 weeks ago',
            title: 'Soothing, Long-Lasting & Luxurious',
            review: `I use ${name} daily. The balance of ${profile.heart[0]} is divine and so calming. Wonderful packaging and swift delivery.`,
          },
        ],
        null,
        2
      );

    case 'category_description': {
      return `Explore our world-renowned ${name} collection, hand-crafted through 400 years of unbroken Kannauj copper still (Deg-Bhapka) hydro-distillation tradition. Formulated with 100% alcohol-free pure botanical extracts for enduring 12-hour sillage and skin-nourishing purity.`;
    }

    default:
      return `Generated draft for: ${name}`;
  }
}
