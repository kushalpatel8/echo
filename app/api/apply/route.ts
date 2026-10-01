import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { getUniqueUsername } from '@/lib/username';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { type, phoneNo, reason, degree, experience, whatsappNumber, licenseNumber, college } = body;

  if (type === 'doctor') {
    if (!licenseNumber || !licenseNumber.toString().trim()) {
      return NextResponse.json({ error: 'Medical License / Registration Number is mandatory.' }, { status: 400 });
    }
    if (!college || !college.toString().trim()) {
      return NextResponse.json({ error: 'Medical College / University is mandatory.' }, { status: 400 });
    }
  }

  await connectDB();
  const clerkUser = await currentUser();
  let dbUser = await User.findOne({ clerkId: userId });

  const realName = `${clerkUser?.firstName || ''} ${clerkUser?.lastName || ''}`.trim();

  if (!dbUser) {
    const uniqueName = type === 'doctor' ? (realName || 'Doctor') : await getUniqueUsername(clerkUser);
    dbUser = await User.create({
      clerkId: userId,
      email: clerkUser?.emailAddresses[0]?.emailAddress || '',
      name: uniqueName,
      imageUrl: clerkUser?.imageUrl || '',
      role: type,
    });
  } else {
    if (type === 'doctor') {
      if (dbUser.name !== realName && realName) {
        dbUser.name = realName;
        await dbUser.save();
      } else if (!realName && dbUser.name !== 'Doctor') {
        dbUser.name = 'Doctor';
        await dbUser.save();
      }
    } else {
      if (dbUser.name === realName || (clerkUser?.firstName && dbUser.name === clerkUser.firstName)) {
        dbUser.name = await getUniqueUsername(clerkUser);
        await dbUser.save();
      }
    }
  }

  const rawPhone = (phoneNo || '').toString().trim();
  const rawWhatsapp = (whatsappNumber || '').toString().trim();
  const cleanPhoneNo = rawPhone.replace(/\D/g, '') ? rawPhone : undefined;
  const cleanWhatsappNumber = rawWhatsapp.replace(/\D/g, '') ? rawWhatsapp : undefined;

  if (type === 'volunteer') {
    await User.findOneAndUpdate({ clerkId: userId }, {
      role: 'volunteer',
      applicationStatus: 'pending',
      volunteerProfile: {
        phoneNo: cleanPhoneNo,
        whyVolunteer: reason,
        degree,
        experience,
        whatsappNumber: cleanWhatsappNumber,
        rating: 0,
        totalRatings: 0,
      },
    });
  } else if (type === 'doctor') {
    await User.findOneAndUpdate({ clerkId: userId }, {
      role: 'doctor',
      applicationStatus: 'pending',
      doctorProfile: {
        phoneNo: cleanPhoneNo,
        whyDoctor: reason,
        degree,
        licenseNumber: licenseNumber.toString().trim(),
        college: college.toString().trim(),
        experience,
        whatsappNumber: cleanWhatsappNumber,
      },
      // Doctors are also volunteers
      volunteerProfile: {
        phoneNo: cleanPhoneNo,
        whyVolunteer: reason,
        degree,
        experience,
        whatsappNumber: cleanWhatsappNumber,
        rating: 0,
        totalRatings: 0,
      },
    });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const user = await User.findOneAndUpdate(
    { clerkId: userId },
    {
      role: 'user',
      $unset: { applicationStatus: 1, doctorProfile: 1, volunteerProfile: 1 }
    },
    { new: true }
  );

  return NextResponse.json({ success: true, user });
}

