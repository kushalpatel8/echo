import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { setOnlinePresence } from '@/lib/redis';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Instant real-time presence in Upstash Redis
    setOnlinePresence(userId).catch(() => {});

    // Asynchronous MongoDB heartbeat update without blocking
    connectDB().then(() => {
      User.updateOne({ clerkId: userId }, { $set: { lastSeen: new Date() } }).catch(() => {});
    }).catch(() => {});

    return NextResponse.json({ success: true, timestamp: new Date() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    setOnlinePresence(userId).catch(() => {});

    connectDB().then(() => {
      User.updateOne({ clerkId: userId }, { $set: { lastSeen: new Date() } }).catch(() => {});
    }).catch(() => {});

    return NextResponse.json({ success: true, timestamp: new Date() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
