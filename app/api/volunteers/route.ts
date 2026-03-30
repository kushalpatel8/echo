import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'volunteer'; // volunteer | doctor

  await connectDB();
  const currentUser = await User.findOne({ clerkId: userId });
  
  const filter: Record<string, unknown> = {
    role: type,
    applicationStatus: 'approved',
    isBanned: false,
  };

  const helpers = await User.find(filter)
    .select('clerkId name imageUrl volunteerProfile doctorProfile role')
    .sort({ 'volunteerProfile.rating': -1 });

  return NextResponse.json({ helpers, subscription: currentUser?.subscription });
}
