import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function GET() {
  await connectDB();
  const allUsers = await User.find({ role: 'doctor' }).select('name clerkId applicationStatus');
  return NextResponse.json({ allUsers });
}
