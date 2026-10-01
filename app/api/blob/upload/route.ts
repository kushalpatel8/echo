import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { uploadToBlob, resolveMediaDisplayUrl } from '@/lib/blob';
import { isContentHarmful } from '@/lib/moderation';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: 'Invalid file format. Please upload an image (JPEG, PNG, WebP, GIF) or video (MP4, WebM).' },
        { status: 400 }
      );
    }

    // Size limit: 15MB for images, 50MB for videos
    const maxImageSize = 15 * 1024 * 1024;
    const maxVideoSize = 50 * 1024 * 1024;

    if (isImage && file.size > maxImageSize) {
      return NextResponse.json(
        { error: 'Image file is too large. Maximum allowed size is 15MB.' },
        { status: 400 }
      );
    }

    if (isVideo && file.size > maxVideoSize) {
      return NextResponse.json(
        { error: 'Video file is too large. Maximum allowed size is 50MB.' },
        { status: 400 }
      );
    }

    // Fast safety moderation check on filename
    if (isContentHarmful(file.name)) {
      return NextResponse.json(
        { error: 'File name contains prohibited or harmful terms.' },
        { status: 400 }
      );
    }

    const blob = await uploadToBlob(file.name, file, {
      contentType: file.type,
      folder: 'community',
    });

    const mediaType = isVideo ? 'video' : 'image';
    const viewUrl = resolveMediaDisplayUrl(blob.url);

    return NextResponse.json({
      success: true,
      url: blob.url,
      viewUrl,
      mediaType,
      size: file.size,
      name: file.name,
    });
  } catch (error: any) {
    console.error('[Blob Upload API] Upload failed:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to upload media to Vercel Blob store.' },
      { status: 500 }
    );
  }
}
