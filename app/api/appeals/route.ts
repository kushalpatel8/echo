import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Appeal from '@/lib/models/Appeal';
import User from '@/lib/models/User';

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const currentUser = await User.findOne({ clerkId: userId });
  if (!currentUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (currentUser.role === 'admin') {
    const appeals = await Appeal.find().sort({ updatedAt: -1 });
    return NextResponse.json({ appeals });
  } else {
    const appeals = await Appeal.find({ userId }).sort({ updatedAt: -1 });
    return NextResponse.json({ appeals });
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { action, appealId, content } = body;

  await connectDB();
  const currentUser = await User.findOne({ clerkId: userId });
  if (!currentUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (currentUser.isBanned && (currentUser.role === 'volunteer' || currentUser.role === 'doctor')) {
    const banCount = currentUser.banCount || 0;
    if (banCount > 1) {
      return NextResponse.json({ error: 'Due to repeated violations of our community guidelines, you are no longer eligible to submit an appeal. The administration team will take final action on your account.' }, { status: 403 });
    }
  }

  if (action === 'create') {
    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Message content required' }, { status: 400 });
    }

    // Check if an existing pending appeal exists for this user
    let appeal = await Appeal.findOne({ userId, status: 'pending' });
    if (appeal) {
      appeal.messages.push({
        senderId: userId,
        senderName: currentUser.name,
        isAdmin: false,
        content: content.trim(),
        timestamp: new Date(),
      });
      await appeal.save();
      return NextResponse.json({ success: true, appeal });
    }

    appeal = await Appeal.create({
      userId,
      userName: currentUser.name,
      userRole: currentUser.role,
      userEmail: currentUser.email,
      messages: [{
        senderId: userId,
        senderName: currentUser.name,
        isAdmin: false,
        content: content.trim(),
        timestamp: new Date(),
      }],
      status: 'pending',
    });

    return NextResponse.json({ success: true, appeal });
  }

  if (action === 'send') {
    if (!appealId || !content || !content.trim()) {
      return NextResponse.json({ error: 'Appeal ID and content required' }, { status: 400 });
    }

    const appeal = await Appeal.findById(appealId);
    if (!appeal) return NextResponse.json({ error: 'Appeal not found' }, { status: 404 });

    const isAdmin = currentUser.role === 'admin';
    if (!isAdmin && appeal.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    appeal.messages.push({
      senderId: userId,
      senderName: currentUser.name,
      isAdmin,
      content: content.trim(),
      timestamp: new Date(),
    });

    await appeal.save();
    return NextResponse.json({ success: true, appeal });
  }

  if (action === 'resolve' || action === 'unban') {
    if (currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (!appealId) return NextResponse.json({ error: 'Appeal ID required' }, { status: 400 });

    const appeal = await Appeal.findById(appealId);
    if (!appeal) return NextResponse.json({ error: 'Appeal not found' }, { status: 404 });

    // Revoke ban on the user
    await User.findOneAndUpdate({ clerkId: appeal.userId }, { isBanned: false, warningCount: 0 });

    // Delete the appeal document and its chat history
    await Appeal.findByIdAndDelete(appealId);

    return NextResponse.json({ success: true });
  }

  if (action === 'reject') {
    if (currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (!appealId) return NextResponse.json({ error: 'Appeal ID required' }, { status: 400 });

    const appeal = await Appeal.findById(appealId);
    if (!appeal) return NextResponse.json({ error: 'Appeal not found' }, { status: 404 });

    appeal.status = 'rejected';
    if (content && content.trim()) {
      appeal.messages.push({
        senderId: userId,
        senderName: `${currentUser.name} (Admin)`,
        isAdmin: true,
        content: content.trim(),
        timestamp: new Date(),
      });
    } else {
      appeal.messages.push({
        senderId: userId,
        senderName: 'System Admin',
        isAdmin: true,
        content: '❌ Your appeal has been reviewed and rejected. Your account remains banned.',
        timestamp: new Date(),
      });
    }
    await appeal.save();

    return NextResponse.json({ success: true, appeal });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const currentUser = await User.findOne({ clerkId: userId });
  if (!currentUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (currentUser.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const appealId = searchParams.get('id');
  if (!appealId) return NextResponse.json({ error: 'Appeal ID required' }, { status: 400 });

  const appeal = await Appeal.findByIdAndDelete(appealId);
  if (!appeal) return NextResponse.json({ error: 'Appeal not found' }, { status: 404 });

  return NextResponse.json({ success: true, message: 'Appeal deleted' });
}
