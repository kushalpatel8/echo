import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Suggestion from '@/lib/models/Suggestion';
import User from '@/lib/models/User';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, role } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const { userId } = await auth();

    await connectDB();

    let name;
    let email;

    if (userId) {
      const user = await User.findOne({ clerkId: userId });
      if (user) {
        name = user.name;
        email = user.email;
      }
    }

    const newSuggestion = new Suggestion({
      text,
      role: role || 'anonymous',
      userId: userId || undefined,
      name,
      email
    });

    await newSuggestion.save();

    return NextResponse.json({ success: true, suggestion: newSuggestion });
  } catch (error: any) {
    console.error('Error creating suggestion:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    
    // Check if admin
    const currentUser = await User.findOne({ clerkId: userId });
    if (currentUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch all suggestions sorted by newest first
    const suggestions = await Suggestion.find().sort({ createdAt: -1 });

    // Populate missing name/email retroactively
    const enrichedSuggestions = await Promise.all(suggestions.map(async (s) => {
      const sObj = s.toObject();
      if (sObj.userId && (!sObj.name || !sObj.email)) {
        const user = await User.findOne({ clerkId: sObj.userId });
        if (user) {
          sObj.name = user.name;
          sObj.email = user.email;
          
          // Save it back to DB so we don't have to look it up again next time
          s.name = user.name;
          s.email = user.email;
          await s.save();
        }
      }
      return sObj;
    }));

    return NextResponse.json({ suggestions: enrichedSuggestions });
  } catch (error: any) {
    console.error('Error fetching suggestions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    
    // Check if admin
    const currentUser = await User.findOne({ clerkId: userId });
    if (currentUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const suggestionId = searchParams.get('id');

    if (!suggestionId) {
      return NextResponse.json({ error: 'Suggestion ID required' }, { status: 400 });
    }

    await Suggestion.findByIdAndDelete(suggestionId);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting suggestion:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
