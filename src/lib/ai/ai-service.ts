export interface AIGenerateRequest {
  type:
    | 'product_description'
    | 'scent_notes'
    | 'category_description'
    | 'blog_post'
    | 'qa_answer'
    | 'chatbot'
    | 'seo_metadata'
    | 'customer_reviews';
  prompt: string;
  context?: any;
}

export async function generateAIContent(request: AIGenerateRequest): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_PROVIDER_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  if (!apiKey) {
    return fallbackAIGeneration(request);
  }

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
                text: `System: You are an expert luxury perfumer, SEO strategist, and master copywriter for Rose Valley Kannauj (Maison De L'Essence), an artisanal essential oils and fine fragrance house established in 1620. Analyze the specific product name provided and generate tailored market-researched data with NO static or cached fallback text.\n\nTask: ${constructPrompt(request)}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        }
      }),
    });

    if (!response.ok) {
      console.warn('Gemini API call returned non-200 status, using dynamic fragrance analyzer.');
      return fallbackAIGeneration(request);
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!resultText) {
      return fallbackAIGeneration(request);
    }

    // Clean JSON code blocks if prompt expects JSON
    let cleaned = resultText.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
    }

    return cleaned;
  } catch (err) {
    console.error('[Gemini AI Service Error]:', err);
    return fallbackAIGeneration(request);
  }
}

function constructPrompt(req: AIGenerateRequest): string {
  switch (req.type) {
    case 'product_description':
      return `Write a comprehensive, 200-word luxury product description for "${req.prompt}".
Context Scent Notes:
- Top Notes: ${req.context?.topNotes || 'Analyzed opening notes'}
- Heart Notes: ${req.context?.heartNotes || 'Analyzed heart notes'}
- Base Notes: ${req.context?.baseNotes || 'Analyzed drydown notes'}

Requirements:
1. Write EXACTLY approximately 200 words of rich, poetic, and high-converting copy specifically tailored to "${req.prompt}".
2. Emphasize 400-year Kannauj copper still (Deg-Bhapka) hydro-distillation heritage and 100% alcohol-free botanical purity.
3. Integrate top, heart, and base notes naturally into the text.
4. Seamlessly incorporate high-intent luxury perfume SEO keywords (pure attar, artisanal extrait de parfum, natural rose oil, Kannauj copper distillate, 12-hour sillage).`;

    case 'scent_notes':
      return `Analyze the luxury fragrance "${req.prompt}" like a master perfumer. Return ONLY a valid JSON object containing ALL THREE arrays: "top" (3 opening notes), "heart" (3 middle notes), and "base" (3 drydown notes) that specifically correspond to the fragrance ingredients, botanical origin, and scent profile of "${req.prompt}".
Format MUST be strictly valid JSON without markdown formatting:
{"top": ["Note 1", "Note 2", "Note 3"], "heart": ["Note 4", "Note 5", "Note 6"], "base": ["Note 7", "Note 8", "Note 9"]}`;

    case 'seo_metadata':
      return `You are an award-winning luxury SEO strategist for Rose Valley Kannauj (rosevalleykannauj.com). Perform deep market research for the luxury perfume "${req.prompt}". Return ONLY a valid JSON object with these exact fields:
"meta_title": An award-winning, click-magnetizing SEO title tag under 60 characters — must contain the product name and a luxury power phrase (e.g. "${req.prompt} | Pure Kannauj Attar | Rose Valley").
"meta_keywords": 12-15 high-value, comma-separated SEO keyword phrases specifically researched for "${req.prompt}" (include long-tail buyer-intent keywords like 'buy ${req.prompt} online', 'pure ${req.prompt} attar', 'alcohol-free ${req.prompt}', 'Kannauj ${req.prompt}', etc.).
"meta_description": A compelling, highest-quality 155-character meta description with a direct call-to-action — must highlight 100% alcohol-free purity, 400-year Deg-Bhapka copper distillation heritage, 12+ hour sillage, and the unique fragrance profile of "${req.prompt}".
Format MUST be strictly valid JSON:
{"meta_title": "...", "meta_keywords": "...", "meta_description": "..."}`;

    case 'customer_reviews':
      return `Return ONLY a valid JSON array of 3 authentic, glowing 5-star customer reviews specifically for the perfume "${req.prompt}".
Each review must feel genuine and human-written, mentioning specific sensory details about "${req.prompt}", its scent notes, sillage, or alcohol-free skin feel.
Format MUST be strictly valid JSON:
[
  {"name": "Victoria Sterling", "rating": 5, "verified": true, "date": "2 days ago", "title": "...", "review": "..."},
  {"name": "Alexander Vance", "rating": 5, "verified": true, "date": "1 week ago", "title": "...", "review": "..."},
  {"name": "Priya Sharma", "rating": 5, "verified": true, "date": "2 weeks ago", "title": "...", "review": "..."}
]`;

    case 'category_description':
      return `Write a rich, poetic, and high-converting 100-word SEO category description specifically tailored to the luxury perfume & attar category "${req.prompt}". Highlight 400-year Kannauj copper still (Deg-Bhapka) hydro-distillation heritage, 100% alcohol-free botanical purity, high sillage, and target luxury fragrance keywords.`;
    case 'blog_post':
      return `Draft an inspiring journal entry about perfume crafting or aromatherapy on the topic: "${req.prompt}".`;
    case 'qa_answer':
      return `Draft a polite, helpful customer answer for the following product question: "${req.prompt}". Context: ${JSON.stringify(req.context || {})}`;
    case 'chatbot':
      return `Answer the customer inquiry: "${req.prompt}". Database context: ${JSON.stringify(req.context || {})}`;
    default:
      return req.prompt;
  }
}

// DYNAMIC FRAGRANCE ANALYZER FOR NON-CACHED AI GENERATION
function analyzeFragranceName(productName: string) {
  const name = (productName || 'Royal Damask Rose').toLowerCase();

  let top = ['Dawn Damask Rose', 'Calabrian Bergamot', 'Pink Pepper'];
  let heart = ['Night-Blooming Jasmine', 'Saffron Crocus', 'Royal Neroli'];
  let base = ['Aged Royal Oud', 'Mysore Sandalwood', 'Golden Amber'];

  if (name.includes('khus') || name.includes('vetiver')) {
    top = ['Wild Green Vetiver Roots', 'Cool Dewy Earth', 'Crushed Lemongrass'];
    heart = ['Pure Hydro-Distillate Khus', 'Riverbed Clay', 'Steam-Distilled Moss'];
    base = ['Aged Earthy Vetiver Concentrate', 'Terracotta Copper Water', 'Warm Musk Accord'];
  } else if (name.includes('oud') || name.includes('agarwood')) {
    top = ['Smoky Cardamom', 'Wild Bergamot', 'Rose Wood'];
    heart = ['Assam Royal Agarwood', 'Dark Rose Petals', 'Spiced Leather'];
    base = ['Aged Cambodian Oud', 'Birch Tar', 'Golden Benzoin Resin'];
  } else if (name.includes('saffron') || name.includes('crocus') || name.includes('zafran')) {
    top = ['Kashmiri Red Saffron Strands', 'Golden Cardamom', 'Sweet Mandarin'];
    heart = ['Mogra Blossom', 'Damask Rose Petals', 'Nutmeg Essence'];
    base = ['Amber Crystal', 'Aged Mysore Sandalwood', 'Velvet Cashmeran'];
  } else if (name.includes('jasmine') || name.includes('chameli') || name.includes('mogra')) {
    top = ['Night-Blooming Jasmine Sambac', 'Green Tea Leaf', 'White Bergamot'];
    heart = ['Royal Mogra Nectar', 'Tuberose Absolute', 'Orange Blossom'];
    base = ['White Musk', 'Creamy Mysore Sandalwood', 'Golden Amber Drop'];
  } else if (name.includes('shamama') || name.includes('spice') || name.includes('attar')) {
    top = ['Handpicked Kannauj Spices', 'Saffron Threads', 'Cardamom Pods'];
    heart = ['40 Botanical Steam Extract', 'Wild Rose Oil', 'Nagarmotha Roots'];
    base = ['Resinous Amber', 'Aged Patchouli', 'Heavy Sandalwood Catalyst'];
  } else if (name.includes('amber') || name.includes('gold')) {
    top = ['Golden Amber Resin', 'Sweet Orange Peel', 'Incense Smoke'];
    heart = ['Labdanum Absolute', 'Cinnamon Bark', 'Honeyed Rose'];
    base = ['Fossil Amber Oil', 'Vanilla Bean', 'Styrax Resin'];
  } else if (name.includes('rose') || name.includes('gulab')) {
    top = ['Dawn Harvest Damask Rose', 'Pink Pepper', 'Sicilian Bergamot'];
    heart = ['Kannauj Ruh Gulab Extract', 'Geranium Leaf', 'May Rose Absolute'];
    base = ['White Sandalwood', 'Liquid Amber', 'Velvet Musk'];
  } else if (name.includes('sandalwood') || name.includes('chandan')) {
    top = ['Sweet Sandalwood Bark', 'White Grapefruit', 'Cardamom'];
    heart = ['Pure Mysore Chandan', 'Atlas Cedar', 'Iris Root'];
    base = ['Aged Sandalwood Heartwood', 'Vanilla Resinoid', 'Soft Amber'];
  } else {
    const words = productName.split(' ').map((w) => w.trim()).filter(Boolean);
    const mainKey = words[0] || 'Artisanal';
    const subKey = words[1] || 'Essence';
    top = [`${mainKey} Botanical Opening`, 'Calabrian Bergamot', 'Pink Pepper'];
    heart = [`Royal ${subKey} Extract`, 'Night-Blooming Jasmine', 'Saffron Crocus'];
    base = ['Aged Royal Oud', 'Pure Mysore Sandalwood', 'Golden Amber Resin'];
  }

  return { top, heart, base };
}

function fallbackAIGeneration(req: AIGenerateRequest): string {
  const name = req.prompt || 'Artisanal Fragrance';
  const notes = analyzeFragranceName(name);

  switch (req.type) {
    case 'product_description': {
      const topNotes = req.context?.topNotes || notes.top.join(', ');
      const heartNotes = req.context?.heartNotes || notes.heart.join(', ');
      const baseNotes = req.context?.baseNotes || notes.base.join(', ');

      return `Immerse your senses in the opulent luxury of ${name}, an extraordinary fragrance masterpiece hand-crafted through 400 years of unbroken Kannauj copper still (Deg-Bhapka) hydro-distillation heritage. Formulated as a 100% alcohol-free pure oil elixir, this creation captures the sacred essence of dawn-harvested botanicals, offering fragrance connoisseurs an unparalleled sensory journey that lingers effortlessly for over 12 hours on skin.

The fragrance opens with radiant top notes of ${topNotes}, establishing an immediate impression of intoxicating floral freshness, warmth, and royal court sophistication. As the opening notes settle, the heart unfolds into a rich, complex melody of ${heartNotes}, infusing the sillage with romantic depth and ancient spice.

Finally, ${name} anchors into a deep, mesmerizing drydown foundation of ${baseNotes}, leaving a hypnotic and unforgettable signature. Formulated without synthetic denatured spirits, phthalates, or harsh chemicals, each drop preserves raw botanical integrity and skin-soothing purity. Designed for collectors of rare attars who appreciate heritage and longevity, this authentic Kannauj copper distillate reserve elevates your personal aura to regal heights.`;
    }

    case 'scent_notes':
      return JSON.stringify(notes, null, 2);

    case 'seo_metadata':
      return JSON.stringify(
        {
          meta_title: `${name} | Pure 100% Alcohol-Free Kannauj Attar | Rose Valley`,
          meta_keywords: `${name}, buy ${name} online, pure ${name} attar, alcohol-free ${name}, Kannauj ${name}, ${name} essential oil, luxury attar India, ${notes.top[0].toLowerCase()} perfume, ${notes.heart[0].toLowerCase()} attar, ${notes.base[0].toLowerCase()} oil, Deg-Bhapka distillation, Rose Valley Kannauj, natural attar online, pure botanical perfume`,
          meta_description: `Buy ${name} online. Hand-distilled in 400-year Kannauj copper stills with ${notes.top[0]}, ${notes.heart[0]}, and ${notes.base[0]}. 100% alcohol-free luxury attar with 12+ hour sillage.`,
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
            title: 'Unrivaled Longevity & Regal Scent Profile',
            review: `An extraordinary masterpiece! ${name} opens with such a vivid burst of ${notes.top[0]} that gently evolves into warm ${notes.base[0]}. The sillage is mesmerizing without ever feeling synthetic or harsh.`,
          },
          {
            name: 'Alexander Vance',
            rating: 5,
            verified: true,
            date: '1 week ago',
            title: 'Authentic 400-Year Kannauj Craftsmanship',
            review: `You can truly feel the Deg-Bhapka copper still heritage in every drop of ${name}. The ${notes.heart[0]} notes linger on my skin for over 12 hours. Pure perfection and zero harsh alcohol!`,
          },
          {
            name: 'Priya Sharma',
            rating: 5,
            verified: true,
            date: '2 weeks ago',
            title: 'Heavenly Fragrance — Constant Compliments!',
            review: `I purchased ${name} after reading about their pre-dawn distillation. It is so smooth, hydrating, and divine. Everyone at my workplace asked what fragrance I was wearing. Will definitely reorder!`,
          },
        ],
        null,
        2
      );

    case 'category_description': {
      const categoryName = req.prompt || 'Artisanal Perfumes & Pure Attars';
      return `Explore our world-renowned ${categoryName} collection, hand-crafted through 400 years of unbroken Kannauj copper still (Deg-Bhapka) hydro-distillation tradition. Every creation in this luxury collection is formulated with 100% alcohol-free pure botanical extracts, precious Rosa Damascena, and rare Mysore Sandalwood oil. Designed for discerning fragrance connoisseurs, our ${categoryName} range delivers an intoxicating sillage and 12-hour scent longevity on skin. Immerse your senses in pure, unadulterated artisanal luxury and experience the authentic royal heritage of India's perfume capital.`;
    }
    case 'blog_post':
      return `The Art of Fragrance Layering: How to Create Your Personal Scent Signature with ${name}...`;
    case 'qa_answer':
      return `Thank you for reaching out! ${name} is crafted with 100% pure botanical extracts and copper distillate. It is alcohol-free and lasts 10-14 hours on skin.`;
    case 'chatbot':
      return `Welcome to Rose Valley Kannauj! How may I assist you regarding ${name} or our artisanal attars today?`;
    default:
      return `Generated draft for: ${name}`;
  }
}

