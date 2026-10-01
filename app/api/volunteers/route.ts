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
    clerkId: { $ne: userId }
  };

  // Fetch ALL approved helpers for this type
  const rawHelpers = await User.find(filter)
    .select('clerkId name imageUrl volunteerProfile doctorProfile role lastSeen createdAt')
    .sort({ lastSeen: -1, 'volunteerProfile.rating': -1 })
    .lean();

  const validHelpers: any[] = [];
  const now = Date.now();

  for (const helper of rawHelpers) {
    const isOnline = Boolean(
      helper.lastSeen &&
      now - new Date(helper.lastSeen).getTime() < 60000
    );

    validHelpers.push({
      ...helper,
      isOnline,
    });
  }

  // Sort helpers: saved volunteer at top, followed by online helpers, followed by offline helpers
  validHelpers.sort((a, b) => {
    const isASaved = currentUser?.savedVolunteer === a.clerkId;
    const isBSaved = currentUser?.savedVolunteer === b.clerkId;
    if (isASaved && !isBSaved) return -1;
    if (!isASaved && isBSaved) return 1;

    if (a.isOnline && !b.isOnline) return -1;
    if (!a.isOnline && b.isOnline) return 1;

    const ratingA = a.volunteerProfile?.rating || a.doctorProfile?.rating || 0;
    const ratingB = b.volunteerProfile?.rating || b.doctorProfile?.rating || 0;
    return ratingB - ratingA;
  });

  return NextResponse.json({ 
    helpers: validHelpers,
    savedVolunteer: currentUser?.savedVolunteer || null,
    onlineCount: validHelpers.filter(h => h.isOnline).length,
    totalCount: validHelpers.length,
  });
}
