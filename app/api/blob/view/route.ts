import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl.searchParams.get('url');
    if (!url) {
      return new NextResponse('Missing url parameter', { status: 400 });
    }

    // Security: Only allow proxying Vercel Blob storage URLs
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return new NextResponse('Invalid url parameter', { status: 400 });
    }

    if (!parsedUrl.hostname.endsWith('blob.vercel-storage.com')) {
      return new NextResponse('Forbidden host', { status: 403 });
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return new NextResponse('Blob token not configured', { status: 500 });
    }

    const rangeHeader = req.headers.get('range');
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };

    if (rangeHeader) {
      headers['Range'] = rangeHeader;
    }

    const upstreamResponse = await fetch(url, {
      headers,
    });

    if (!upstreamResponse.ok && upstreamResponse.status !== 206) {
      return new NextResponse('Failed to fetch blob from storage', {
        status: upstreamResponse.status,
      });
    }

    const responseHeaders = new Headers();
    const forwardHeaders = [
      'content-type',
      'content-length',
      'content-range',
      'accept-ranges',
      'last-modified',
      'etag',
    ];

    for (const h of forwardHeaders) {
      const val = upstreamResponse.headers.get(h);
      if (val) responseHeaders.set(h, val);
    }

    if (!responseHeaders.has('accept-ranges')) {
      responseHeaders.set('accept-ranges', 'bytes');
    }

    // Long-term immutable caching for static media
    responseHeaders.set('cache-control', 'public, max-age=31536000, immutable');

    return new NextResponse(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error('[Blob View API] Streaming error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
