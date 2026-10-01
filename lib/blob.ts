import { put, del, head } from '@vercel/blob';

/**
 * Uploads a file/buffer to Vercel Blob store.
 */
export async function uploadToBlob(
  filename: string,
  data: File | Blob | Buffer | ArrayBuffer | ReadableStream,
  options?: {
    contentType?: string;
    folder?: string;
  }
) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error('BLOB_READ_WRITE_TOKEN is not configured in environment variables.');
  }

  const cleanFolder = options?.folder ? options.folder.replace(/\/+$/, '') : 'community';
  const cleanName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  const pathname = `${cleanFolder}/${Date.now()}-${cleanName}`;

  const blob = await put(pathname, data, {
    access: 'private',
    token,
    contentType: options?.contentType,
  });

  return blob;
}

/**
 * Deletes a media blob from Vercel Blob store by its URL.
 */
export async function deleteFromBlob(url: string) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token || !url) return;

  try {
    // Only attempt deletion if it's a Vercel Blob URL
    if (url.includes('blob.vercel-storage.com')) {
      await del(url, { token });
    }
  } catch (err) {
    console.warn('[Vercel Blob] Failed to delete blob:', err);
  }
}

/**
 * Converts a raw private Vercel Blob URL into a streamable viewer URL.
 * If the URL is already an external URL (e.g. Unsplash, HTTP), leaves it as is.
 */
export function resolveMediaDisplayUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (url.includes('blob.vercel-storage.com')) {
    return `/api/blob/view?url=${encodeURIComponent(url)}`;
  }
  return url;
}
