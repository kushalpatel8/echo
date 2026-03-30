import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { volunteerId, rating } = await req.json();
  if (rating < 1 || rating > 5) return NextResponse.json({ error: 'Rating must be 1-5' }, { status: 400 });

  await connectDB();
  const volunteer = await User.findOne({ clerkId: volunteerId });
  if (!volunteer) return NextResponse.json({ error: 'Volunteer not found' }, { status: 404 });

  const currentTotal = (volunteer.volunteerProfile?.rating || 0) * (volunteer.volunteerProfile?.totalRatings || 0);
  const newTotal = (volunteer.volunteerProfile?.totalRatings || 0) + 1;
  const newRating = (currentTotal + rating) / newTotal;

  await User.findOneAndUpdate(
    { clerkId: volunteerId },
    {
      'volunteerProfile.rating': Math.round(newRating * 10) / 10,
      'volunteerProfile.totalRatings': newTotal,
    }
  );

  return NextResponse.json({ success: true, newRating: Math.round(newRating * 10) / 10 });
}
