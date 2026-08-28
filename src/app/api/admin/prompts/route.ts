import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';
import { DEFAULT_AI_PROMPTS } from '@/lib/ai/default-prompts';
import { AIPromptItem } from '@/types/ai-prompt';

export const dynamic = 'force-dynamic';

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
      return NextResponse.json({ prompts: DEFAULT_AI_PROMPTS, is_fallback: true });
    }

    if (!dbPrompts || dbPrompts.length === 0) {
      // Return defaults if table is empty
      return NextResponse.json({ prompts: DEFAULT_AI_PROMPTS, is_fallback: true });
    }

    // Merge DB prompts with defaults to ensure all slugs exist
    const promptMap = new Map<string, AIPromptItem>();
    
    // Fill defaults first
    DEFAULT_AI_PROMPTS.forEach((p) => {
      promptMap.set(p.slug, { ...p });
    });

    // Override with DB values
    dbPrompts.forEach((p: any) => {
      promptMap.set(p.slug, {
        ...promptMap.get(p.slug),
        ...p,
      });
    });

    const finalPrompts = Array.from(promptMap.values());

    return NextResponse.json({ prompts: finalPrompts, is_fallback: false });
  } catch (err: any) {
    console.error('API Error in GET /api/admin/prompts:', err);
    return NextResponse.json({ prompts: DEFAULT_AI_PROMPTS, is_fallback: true, error: err.message });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt }: { prompt: AIPromptItem } = body;

    if (!prompt || !prompt.slug || !prompt.system_prompt || !prompt.user_prompt_template) {
      return NextResponse.json({ error: 'Missing required prompt fields (slug, system_prompt, user_prompt_template)' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    const payload = {
      store_id: STORE_ID,
      slug: prompt.slug,
      title: prompt.title || prompt.slug,
      description: prompt.description || '',
      category: prompt.category || 'Catalog & SEO',
      system_prompt: prompt.system_prompt,
      user_prompt_template: prompt.user_prompt_template,
      variables: prompt.variables || [],
      model: prompt.model || 'gemini-1.5-flash',
      temperature: Number(prompt.temperature) || 0.7,
      max_output_tokens: Number(prompt.max_output_tokens) || 3500,
      expected_output_format: prompt.expected_output_format || 'json',
      is_active: prompt.is_active !== undefined ? prompt.is_active : true,
      sample_input: prompt.sample_input || {},
      updated_at: new Date().toISOString(),
    };

    const { data: savedPrompt, error } = await supabase
      .from('ai_prompts')
      .upsert(payload, { onConflict: 'store_id,slug' })
      .select('*')
      .single();

    if (error) {
      console.error('Error saving prompt to Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: `Prompt '${prompt.title}' saved successfully to Supabase.`,
      prompt: savedPrompt,
    });
  } catch (err: any) {
    console.error('API Error in PUT /api/admin/prompts:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return PUT(request);
}
