import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import MoodLog from '@/lib/models/MoodLog';

function detectMood(answers: Record<string, number>): { mood: string; score: number } {
  const scores = Object.values(answers).filter(v => typeof v === 'number');
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;

  if (avg >= 8) return { mood: 'Radiant', score: avg };
  if (avg >= 6.5) return { mood: 'Calm', score: avg };
  if (avg >= 5) return { mood: 'Neutral', score: avg };
  if (avg >= 3.5) return { mood: 'Uneasy', score: avg };
  if (avg >= 2) return { mood: 'Distressed', score: avg };
  return { mood: 'Critical', score: avg };
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { answers } = await req.json();
  const { mood, score } = detectMood(answers);

  await connectDB();
  const log = await MoodLog.create({
    userId,
    answers,
    detectedMood: mood,
    moodScore: score,
  });

  return NextResponse.json({ mood, score, log });
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const logs = await MoodLog.find({ userId }).sort({ createdAt: -1 }).limit(10);
  return NextResponse.json({ logs });
}
