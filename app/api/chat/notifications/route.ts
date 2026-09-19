import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Chat from '@/lib/models/Chat';
import User from '@/lib/models/User';

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();

    // Find active chats for this user and get the most recent message for each
    const chats = await Chat.find({ 
      participants: userId,
      'messages.0': { $exists: true }
    })
    .select('_id participantNames participants messages updatedAt')
    .sort({ updatedAt: -1 })
    .limit(20);

    const latestMessages = chats.map(chat => {
      const msgs = chat.messages || [];
      const lastMsg = msgs[msgs.length - 1];
      if (!lastMsg) return null;

      const myIndex = chat.participants.indexOf(userId);
      const otherName = chat.participantNames?.[1 - myIndex] || lastMsg.senderName || 'Someone';

      return {
        chatId: chat._id.toString(),
        messageId: (lastMsg as any)._id?.toString() || `${lastMsg.senderId}-${new Date(lastMsg.timestamp).getTime()}`,
        senderId: lastMsg.senderId,
        senderName: lastMsg.senderName || otherName,
        content: lastMsg.content,
        timestamp: lastMsg.timestamp,
        isFromMe: lastMsg.senderId === userId,
      };
    }).filter(Boolean);

    return NextResponse.json({ messages: latestMessages });
  } catch (error: any) {
    console.error('Error fetching chat notifications:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
