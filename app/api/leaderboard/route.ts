import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { getOrSetCache } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const data = await getOrSetCache('leaderboard:data', 30, async () => {
      await connectDB();

      const [topDoctors, topVolunteers] = await Promise.all([
        User.find({
          role: 'doctor',
          applicationStatus: 'approved',
          isBanned: false,
        })
          .select('clerkId name imageUrl doctorProfile role')
          .sort({ 'doctorProfile.rating': -1, 'doctorProfile.totalRatings': -1 })
          .lean(),
        User.find({
          role: 'volunteer',
          applicationStatus: 'approved',
          isBanned: false,
        })
          .select('clerkId name imageUrl volunteerProfile role')
          .sort({ 'volunteerProfile.rating': -1, 'volunteerProfile.totalRatings': -1 })
          .lean(),
      ]);

      return {
        doctors: topDoctors,
        volunteers: topVolunteers,
      };
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Leaderboard API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
