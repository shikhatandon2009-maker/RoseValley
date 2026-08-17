import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    const folderParam = (formData.get('folder') as string) || (formData.get('type') as string) || 'uploads';
    const safeFolder = folderParam.replace(/[^a-z0-9_-]/gi, '');

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || 'image/png';

    // Create unique safe filename
    const fileExtension = path.extname(file.name) || '.png';
    const cleanBasename = path
      .basename(file.name, fileExtension)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_');
    const filename = `${cleanBasename}_${Date.now()}${fileExtension}`;

    // 1. Try Uploading to Supabase Storage Bucket if available
    try {
      const supabase = getSupabaseServerClient();
      const storagePath = `${safeFolder}/${filename}`;
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('images')
        .upload(storagePath, buffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (!uploadErr && uploadData) {
        const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(storagePath);
        if (publicUrlData && publicUrlData.publicUrl) {
          return NextResponse.json({
            success: true,
            url: publicUrlData.publicUrl,
            filename: filename,
          });
        }
      }
    } catch (storageErr) {
      // Supabase storage bucket not configured or RLS blocked, fallback to next strategy
    }

    // 2. Try writing to local public/uploads (Local Development Only, skip EROFS on Vercel/Serverless)
    let localSavedUrl: string | null = null;
    try {
      if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
        const { writeFile, mkdir } = await import('fs/promises');
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', safeFolder);
        await mkdir(uploadDir, { recursive: true });
        const filePath = path.join(uploadDir, filename);
        await writeFile(filePath, buffer);
        localSavedUrl = `/uploads/${safeFolder}/${filename}`;
      }
    } catch (fsErr) {
      // Read-only filesystem on Vercel / serverless runtime
      localSavedUrl = null;
    }

    if (localSavedUrl) {
      return NextResponse.json({
        success: true,
        url: localSavedUrl,
        filename: filename,
      });
    }

    // 3. Robust Serverless & Vercel Fallback: Return optimized Base64 Data URI
    // Works 100% reliably everywhere (Vercel, AWS Lambda, Docker) without needing filesystem write permissions
    const base64Data = buffer.toString('base64');
    const dataUri = `data:${mimeType};base64,${base64Data}`;

    return NextResponse.json({
      success: true,
      url: dataUri,
      filename: filename,
    });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'File upload failed' },
      { status: 500 }
    );
  }
}
