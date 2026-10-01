import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { getOrSetCache, getOnlineUserIds } from '@/lib/redis';

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'volunteer'; // volunteer | doctor

  await connectDB();

  // Fast fetch currentUser savedVolunteer & cached helpers in parallel
  const [currentUser, rawHelpers, onlineIds] = await Promise.all([
    User.findOne({ clerkId: userId }).select('savedVolunteer').lean(),
    getOrSetCache(`volunteers:raw:${type}`, 10, async () => {
      return User.find({
        role: type === 'doctor' ? 'doctor' : 'volunteer',
        applicationStatus: 'approved',
        isBanned: false,
      })
        .select('clerkId name imageUrl volunteerProfile doctorProfile role lastSeen createdAt')
        .sort({ lastSeen: -1, 'volunteerProfile.rating': -1 })
        .lean();
    }),
    getOnlineUserIds(),
  ]);

  const now = Date.now();
  const validHelpers: any[] = [];

  for (const helper of (rawHelpers || [])) {
    if (helper.clerkId === userId) continue;

    // Check online status via Redis real-time presence set or fallback to lastSeen < 60s
    const isOnline = onlineIds.has(helper.clerkId) || Boolean(
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
