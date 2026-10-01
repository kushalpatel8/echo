import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Post from '@/lib/models/Post';
import User from '@/lib/models/User';
import { deleteFromBlob, resolveMediaDisplayUrl } from '@/lib/blob';
import { getOrSetCache, delCache } from '@/lib/redis';
import { isContentHarmful, checkMessageHarmfulness } from '@/lib/moderation';

export const dynamic = 'force-dynamic';

const POSTS_CACHE_KEY = 'community:posts:all';

export async function GET() {
  try {
    const posts = await getOrSetCache(POSTS_CACHE_KEY, 15, async () => {
      await connectDB();
      const rawPosts = await Post.find().sort({ createdAt: -1 }).lean();
      return rawPosts.map((p: any) => ({
        ...p,
        mediaUrl: resolveMediaDisplayUrl(p.mediaUrl),
      }));
    });

    return NextResponse.json({ posts });
  } catch (error: any) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const currentUser = await User.findOne({ clerkId: userId });

    if (!currentUser) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    if (currentUser.isBanned) {
      return NextResponse.json({ error: 'Your account is suspended and cannot create posts.' }, { status: 403 });
    }

    const body = await req.json();
    const { content, mediaUrl, mediaType } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Safety moderation check on post text content
    const fastCheck = isContentHarmful(content);
    if (fastCheck) {
      return NextResponse.json(
        { error: 'Your post contains prohibited or harmful language. Please adhere to community guidelines.' },
        { status: 400 }
      );
    }

    const deepCheck = await checkMessageHarmfulness(content);
    if (deepCheck.isHarmful) {
      return NextResponse.json(
        { error: deepCheck.reason || 'Post content violates ECHO community safety guidelines.' },
        { status: 400 }
      );
    }

    const newPost = new Post({
      authorId: userId,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      content,
      mediaUrl,
      mediaType: mediaType || 'none',
    });

    await newPost.save();

    // Invalidate Redis cache
    await delCache(POSTS_CACHE_KEY);

    const postResponse = {
      ...newPost.toObject(),
      mediaUrl: resolveMediaDisplayUrl(newPost.mediaUrl),
    };

    return NextResponse.json({ success: true, post: postResponse });
  } catch (error: any) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const currentUser = await User.findOne({ clerkId: userId });

    const { searchParams } = new URL(req.url);
    const postId = searchParams.get('id');

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Only allow deletion if the user is the author or an admin
    if (post.authorId !== userId && currentUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // If post had a Vercel Blob media attachment, clean it up from Blob storage
    if (post.mediaUrl) {
      await deleteFromBlob(post.mediaUrl);
    }

    await Post.findByIdAndDelete(postId);

    // Invalidate Redis cache
    await delCache(POSTS_CACHE_KEY);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
