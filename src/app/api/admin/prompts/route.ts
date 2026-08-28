import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';
import { DEFAULT_AI_PROMPTS } from '@/lib/ai/default-prompts';
import { AIPromptItem } from '@/types/ai-prompt';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();

    const { data: dbPrompts, error } = await supabase
      .from('ai_prompts')
      .select('*')
      .eq('store_id', STORE_ID)
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('[AI Prompts] Error fetching from DB, using defaults:', error.message);
      return NextResponse.json(
        { prompts: DEFAULT_AI_PROMPTS, is_fallback: true },
        { headers: NO_CACHE_HEADERS }
      );
    }

    // Merge DB prompts with defaults to ensure all slugs exist
    const promptMap = new Map<string, AIPromptItem>();

    // Fill defaults first
    DEFAULT_AI_PROMPTS.forEach((p) => {
      promptMap.set(p.slug, { ...p });
    });

    // Override with DB values
    if (dbPrompts && dbPrompts.length > 0) {
      dbPrompts.forEach((p: any) => {
        const defaultItem = DEFAULT_AI_PROMPTS.find((d) => d.slug === p.slug);
        const existing = promptMap.get(p.slug) || ({} as AIPromptItem);

        // Safe parse variables
        let parsedVars = p.variables;
        if (typeof parsedVars === 'string') {
          try {
            parsedVars = JSON.parse(parsedVars);
          } catch (_) {
            parsedVars = defaultItem?.variables || [];
          }
        }
        if (!Array.isArray(parsedVars) || parsedVars.length === 0) {
          parsedVars = defaultItem?.variables || [];
        }

        // Safe parse sample_input
        let parsedSample = p.sample_input;
        if (typeof parsedSample === 'string') {
          try {
            parsedSample = JSON.parse(parsedSample);
          } catch (_) {
            parsedSample = defaultItem?.sample_input || {};
          }
        }
        if (!parsedSample || typeof parsedSample !== 'object' || Object.keys(parsedSample).length === 0) {
          parsedSample = defaultItem?.sample_input || {};
        }

        promptMap.set(p.slug, {
          ...existing,
          ...p,
          variables: parsedVars,
          sample_input: parsedSample,
          model: p.model || defaultItem?.model || 'gemini-1.5-flash',
          temperature: typeof p.temperature === 'number' ? p.temperature : defaultItem?.temperature ?? 0.7,
          max_output_tokens: typeof p.max_output_tokens === 'number' ? p.max_output_tokens : defaultItem?.max_output_tokens ?? 3500,
          expected_output_format: p.expected_output_format || defaultItem?.expected_output_format || 'json',
        });
      });
    }

    const finalPrompts = Array.from(promptMap.values());

    return NextResponse.json({ prompts: finalPrompts, is_fallback: false }, { headers: NO_CACHE_HEADERS });
  } catch (err: any) {
    console.error('API Error in GET /api/admin/prompts:', err);
    return NextResponse.json(
      { prompts: DEFAULT_AI_PROMPTS, is_fallback: true, error: err.message },
      { headers: NO_CACHE_HEADERS }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt }: { prompt: AIPromptItem } = body;

    if (!prompt || !prompt.slug || !prompt.system_prompt || !prompt.user_prompt_template) {
      return NextResponse.json(
        { error: 'Missing required prompt fields (slug, system_prompt, user_prompt_template)' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const defaultItem = DEFAULT_AI_PROMPTS.find((d) => d.slug === prompt.slug);
    const supabase = getSupabaseServerClient();

    const payload = {
      store_id: STORE_ID,
      slug: prompt.slug,
      title: prompt.title || defaultItem?.title || prompt.slug,
      description: prompt.description !== undefined ? prompt.description : defaultItem?.description || '',
      category: prompt.category || defaultItem?.category || 'Catalog & SEO',
      system_prompt: prompt.system_prompt,
      user_prompt_template: prompt.user_prompt_template,
      variables: Array.isArray(prompt.variables) && prompt.variables.length > 0 ? prompt.variables : defaultItem?.variables || [],
      model: prompt.model || defaultItem?.model || 'gemini-1.5-flash',
      temperature: Number(prompt.temperature) >= 0 ? Number(prompt.temperature) : 0.7,
      max_output_tokens: Number(prompt.max_output_tokens) > 0 ? Number(prompt.max_output_tokens) : 3500,
      expected_output_format: prompt.expected_output_format || defaultItem?.expected_output_format || 'json',
      is_active: prompt.is_active !== undefined ? prompt.is_active : true,
      sample_input: prompt.sample_input && Object.keys(prompt.sample_input).length > 0 ? prompt.sample_input : defaultItem?.sample_input || {},
      updated_at: new Date().toISOString(),
    };

    const { data: savedPrompt, error } = await supabase
      .from('ai_prompts')
      .upsert(payload, { onConflict: 'store_id,slug' })
      .select('*')
      .single();

    if (error) {
      console.error('Error saving prompt to Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
    }

    return NextResponse.json(
      {
        message: `Prompt '${prompt.title || prompt.slug}' saved successfully to Supabase.`,
        prompt: savedPrompt,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err: any) {
    console.error('API Error in PUT /api/admin/prompts:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    if (action === 'seed_defaults') {
      const supabase = getSupabaseServerClient();
      const payloads = DEFAULT_AI_PROMPTS.map((p) => ({
        store_id: STORE_ID,
        slug: p.slug,
        title: p.title,
        description: p.description,
        category: p.category,
        system_prompt: p.system_prompt,
        user_prompt_template: p.user_prompt_template,
        variables: p.variables,
        model: p.model,
        temperature: p.temperature,
        max_output_tokens: p.max_output_tokens,
        expected_output_format: p.expected_output_format,
        is_active: true,
        sample_input: p.sample_input,
        updated_at: new Date().toISOString(),
      }));

      const { data, error } = await supabase
        .from('ai_prompts')
        .upsert(payloads, { onConflict: 'store_id,slug' })
        .select('*');

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
      }

      return NextResponse.json(
        { message: `Successfully seeded all ${data?.length || payloads.length} prompts to Supabase!`, count: data?.length },
        { headers: NO_CACHE_HEADERS }
      );
    }

    return PUT(request);
  } catch (err: any) {
    console.error('API Error in POST /api/admin/prompts:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
