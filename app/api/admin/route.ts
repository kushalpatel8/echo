import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

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

  if (action === 'approve') {
    await User.findByIdAndUpdate(targetUserId, { applicationStatus: 'approved' });
  } else if (action === 'reject') {
    await User.findByIdAndUpdate(targetUserId, { applicationStatus: 'rejected' });
  } else if (action === 'ban') {
    await User.findByIdAndUpdate(targetUserId, { isBanned: true });
  } else if (action === 'unban') {
    await User.findByIdAndUpdate(targetUserId, { isBanned: false });
  } else if (action === 'delete') {
    const userToDelete = await User.findById(targetUserId);
    if (userToDelete) {
      await User.findByIdAndDelete(targetUserId);
      try {
        const client = await clerkClient();
        await client.users.deleteUser(userToDelete.clerkId);
      } catch(e) { 
        console.error("Failed to delete from Clerk", e); 
      }
    }
  }

  return NextResponse.json({ success: true });
}
