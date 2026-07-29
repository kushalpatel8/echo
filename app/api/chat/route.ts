import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Chat from '@/lib/models/Chat';
import User from '@/lib/models/User';
import { isContentHarmful as isMessageHarmful } from '@/lib/moderation';

async function enrichChat(chatDoc: any) {
  const chatObj = chatDoc.toObject ? chatDoc.toObject() : { ...chatDoc._doc || chatDoc };
  if (!chatObj.helperId || (!chatObj.doctorId && chatObj.helperRole === 'doctor')) {
    const users = await User.find({ clerkId: { $in: chatObj.participants } });
    const helper = users.find(u => u.role === 'doctor' || u.role === 'volunteer');
    const patient = users.find(u => u.role !== 'doctor' && u.role !== 'volunteer') || users[0];

    if (helper) {
      chatObj.helperId = helper.clerkId;
      chatObj.helperName = helper.name;
      chatObj.helperRole = helper.role;
      if (helper.role === 'doctor') chatObj.doctorId = helper.clerkId;
      if (helper.role === 'volunteer') chatObj.volunteerId = helper.clerkId;
    }
    if (patient) {
      chatObj.userId = patient.clerkId;
      chatObj.userName = patient.name;
    }

    if (chatDoc.save && helper) {
      chatDoc.helperId = chatObj.helperId;
      chatDoc.helperName = chatObj.helperName;
      chatDoc.helperRole = chatObj.helperRole;
      chatDoc.doctorId = chatObj.doctorId;
      chatDoc.volunteerId = chatObj.volunteerId;
      chatDoc.userId = chatObj.userId;
      chatDoc.userName = chatObj.userName;
      await chatDoc.save().catch(() => {});
    }
  }
  return chatObj;
}

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
    const enriched = await enrichChat(chat);
    return NextResponse.json({ chat: enriched });
  }

  const chats = await Chat.find({ participants: userId }).sort({ updatedAt: -1 });
  const enrichedChats = await Promise.all(chats.map(c => enrichChat(c)));
  return NextResponse.json({ chats: enrichedChats });
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
    if (sender.isBanned) {
      return NextResponse.json({ error: '🚫 You are currently banned from initiating chat sessions.', isBanned: true }, { status: 403 });
    }
    const target = await User.findOne({ clerkId: targetUserId });
    if (!target) return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    if (target.isBanned) {
      return NextResponse.json({ error: '🚫 This doctor is currently banned and unavailable for chat sessions.', isBanned: true }, { status: 403 });
    }

    const existingChat = await Chat.findOne({
      participants: { $all: [userId, targetUserId] }
    });
    if (existingChat) {
      const enriched = await enrichChat(existingChat);
      return NextResponse.json({ chat: enriched });
    }

    const chat = await Chat.create({
      participants: [userId, targetUserId],
      participantNames: [sender.name, target.name],
      userId: userId,
      userName: sender.name,
      helperId: targetUserId,
      helperName: target.name,
      helperRole: target.role,
      doctorId: target.role === 'doctor' ? targetUserId : undefined,
      volunteerId: target.role === 'volunteer' ? targetUserId : undefined,
      messages: [],
    });
    const enriched = await enrichChat(chat);
    return NextResponse.json({ chat: enriched });
  }

  if (action === 'send') {
    const chat = await Chat.findById(chatId);
    if (!chat?.participants.includes(userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (sender.role !== 'admin') {
      if (sender.isBanned) {
        return NextResponse.json({
          error: '🚫 You are currently banned from sending messages due to previous policy violations. Please contact Admin from your dashboard to appeal.',
          isBanned: true
        }, { status: 403 });
      }

      if ((sender.role === 'volunteer' || sender.role === 'doctor') && isMessageHarmful(content)) {
        const currentWarnings = sender.warningCount || 0;
        const newWarnings = currentWarnings + 1;
        const shouldBan = newWarnings >= 3;

        const updateFields: any = { $set: { warningCount: newWarnings, isBanned: shouldBan } };
        if (shouldBan) {
          updateFields.$inc = { banCount: 1 };
        }

        await User.findOneAndUpdate(
          { clerkId: userId },
          updateFields,
          { strict: false }
        );

        if (shouldBan) {
          return NextResponse.json({
            error: '🚫 ACCOUNT BANNED (3rd Offense): You have been banned for repeated abusive or emotionally harmful messaging. You can no longer chat with users. You may contact Admin from your dashboard to appeal this ban.',
            warningCount: 3,
            isBanned: true
          }, { status: 403 });
        } else if (newWarnings === 2) {
          return NextResponse.json({
            error: '🚨 STRONG WARNING (2nd Offense): Your message contained abusive or emotionally harmful language! One more violation will result in an automatic account ban.',
            warningCount: 2,
            isBanned: false
          }, { status: 400 });
        } else {
          return NextResponse.json({
            error: '⚠️ FIRST WARNING: Your message was blocked for containing abusive or emotionally harmful language. Please communicate with empathy and respect.',
            warningCount: 1,
            isBanned: false
          }, { status: 400 });
        }
      }
    }

    chat.messages.push({
      senderId: userId,
      senderName: sender.name,
      content,
      timestamp: new Date(),
    });
    await chat.save();
    const enriched = await enrichChat(chat);
    return NextResponse.json({ success: true, chat: enriched });
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
