import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import ConnectionRequest from '@/lib/models/ConnectionRequest';
import User from '@/lib/models/User';

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'sent'; // 'received' for doctors

  let requests;
  if (type === 'received') {
    requests = await ConnectionRequest.find({ doctorId: userId }).sort({ createdAt: -1 });
  } else {
    requests = await ConnectionRequest.find({ userId }).sort({ createdAt: -1 });
  }

  return NextResponse.json({ requests });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { doctorId } = await req.json();
    if (!doctorId) return NextResponse.json({ error: 'Doctor ID is required' }, { status: 400 });

    await connectDB();
    
    // Get sender info
    const sender = await User.findOne({ clerkId: userId });
    if (!sender) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Check if request already exists
    const existing = await ConnectionRequest.findOne({ userId, doctorId });
    if (existing) return NextResponse.json({ error: 'Request already exists', status: existing.status }, { status: 409 });

    const newRequest = await ConnectionRequest.create({
      userId,
      doctorId,
      status: 'pending',
      userName: sender.name,
      userImage: sender.imageUrl,
    });

    return NextResponse.json({ request: newRequest });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { requestId, status, whatsappStatus } = await req.json();
    if (!requestId) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    await connectDB();
    
    // Find request where user is either sender or receiver
    const request = await ConnectionRequest.findOne({ 
      _id: requestId, 
      $or: [{ doctorId: userId }, { userId: userId }]
    });
    if (!request) return NextResponse.json({ error: 'Request not found' }, { status: 404 });

    // Update main status (only doctor can do this)
    if (status && ['accepted', 'rejected'].includes(status)) {
      if (request.doctorId !== userId) return NextResponse.json({ error: 'Unauthorized to change connection status' }, { status: 403 });
      request.status = status;
    }

    // Update whatsapp status
    if (whatsappStatus && ['pending', 'accepted', 'rejected'].includes(whatsappStatus)) {
      if (whatsappStatus === 'pending') {
        // Only patient can request whatsapp
        if (request.userId !== userId) {
          console.error(`WhatsApp Request Error: User ${userId} is not the sender ${request.userId}`);
          return NextResponse.json({ error: 'Only patient can request WhatsApp' }, { status: 403 });
        }
        if (request.status !== 'accepted') {
          console.error(`WhatsApp Request Error: Connection status is ${request.status}, not accepted`);
          return NextResponse.json({ error: 'Connection must be accepted first' }, { status: 400 });
        }
      } else {
        // Only doctor can accept/reject whatsapp
        if (request.doctorId !== userId) {
          console.error(`WhatsApp Approve Error: User ${userId} is not the doctor ${request.doctorId}`);
          return NextResponse.json({ error: 'Only doctor can approve WhatsApp' }, { status: 403 });
        }
      }
      request.whatsappStatus = whatsappStatus;
    }

    await request.save();

    return NextResponse.json({ request });
  } catch (err: any) {
    console.error('API Error in PATCH /api/connections:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { requestId } = await req.json();
    if (!requestId) return NextResponse.json({ error: 'Missing requestId' }, { status: 400 });

    await connectDB();
    
    // Only the user who sent it or the doctor who received it can delete it
    const request = await ConnectionRequest.findOneAndDelete({ 
      _id: requestId, 
      $or: [{ userId: userId }, { doctorId: userId }] 
    });
    
    if (!request) return NextResponse.json({ error: 'Request not found' }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
