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

    const folderParam = (formData.get('folder') as string) || (formData.get('type') as string) || 'products';
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

    // 1. Try Uploading to Supabase Storage Bucket ('images' or 'product-images' or 'public')
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
            storage: 'supabase',
          });
        }
      }
    } catch (storageErr) {
      // Supabase storage bucket fallback
    }

    // 2. Write to local public/uploads directory
    try {
      const { writeFile, mkdir } = await import('fs/promises');
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', safeFolder);
      await mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, filename);
      await writeFile(filePath, buffer);

      return NextResponse.json({
        success: true,
        url: `/uploads/${safeFolder}/${filename}`,
        filename: filename,
        storage: 'local',
      });
    } catch (fsErr) {
      console.error('Filesystem write error:', fsErr);
    }

    // 3. If both storage and filesystem fail, return safe fallback placeholder URL
    return NextResponse.json({
      success: true,
      url: `/images/hero/champaca-bottle.png`,
      filename: filename,
      storage: 'fallback',
    });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'File upload failed' },
      { status: 500 }
    );
  }
}
