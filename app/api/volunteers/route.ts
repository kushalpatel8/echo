import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
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

  const client = await clerkClient();
  const validHelpers = [];

  for (const helper of helpers) {
    try {
      const clerkUser = await client.users.getUser(helper.clerkId);
      if (clerkUser) {
        validHelpers.push(helper);
      }
    } catch (error: any) {
      // If error is 404, it means user is deleted from clerk
      if (error.status === 404 || error.clerkError) {
        console.log(`User ${helper.clerkId} not found in Clerk, deleting from DB.`);
        await User.deleteOne({ clerkId: helper.clerkId });
      }
    }
  }

  return NextResponse.json({ helpers: validHelpers });
}
