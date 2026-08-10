import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { generateAIContent } from '@/lib/ai/ai-service';

export async function POST(request: Request) {
  try {
    const { type, prompt, context } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 });
    }

    const draft = await generateAIContent({ type, prompt, context });

    return NextResponse.json({ success: true, draft });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'AI Generation Error' }, { status: 500 });
  }
}
