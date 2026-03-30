import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Chat from '@/lib/models/Chat';
import User from '@/lib/models/User';

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const chatId = searchParams.get('chatId');

  await connectDB();

  if (chatId) {
    const chat = await Chat.findById(chatId);
    if (!chat?.participants.includes(userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ chat });
  }

  const chats = await Chat.find({ participants: userId }).sort({ updatedAt: -1 });
  return NextResponse.json({ chats });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { action, chatId, content, targetUserId } = body;

  await connectDB();

  const sender = await User.findOne({ clerkId: userId });
  if (!sender) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (action === 'create') {
    const target = await User.findOne({ clerkId: targetUserId });
    if (!target) return NextResponse.json({ error: 'Target user not found' }, { status: 404 });

    const existingChat = await Chat.findOne({
      participants: { $all: [userId, targetUserId] }
    });
    if (existingChat) return NextResponse.json({ chat: existingChat });

    const chat = await Chat.create({
      participants: [userId, targetUserId],
      participantNames: [sender.name, target.name],
      messages: [],
    });
    return NextResponse.json({ chat });
  }

  if (action === 'send') {
    const chat = await Chat.findById(chatId);
    if (!chat?.participants.includes(userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    chat.messages.push({
      senderId: userId,
      senderName: sender.name,
      content,
      timestamp: new Date(),
    });
    await chat.save();
    return NextResponse.json({ success: true, chat });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const chatId = searchParams.get('chatId');

  if (!chatId) return NextResponse.json({ error: 'Chat ID required' }, { status: 400 });

  await connectDB();

  const chat = await Chat.findById(chatId);
  if (!chat) return NextResponse.json({ error: 'Chat not found' }, { status: 404 });

  if (!chat.participants.includes(userId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await Chat.findByIdAndDelete(chatId);
  return NextResponse.json({ success: true });
}
