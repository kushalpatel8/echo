import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
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

  return NextResponse.json({ applications });
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
    await User.findByIdAndDelete(targetUserId);
  }

  return NextResponse.json({ success: true });
}
