import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { getUniqueUsername } from '@/lib/username';
import { getOrSetCache, delCache, delCachePattern, setOnlinePresence } from '@/lib/redis';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { role, adminToken } = await req.json();

  if (role === 'admin') {
    if (adminToken !== process.env.ADMIN_TOKEN) {
      return NextResponse.json({ error: 'Invalid admin token' }, { status: 403 });
    }
  }

  const clerkUser = await currentUser();
  if (!clerkUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  await connectDB();

  const existingUser = await User.findOne({ clerkId: userId });
  if (existingUser) {
    if (existingUser.role === 'admin' || role === 'admin') {
      if (existingUser.name !== 'Admin' || (role && existingUser.role !== role)) {
        existingUser.name = 'Admin';
        if (role) existingUser.role = role;
        await existingUser.save();
      }
    } else if (existingUser.role === 'doctor' || role === 'doctor') {
      const realName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim();
      if ((existingUser.name !== realName && realName) || (role && existingUser.role !== role)) {
        existingUser.name = realName || 'Doctor';
        if (role) existingUser.role = role;
        await existingUser.save();
      } else if (!realName && existingUser.name !== 'Doctor') {
        existingUser.name = 'Doctor';
        if (role) existingUser.role = role;
        await existingUser.save();
      }
    } else {
      const realName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim();
      if (existingUser.name === realName || (clerkUser.firstName && existingUser.name === clerkUser.firstName) || (role && existingUser.role !== role)) {
        existingUser.name = await getUniqueUsername(clerkUser);
        if (role) existingUser.role = role;
        await existingUser.save();
      }
    }

    // Invalidate Redis user cache on updates
    delCache(`user:me:${userId}`).catch(() => {});
    delCachePattern('volunteers:raw:*').catch(() => {});

    return NextResponse.json({ user: existingUser });
  }

  let uniqueName;
  if (role === 'admin') {
    uniqueName = 'Admin';
  } else if (role === 'doctor') {
    uniqueName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Doctor';
  } else {
    uniqueName = await getUniqueUsername(clerkUser);
  }

  const newUser = await User.create({
    clerkId: userId,
    email: clerkUser.emailAddresses[0]?.emailAddress || '',
    name: uniqueName,
    imageUrl: clerkUser.imageUrl || '',
    role,
  });

  delCache(`user:me:${userId}`).catch(() => {});
  delCachePattern('volunteers:raw:*').catch(() => {});

  return NextResponse.json({ user: newUser });
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Update real-time presence in Redis
  setOnlinePresence(userId).catch(() => {});

  // Fast fetch cached user from Upstash Redis (TTL 20s)
  const cachedUser = await getOrSetCache(`user:me:${userId}`, 20, async () => {
    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    await connectDB();
    const dbUser = await User.findOne({ clerkId: userId });
    if (!dbUser) return null;

    if (dbUser.role === 'admin') {
      if (dbUser.name !== 'Admin') {
        dbUser.name = 'Admin';
        await dbUser.save();
      }
    } else if (dbUser.role === 'doctor') {
      const realName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim();
      if (dbUser.name !== realName && realName) {
        dbUser.name = realName;
        await dbUser.save();
      } else if (!realName && dbUser.name !== 'Doctor') {
        dbUser.name = 'Doctor';
        await dbUser.save();
      }
    } else {
      const realName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim();
      if (dbUser.name === realName || (clerkUser.firstName && dbUser.name === clerkUser.firstName)) {
        dbUser.name = await getUniqueUsername(clerkUser);
        await dbUser.save();
      }
    }

    dbUser.lastSeen = new Date();
    await dbUser.save();

    const userObj = dbUser.toObject ? dbUser.toObject() : dbUser;
    userObj.isOnline = true;
    return userObj;
  });

  if (!cachedUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ user: cachedUser });
}
