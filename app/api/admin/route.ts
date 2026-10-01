import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Appeal from '@/lib/models/Appeal';
import { delCache, delCachePattern } from '@/lib/redis';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const currentUser = await User.findOne({ clerkId: userId });
  if (currentUser?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const applications = await User.find({
    role: { $in: ['volunteer', 'doctor'] },
    applicationStatus: 'pending',
  }).select('-__v');

  const client = await clerkClient();
  const validApplications = [];

  for (const app of applications) {
    try {
      const clerkUser = await client.users.getUser(app.clerkId);
      if (clerkUser) {
        validApplications.push(app);
      }
    } catch (error: any) {
      if (error.status === 404 || error.clerkError) {
        console.log(`User ${app.clerkId} not found in Clerk, deleting from DB.`);
        await User.deleteOne({ clerkId: app.clerkId });
      }
    }
  }

  return NextResponse.json({ applications: validApplications });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const currentUser = await User.findOne({ clerkId: userId });
  if (currentUser?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { targetUserId, action } = await req.json(); // action: 'approve' | 'reject' | 'ban' | 'unban' | 'delete'

  let targetUserClerkId = '';
  if (action === 'approve') {
    const updated = await User.findByIdAndUpdate(targetUserId, { applicationStatus: 'approved' });
    targetUserClerkId = updated?.clerkId || '';
  } else if (action === 'reject') {
    const updated = await User.findByIdAndUpdate(targetUserId, { applicationStatus: 'rejected' });
    targetUserClerkId = updated?.clerkId || '';
  } else if (action === 'ban') {
    const updated = await User.findByIdAndUpdate(targetUserId, { isBanned: true, $inc: { banCount: 1 } });
    targetUserClerkId = updated?.clerkId || '';
  } else if (action === 'unban') {
    const unbannedUser = await User.findByIdAndUpdate(targetUserId, { isBanned: false, warningCount: 0 });
    if (unbannedUser) {
      targetUserClerkId = unbannedUser.clerkId;
      await Appeal.deleteMany({ userId: unbannedUser.clerkId });
    }
  } else if (action === 'delete') {
    const userToDelete = await User.findById(targetUserId);
    if (userToDelete) {
      targetUserClerkId = userToDelete.clerkId;
      await User.findByIdAndDelete(targetUserId);
      try {
        const client = await clerkClient();
        await client.users.deleteUser(userToDelete.clerkId);
      } catch(e) { 
        console.error("Failed to delete from Clerk", e); 
      }
    }
  }

  // Invalidate Redis caches across affected keys
  if (targetUserClerkId) {
    delCache(`user:me:${targetUserClerkId}`).catch(() => {});
  }
  delCachePattern('volunteers:raw:*').catch(() => {});
  delCache('leaderboard:data').catch(() => {});

  return NextResponse.json({ success: true });
}
