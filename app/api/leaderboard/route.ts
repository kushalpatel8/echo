import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const topDoctors = await User.find({
      role: 'doctor',
      applicationStatus: 'approved',
      isBanned: false
    })
    .select('clerkId name imageUrl doctorProfile role')
    .sort({ 'doctorProfile.rating': -1, 'doctorProfile.totalRatings': -1 });

    const topVolunteers = await User.find({
      role: 'volunteer',
      applicationStatus: 'approved',
      isBanned: false
    })
    .select('clerkId name imageUrl volunteerProfile role')
    .sort({ 'volunteerProfile.rating': -1, 'volunteerProfile.totalRatings': -1 });

    return NextResponse.json({
      doctors: topDoctors,
      volunteers: topVolunteers
    });
  } catch (error: any) {
    console.error('Leaderboard API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
