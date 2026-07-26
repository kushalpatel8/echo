import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

// Get all users/volunteers/doctors for admin
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const currentUser = await User.findOne({ clerkId: userId });
  if (currentUser?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const role = searchParams.get('role');
  const isBanned = searchParams.get('isBanned');

  const filter: Record<string, unknown> = {};
  if (role) filter.role = role;
  if (isBanned === 'true') filter.isBanned = true;

  const users = await User.find(filter).select('-__v').sort({ createdAt: -1 });
  
  const client = await clerkClient();
  const validUsers = [];

  for (const u of users) {
    try {
      const clerkUser = await client.users.getUser(u.clerkId);
      if (clerkUser) {
        validUsers.push(u);
      }
    } catch (error: any) {
      if (error.status === 404 || error.clerkError) {
        console.log(`User ${u.clerkId} not found in Clerk, deleting from DB.`);
        await User.deleteOne({ clerkId: u.clerkId });
      }
    }
  }

  return NextResponse.json({ users: validUsers });
}
