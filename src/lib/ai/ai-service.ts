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
  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_PROVIDER_API_KEY || 'AIzaSyCfmqMCHJL0alTzlk95J04SubiuMhw23Rk';
  const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash';

  if (!apiKey) {
    return fallbackAIGeneration(request);
  }

  try {
    // Primary: Google Gemini API Endpoint
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
                text: `System: You are an expert luxury perfumer, SEO strategist, and master copywriter for Rose Valley Kannauj (Maison De L'Essence), an artisanal essential oils and fine fragrance house established in 1620. Speak in an elegant, refined tone.\n\nTask: ${constructPrompt(request)}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
        }
      }),
    });

    if (!response.ok) {
      console.warn('Gemini API call returned non-200 status, using fallback.');
      return fallbackAIGeneration(request);
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!resultText) {
      return fallbackAIGeneration(request);
    }

    return resultText.trim();
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
- Top Notes: ${req.context?.topNotes || 'Damask Rose, Calabrian Bergamot'}
- Heart Notes: ${req.context?.heartNotes || 'Night-Blooming Jasmine, Saffron Crocus'}
- Base Notes: ${req.context?.baseNotes || 'Aged Royal Oud, Mysore Sandalwood, Golden Amber'}

Requirements:
1. Write approximately 200 words of rich, poetic, and high-converting copy.
2. Emphasize 400-year Kannauj copper still (Deg-Bhapka) hydro-distillation heritage and 100% alcohol-free botanical purity.
3. Integrate top, heart, and base notes naturally.
4. Seamlessly incorporate high-intent luxury perfume SEO keywords (e.g., pure attar, artisanal extrait de parfum, natural rose oil, Kannauj copper distillate).`;

    case 'scent_notes':
      return `Return ONLY a valid JSON object containing ALL THREE arrays: "top", "heart", and "base" for a perfume named "${req.prompt}".
Format MUST be strictly valid JSON without any markdown formatting or commentary:
{"top": ["Note 1", "Note 2"], "heart": ["Note 3", "Note 4"], "base": ["Note 5", "Note 6"]}`;

    case 'seo_metadata':
      return `Return ONLY a valid JSON object with SEO metadata for perfume "${req.prompt}".
Format MUST be strictly valid JSON:
{"meta_title": "${req.prompt} | Pure Kannauj Attar | Maison De L'Essence", "meta_description": "Discover ${req.prompt}, hand-distilled in 400-year copper stills using pure rose oil, aged oud, and sandalwood. 100% alcohol-free luxury attar."}`;

    case 'customer_reviews':
      return `Return ONLY a valid JSON array of 3 authentic, glowing 5-star customer reviews for "${req.prompt}".
Format MUST be strictly valid JSON:
[
  {"name": "Victoria Sterling", "rating": 5, "verified": true, "date": "2 days ago", "title": "Unrivaled Longevity & Regal Scent", "review": "An extraordinary masterpiece! The rose notes bloom gracefully into warm amber and aged sandalwood."},
  {"name": "Alexander Vance", "rating": 5, "verified": true, "date": "1 week ago", "title": "Authentic Kannauj Craftsmanship", "review": "You can truly feel the 400-year Deg-Bhapka heritage in every drop. Exceptional sillage."},
  {"name": "Priya Sharma", "rating": 5, "verified": true, "date": "2 weeks ago", "title": "Pure & Heavenly", "review": "100% alcohol-free and so soothing on skin. Receives compliments wherever I go!"}
]`;

    case 'category_description':
      return `Write a captivating 2-sentence category description for "${req.prompt}".`;
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

function fallbackAIGeneration(req: AIGenerateRequest): string {
  switch (req.type) {
    case 'product_description':
      return `Immerse yourself in the opulent luxury of ${req.prompt || 'this artisanal fragrance'}, a masterpiece crafted through 400 years of unbroken Kannauj copper still (Deg-Bhapka) hydro-distillation heritage. Hand-extracted from dawn-harvested Damask Rose petals and aged botanicals, this 100% alcohol-free elixir embodies timeless sophistication, royal court elegance, and unmatched olfactory longevity.

The fragrance opens with an intoxicating top note bouquet of hand-selected Damask Rose and sun-ripened Calabrian Bergamot, immediately enveloping your senses in radiant floral warmth. As the top notes settle, the opulent heart unfolds into velvet Jasmine Sambac and golden Saffron Crocus, creating an ethereal harmony of ancient spice and romantic blooms.

Finally, the scent anchors into a deep, mesmerizing foundation of aged Royal Oud, Mysore Sandalwood, and smoldering Golden Amber. Designed for connoisseurs of fine perfume who value purity and craftsmanship, each drop leaves an unforgettable trail of mystery and grandeur that lingers gracefully on the skin for up to 14 hours. Elevate your personal signature with this authentic Kannauj copper distillate reserve.`;

    case 'scent_notes':
      return JSON.stringify(
        {
          top: [
            `${req.prompt ? req.prompt.split(' ')[0] : 'Damask'} Rose Petals`,
            'Calabrian Bergamot',
            'Pink Pepper',
          ],
          heart: ['Night-Blooming Jasmine', 'Saffron Crocus', 'Royal Neroli'],
          base: ['Aged Royal Oud', 'Mysore Sandalwood', 'Golden Amber'],
        },
        null,
        2
      );

    case 'seo_metadata':
      return JSON.stringify(
        {
          meta_title: `${req.prompt || 'Royal Perfume'} | Pure Kannauj Attar | Maison De L'Essence`,
          meta_description: `Shop ${req.prompt || 'artisanal perfume'}, hand-distilled in 400-year Kannauj copper stills with pure Damask rose, aged oud, and Mysore sandalwood. 100% alcohol-free.`,
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
            title: 'Unrivaled Longevity & Regal Scent',
            review: `An extraordinary masterpiece! ${req.prompt || 'This perfume'} blooms gracefully into warm amber and aged sandalwood that lasts all day.`,
          },
          {
            name: 'Alexander Vance',
            rating: 5,
            verified: true,
            date: '1 week ago',
            title: 'Authentic Kannauj Craftsmanship',
            review: 'You can truly feel the 400-year Deg-Bhapka heritage in every drop. Exceptional sillage and zero harsh alcohol.',
          },
          {
            name: 'Priya Sharma',
            rating: 5,
            verified: true,
            date: '2 weeks ago',
            title: 'Pure & Heavenly Fragrance',
            review: '100% alcohol-free and so soothing on skin. I receive endless compliments wherever I go!',
          },
        ],
        null,
        2
      );

    case 'category_description':
      return `Discover our curated collection of ${req.prompt || 'fine botanicals'}, crafted with unyielding dedication to purity, luxury, and olfactory mastery.`;
    case 'blog_post':
      return `The Art of Fragrance Layering: How to Create Your Personal Scent Signature\n\nFragrance layering is an ancient ritual of self-expression...`;
    case 'qa_answer':
      return `Thank you for reaching out! Our fragrances are crafted with 100% pure botanical extracts and organic spirits. They are cruelty-free and formulated to last 8-12 hours on skin.`;
    case 'chatbot':
      return `Welcome to Rose Valley Kannauj! I am your personal fragrance consultant. How may I assist you with our artisanal perfumes or order inquiries today?`;
    default:
      return `Generated draft for: ${req.prompt}`;
  }
}
