import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { getUniqueUsername } from '@/lib/username';

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
    } else {
      const realName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim();
      if (existingUser.name === realName || (clerkUser.firstName && existingUser.name === clerkUser.firstName)) {
        existingUser.name = await getUniqueUsername(clerkUser);
        await existingUser.save();
      }
    }
    return NextResponse.json({ user: existingUser });
  }

  const uniqueName = role === 'admin' ? 'Admin' : await getUniqueUsername(clerkUser);

  const newUser = await User.create({
    clerkId: userId,
    email: clerkUser.emailAddresses[0]?.emailAddress || '',
    name: uniqueName,
    imageUrl: clerkUser.imageUrl || '',
    role,
  });

  return NextResponse.json({ user: newUser });
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const clerkUser = await currentUser();
  if (!clerkUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  await connectDB();
  const dbUser = await User.findOne({ clerkId: userId });

  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (dbUser.role === 'admin') {
    if (dbUser.name !== 'Admin') {
      dbUser.name = 'Admin';
      await dbUser.save();
    }
  } else {
    const realName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim();
    if (dbUser.name === realName || (clerkUser.firstName && dbUser.name === clerkUser.firstName)) {
      dbUser.name = await getUniqueUsername(clerkUser);
      await dbUser.save();
    }
  }

  return NextResponse.json({ user: dbUser });
}
