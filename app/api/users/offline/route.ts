import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ success: true });
  }

  try {
    await connectDB();
    // Set lastSeen to epoch 0 so the user immediately registers as offline
    await User.updateOne({ clerkId: userId }, { $set: { lastSeen: new Date(0) } });
    return NextResponse.json({ success: true, offline: true });
  } catch (error: any) {
    console.error('Error marking user offline:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ success: true });
  }

  try {
    await connectDB();
    await User.updateOne({ clerkId: userId }, { $set: { lastSeen: new Date(0) } });
    return NextResponse.json({ success: true, offline: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
