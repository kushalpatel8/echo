import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
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

  const filter: Record<string, unknown> = {};
  if (role) filter.role = role;

  const users = await User.find(filter).select('-__v').sort({ createdAt: -1 });
  return NextResponse.json({ users });
}
