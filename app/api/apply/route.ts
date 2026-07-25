import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { getUniqueUsername } from '@/lib/username';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { type, phoneNo, reason, degree, experience, whatsappNumber } = body;

  await connectDB();
  const clerkUser = await currentUser();
  let dbUser = await User.findOne({ clerkId: userId });

  if (!dbUser) {
    const uniqueName = await getUniqueUsername(clerkUser);
    dbUser = await User.create({
      clerkId: userId,
      email: clerkUser?.emailAddresses[0]?.emailAddress || '',
      name: uniqueName,
      imageUrl: clerkUser?.imageUrl || '',
      role: type,
    });
  } else {
    const realName = `${clerkUser?.firstName || ''} ${clerkUser?.lastName || ''}`.trim();
    if (dbUser.name === realName || (clerkUser?.firstName && dbUser.name === clerkUser.firstName)) {
      dbUser.name = await getUniqueUsername(clerkUser);
      await dbUser.save();
    }
  }

  if (type === 'volunteer') {
    await User.findOneAndUpdate({ clerkId: userId }, {
      role: 'volunteer',
      applicationStatus: 'pending',
      volunteerProfile: {
        phoneNo,
        whyVolunteer: reason,
        degree,
        experience,
        whatsappNumber: whatsappNumber || '',
        rating: 0,
        totalRatings: 0,
      },
    });
  } else if (type === 'doctor') {
    await User.findOneAndUpdate({ clerkId: userId }, {
      role: 'doctor',
      applicationStatus: 'pending',
      doctorProfile: {
        phoneNo,
        whyDoctor: reason,
        degree,
        experience,
        whatsappNumber: whatsappNumber || '',
      },
      // Doctors are also volunteers
      volunteerProfile: {
        phoneNo,
        whyVolunteer: reason,
        degree,
        experience,
        whatsappNumber: whatsappNumber || '',
        rating: 0,
        totalRatings: 0,
      },
    });
  }

  return NextResponse.json({ success: true });
}
