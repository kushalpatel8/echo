import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, imageUrl } = await req.json();

  await connectDB();
  const user = await User.findOneAndUpdate(
    { clerkId: userId },
    { name, imageUrl },
    { new: true }
  );

  return NextResponse.json({ user });
}

export async function DELETE() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  await User.findOneAndDelete({ clerkId: userId });
  return NextResponse.json({ success: true });
}
