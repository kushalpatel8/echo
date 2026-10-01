import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Task from '@/lib/models/Task';
import User from '@/lib/models/User';
import { getOrSetCache, delCache } from '@/lib/redis';

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tasks = await getOrSetCache(`tasks:user:${userId}`, 15, async () => {
    await connectDB();
    const user = await User.findOne({ clerkId: userId }).select('role').lean();

    if (user?.role === 'user') {
      return Task.find({ assigneeId: userId }).sort({ createdAt: -1 }).lean();
    } else {
      return Task.find({ assignerId: userId }).sort({ createdAt: -1 }).lean();
    }
  });

  return NextResponse.json({ tasks });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const user = await User.findOne({ clerkId: userId });
  if (!user || !['volunteer', 'doctor'].includes(user.role)) {
    return NextResponse.json({ error: 'Only volunteers/doctors can assign tasks' }, { status: 403 });
  }

  const { title, description, assigneeId } = await req.json();
  const task = await Task.create({
    title,
    description,
    assignerId: userId,
    assignerName: user.name,
    assigneeId,
    status: 'pending',
  });

  delCache(`tasks:user:${assigneeId}`, `tasks:user:${userId}`).catch(() => {});

  return NextResponse.json({ task });
}

export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { taskId, status } = await req.json();
  await connectDB();

  const task = await Task.findById(taskId);
  if (!task || task.assigneeId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  task.status = status;
  await task.save();

  delCache(`tasks:user:${task.assigneeId}`, `tasks:user:${task.assignerId}`).catch(() => {});

  return NextResponse.json({ task });
}
