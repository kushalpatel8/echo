import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { targetId, action } = await req.json();

  if (!targetId || (action !== 'save' && action !== 'remove')) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  await connectDB();
  
  const updateData = action === 'save' 
    ? { savedVolunteer: targetId } 
    : { $unset: { savedVolunteer: "" } };

  await User.findOneAndUpdate({ clerkId: userId }, updateData);

  return NextResponse.json({ success: true });
}
