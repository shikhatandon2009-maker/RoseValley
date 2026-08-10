import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const CURATED_BG_FALLBACKS = [
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?q=80&w=1600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=1600&auto=format&fit=crop',
];

const CURATED_BOTTLE_FALLBACKS = [
  'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop',
];

export async function POST(request: Request) {
  try {
    const { prompt, type } = await request.json();

    if (!prompt) {
      return NextResponse.json({ success: false, error: 'Prompt is required' }, { status: 400 });
    }

    const isBottle = type === 'bottle';
    const width = isBottle ? 800 : 1280;
    const height = isBottle ? 800 : 720;

    const fullPrompt = isBottle
      ? `${prompt}, luxury crystal perfume bottle containing golden oil, isolated on dark plain background, studio lighting, photorealistic 8k render`
      : `${prompt}, ultra luxury dark moody aesthetic background, golden ambient lighting, cinematic depth of field, high resolution, luxury perfume background`;

    const seed = Math.floor(Math.random() * 1000000);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=${width}&height=${height}&nologo=true&seed=${seed}`;

    let imageBuffer: Buffer | null = null;
    let extension = '.png';

    try {
      const response = await fetch(pollinationsUrl, { signal: AbortSignal.timeout(15000) });
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        imageBuffer = Buffer.from(arrayBuffer);
      }
    } catch (err) {
      console.warn('Pollinations AI image generation timed out or failed, using curated luxury fallback.');
    }

    // Fallback to curated image if Pollinations is offline
    if (!imageBuffer || imageBuffer.length === 0) {
      const fallbacks = isBottle ? CURATED_BOTTLE_FALLBACKS : CURATED_BG_FALLBACKS;
      const fallbackUrl = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      const response = await fetch(fallbackUrl);
      const arrayBuffer = await response.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);
    }

    // Save generated file to public/uploads/hero/
    const filename = `ai_${isBottle ? 'bottle' : 'bg'}_${Date.now()}${extension}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'hero');
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, imageBuffer);

    const publicUrl = `/uploads/hero/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      prompt: prompt,
      type: type,
    });
  } catch (error: any) {
    console.error('AI Image Generation Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'AI Generation Failed' }, { status: 500 });
  }
}
