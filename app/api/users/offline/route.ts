import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { setOfflinePresence } from '@/lib/redis';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ success: true });
  }

  try {
    // Instant offline presence in Upstash Redis
    setOfflinePresence(userId).catch(() => {});

    connectDB().then(() => {
      User.updateOne({ clerkId: userId }, { $set: { lastSeen: new Date(0) } }).catch(() => {});
    }).catch(() => {});

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
    setOfflinePresence(userId).catch(() => {});

    connectDB().then(() => {
      User.updateOne({ clerkId: userId }, { $set: { lastSeen: new Date(0) } }).catch(() => {});
    }).catch(() => {});

    return NextResponse.json({ success: true, offline: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
