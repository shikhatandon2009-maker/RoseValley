import { NextRequest, NextResponse } from 'next/server';
import { interpolateTemplate } from '@/lib/ai/default-prompts';
import { AIPromptTestRequest, AIPromptTestResponse } from '@/types/ai-prompt';
import { fallbackAIGenerationDirect } from '@/lib/ai/ai-service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body: AIPromptTestRequest = await request.json();
    const {
      slug,
      system_prompt,
      user_prompt_template,
      variables_input = {},
      model = 'gemini-1.5-flash',
      temperature = 0.7,
      max_output_tokens = 3500,
      expected_output_format = 'json',
    } = body;

    if (!user_prompt_template) {
      return NextResponse.json({ error: 'User prompt template is required' }, { status: 400 });
    }

    // Interpolate variables into user template
    const interpolatedUserPrompt = interpolateTemplate(user_prompt_template, variables_input);

    const fullPromptText = system_prompt
      ? `System: ${system_prompt}\n\nTask: ${interpolatedUserPrompt}`
      : interpolatedUserPrompt;

    const apiKey = process.env.GEMINI_API_KEY || process.env.AI_PROVIDER_API_KEY;
    let rawOutput = '';
    let usedModel = model;
    let isLiveApi = false;

    if (apiKey) {
      // Candidate models
      const modelsToTry = [
        model,
        'gemini-1.5-flash',
        'gemini-2.0-flash',
        'gemini-1.5-pro',
      ].filter((v, i, a) => a.indexOf(v) === i);

      for (const m of modelsToTry) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`;
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: fullPromptText }],
                },
              ],
              generationConfig: {
                temperature: Number(temperature) || 0.7,
                maxOutputTokens: Number(max_output_tokens) || 3500,
              },
            }),
          });

          if (res.ok) {
            const data = await res.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text && text.trim()) {
              rawOutput = text;
              usedModel = m;
              isLiveApi = true;
              break;
            }
          } else {
            console.warn(`[Prompt Test] Gemini API with model ${m} returned HTTP ${res.status}`);
          }
        } catch (apiErr) {
          console.warn(`[Prompt Test] API error with model ${m}:`, apiErr);
        }
      }
    }

    // If API didn't return (or no key / quota), use localized intelligent fallback
    if (!rawOutput) {
      const promptVar = variables_input.prompt || variables_input.name || 'Royal Damask Rose';
      rawOutput = fallbackAIGenerationDirect(slug || 'all_in_one_seo_and_description', promptVar, variables_input);
      usedModel = 'Local High-Intelligence Botanical Engine (Offline / Live Fallback)';
    }

    const latencyMs = Date.now() - startTime;

    // Analyze output and check JSON validity
    let parsedOutput: any = null;
    let isValidJson = false;

    let cleaned = rawOutput.trim();
    const matchFence = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (matchFence && matchFence[1]) {
      cleaned = matchFence[1].trim();
    }

    try {
      parsedOutput = JSON.parse(cleaned);
      isValidJson = true;
    } catch (_) {
      // Substring fallback
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace > firstBrace) {
        try {
          parsedOutput = JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
          isValidJson = true;
        } catch (__) {
          isValidJson = false;
        }
      }
    }

    const responsePayload: AIPromptTestResponse = {
      success: true,
      raw_output: rawOutput,
      parsed_output: parsedOutput,
      is_valid_json: isValidJson,
      latency_ms: latencyMs,
      model_used: usedModel,
      interpolated_prompt: fullPromptText,
    };

    return NextResponse.json(responsePayload);
  } catch (err: any) {
    console.error('Error testing prompt:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Error testing prompt',
        latency_ms: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}
