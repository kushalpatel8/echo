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
      const rawTasks = await Task.find({ assignerId: userId }).sort({ createdAt: -1 }).lean();
      const missingAssignees = rawTasks.filter((t: any) => !t.assigneeName).map((t: any) => t.assigneeId);
      if (missingAssignees.length > 0) {
        const users = await User.find({ clerkId: { $in: missingAssignees } }).select('clerkId name').lean();
        const map = new Map(users.map(u => [u.clerkId, u.name]));
        return rawTasks.map((t: any) => ({
          ...t,
          assigneeName: t.assigneeName || map.get(t.assigneeId) || 'User',
        }));
      }
      return rawTasks;
    }
  });

  return NextResponse.json({ tasks });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const user = await User.findOne({ clerkId: userId });
  if (!user || !['volunteer', 'doctor', 'admin'].includes(user.role)) {
    return NextResponse.json({ error: 'Only volunteers/doctors can assign tasks' }, { status: 403 });
  }

  const { title, description, assigneeId, assigneeName } = await req.json();
  if (!title || !description || !assigneeId) {
    return NextResponse.json({ error: 'Please select a user and provide title and description' }, { status: 400 });
  }

  let finalAssigneeName = assigneeName;
  if (!finalAssigneeName) {
    const assignee = await User.findOne({ clerkId: assigneeId }).select('name').lean();
    finalAssigneeName = assignee?.name || 'User';
  }

  const task = await Task.create({
    title,
    description,
    assignerId: userId,
    assignerName: user.name,
    assigneeId,
    assigneeName: finalAssigneeName,
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

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get('taskId');
  if (!taskId) return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });

  await connectDB();
  const task = await Task.findById(taskId);
  if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

  if (task.assignerId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await Task.findByIdAndDelete(taskId);
  delCache(`tasks:user:${task.assigneeId}`, `tasks:user:${userId}`).catch(() => {});

  return NextResponse.json({ success: true });
}
