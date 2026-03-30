import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

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
    return NextResponse.json({ user: existingUser });
  }

  const newUser = await User.create({
    clerkId: userId,
    email: clerkUser.emailAddresses[0]?.emailAddress || '',
    name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
    imageUrl: clerkUser.imageUrl || '',
    role,
    subscription: 'community',
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

  return NextResponse.json({ user: dbUser });
}
