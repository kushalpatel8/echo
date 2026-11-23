import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Chat from '@/lib/models/Chat';
import ConnectionRequest from '@/lib/models/ConnectionRequest';
import type { AssigneeCandidate } from '@/types';

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const currentUser = await User.findOne({ clerkId: userId }).select('role name').lean();
  if (!currentUser || !['volunteer', 'doctor', 'admin'].includes(currentUser.role)) {
    return NextResponse.json({ error: 'Only volunteers or doctors can fetch users for task assignment' }, { status: 403 });
  }

  // 1. Find users from chats involving this helper
  const chats = await Chat.find({ participants: userId }).select('participants userId userName').lean();
  const chatPartnerIds = new Set<string>();
  for (const c of chats) {
    if (c.userId && c.userId !== userId) {
      chatPartnerIds.add(c.userId);
    }
    for (const p of c.participants || []) {
      if (p !== userId) chatPartnerIds.add(p);
    }
  }

  // 2. If doctor, find connection requests
  const connectionUserIds = new Set<string>();
  if (currentUser.role === 'doctor' || currentUser.role === 'admin') {
    const requests = await ConnectionRequest.find({ doctorId: userId }).select('userId status').lean();
    for (const r of requests) {
      if (r.userId) connectionUserIds.add(r.userId);
    }
  }

  const directUserIds = Array.from(new Set([...chatPartnerIds, ...connectionUserIds]));

  // 3. Query all candidate users with role === 'user' (plus any in directUserIds)
  const users = await User.find({
    $or: [
      { role: 'user', isBanned: { $ne: true } },
      { clerkId: { $in: directUserIds }, isBanned: { $ne: true } }
    ]
  }).select('clerkId name imageUrl role lastSeen isOnline').lean();

  const formattedUsers: AssigneeCandidate[] = users
    .filter((u: any) => u.clerkId !== userId)
    .map((u: any) => {
      const isDirect = directUserIds.includes(u.clerkId);
      const hasChat = chatPartnerIds.has(u.clerkId);
      const hasConnection = connectionUserIds.has(u.clerkId);
      const isOnline = Boolean(u.lastSeen && (Date.now() - new Date(u.lastSeen).getTime() < 60000));

      let relationship = 'Community User';
      if (hasConnection && hasChat) relationship = 'Connected Patient (Active Chat)';
      else if (hasConnection) relationship = 'Connected Patient';
      else if (hasChat) relationship = 'Chat Partner';

      return {
        clerkId: u.clerkId,
        name: u.name,
        imageUrl: u.imageUrl,
        isOnline,
        isDirect,
        relationship,
      };
    });

  // Sort: connected / chat partners first, then alphabetically by name
  formattedUsers.sort((a, b) => {
    if (a.isDirect && !b.isDirect) return -1;
    if (!a.isDirect && b.isDirect) return 1;
    return (a.name || '').localeCompare(b.name || '');
  });

  return NextResponse.json({ users: formattedUsers });
}
