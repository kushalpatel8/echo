import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Post from '@/lib/models/Post';
import User from '@/lib/models/User';

export async function GET() {
  try {
    await connectDB();
    const posts = await Post.find().sort({ createdAt: -1 });
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

    const body = await req.json();
    const { content, mediaUrl, mediaType } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
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

    return NextResponse.json({ success: true, post: newPost });
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

    await Post.findByIdAndDelete(postId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
