import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Prescription from '@/lib/models/Prescription';
import Chat from '@/lib/models/Chat';
import User from '@/lib/models/User';
import { uploadToBlob, resolveMediaDisplayUrl } from '@/lib/blob';
import { delCachePattern } from '@/lib/redis';

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const currentUser = await User.findOne({ clerkId: userId }).select('role').lean();
  if (!currentUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  let filter: Record<string, unknown> = {};
  if (currentUser.role === 'doctor') {
    filter = { doctorId: userId };
  } else if (currentUser.role === 'user') {
    filter = { patientId: userId };
  } else if (currentUser.role === 'admin') {
    filter = {};
  } else {
    filter = { $or: [{ doctorId: userId }, { patientId: userId }] };
  }

  const prescriptions = await Prescription.find(filter)
    .select('-pdfData')
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ prescriptions });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const doctor = await User.findOne({ clerkId: userId });
  if (!doctor || (doctor.role !== 'doctor' && doctor.role !== 'admin')) {
    return NextResponse.json({ error: 'Only doctors can issue prescriptions' }, { status: 403 });
  }

  const body = await req.json();
  const {
    patientId,
    patientName,
    medicines,
    notes,
    digitalSignature,
    pdfBase64,
  } = body;

  if (!patientId || !patientName) {
    return NextResponse.json({ error: 'Patient information is required' }, { status: 400 });
  }

  if (!Array.isArray(medicines) || medicines.length === 0) {
    return NextResponse.json({ error: 'At least one medicine is required' }, { status: 400 });
  }

  if (!digitalSignature) {
    return NextResponse.json({ error: 'Doctor digital signature is required' }, { status: 400 });
  }

  const doctorProfile = (doctor.doctorProfile || {}) as Record<string, unknown>;
  const doctorDegree = (doctorProfile.degree as string) || 'M.D. Healthcare Professional';
  const doctorLicense = (doctorProfile.licenseNumber as string) || 'Verified Telehealth Practitioner';

  // Extract clean base64 string
  let cleanBase64 = '';
  if (pdfBase64) {
    const raw = String(pdfBase64).trim();
    cleanBase64 = raw.includes('base64,') ? raw.split('base64,')[1].trim() : raw;
  }

  // Create prescription doc with clean Base64 stored directly
  const prescription = await Prescription.create({
    doctorId: userId,
    doctorName: doctor.name,
    doctorDegree,
    doctorLicense,
    patientId,
    patientName,
    medicines,
    notes: notes || '',
    digitalSignature,
    pdfData: cleanBase64 || '',
    signedAt: new Date(),
  });

  // Always use our dedicated view endpoint as the primary URL
  const finalPdfUrl = `/api/prescriptions/view?id=${prescription._id}`;
  prescription.pdfUrl = finalPdfUrl;

  // Attempt backup upload to Vercel Blob in background
  if (cleanBase64) {
    try {
      const pdfBuffer = Buffer.from(cleanBase64, 'base64');
      if (pdfBuffer.subarray(0, 5).toString() === '%PDF-') {
        uploadToBlob(
          `Echo-Prescription-${patientName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
          pdfBuffer,
          { contentType: 'application/pdf', folder: 'prescriptions' }
        ).catch(e => console.warn('[Blob backup warning]:', e));
      }
    } catch {
      // Ignored
    }
  }

  // Find or create chat with this patient
  let chat = await Chat.findOne({
    participants: { $all: [userId, patientId] },
  });

  if (!chat) {
    chat = await Chat.create({
      participants: [userId, patientId],
      participantNames: [doctor.name, patientName],
      userId: patientId,
      userName: patientName,
      helperId: userId,
      helperName: doctor.name,
      helperRole: 'doctor',
      doctorId: userId,
      messages: [],
    });
  }

  const medicineSummary = medicines
    .map((m: any, i: number) => `${i + 1}. ${m.name} - ${m.dosage} (${m.frequency}) for ${m.duration}${m.instructions ? ` • Instructions: ${m.instructions}` : ''}`)
    .join('\n');

  const prescriptionMessageContent = `🩺 Official Medical Prescription\nPrescribed by Dr. ${doctor.name}\nDigitally signed on Echo Letterhead.\n\nPrescribed Medications:\n${medicineSummary}${notes ? `\n\nClinical Guidance:\n${notes}` : ''}`;

  chat.messages.push({
    senderId: userId,
    senderName: doctor.name,
    content: prescriptionMessageContent,
    attachmentUrl: finalPdfUrl,
    attachmentType: 'pdf',
    attachmentName: `Echo-Prescription-${patientName.replace(/\s+/g, '_')}.pdf`,
    timestamp: new Date(),
  });

  await chat.save();
  prescription.chatId = chat._id.toString();
  await prescription.save();

  // Invalidate Redis chat caches
  delCachePattern(`chat:${chat._id}:*`).catch(() => {});
  delCachePattern('chat:list:*').catch(() => {});

  return NextResponse.json({
    success: true,
    prescription,
    chatId: chat._id,
    pdfUrl: finalPdfUrl,
  });
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  let id = searchParams.get('id');

  if (!id) {
    try {
      const body = await req.json();
      id = body?.id;
    } catch {
      // ignore
    }
  }

  if (!id) {
    return NextResponse.json({ error: 'Missing prescription id' }, { status: 400 });
  }

  await connectDB();
  const prescription = await Prescription.findById(id);
  if (!prescription) {
    return NextResponse.json({ error: 'Prescription not found' }, { status: 404 });
  }

  const currentUser = await User.findOne({ clerkId: userId }).select('role').lean();
  const isAdmin = currentUser?.role === 'admin';
  const isDoctor = prescription.doctorId === userId;
  const isPatient = prescription.patientId === userId;

  if (!isAdmin && !isDoctor && !isPatient) {
    return NextResponse.json({ error: 'You are not authorized to delete this prescription' }, { status: 403 });
  }

  // Remove corresponding prescription message from chat if linked
  if (prescription.chatId) {
    try {
      const chat = await Chat.findById(prescription.chatId);
      if (chat && chat.messages) {
        const viewUrl = `/api/prescriptions/view?id=${prescription._id}`;
        chat.messages = chat.messages.filter((msg: any) =>
          !msg.attachmentUrl || (!msg.attachmentUrl.includes(viewUrl) && !msg.attachmentUrl.includes(String(prescription._id)))
        );
        await chat.save();
        delCachePattern(`chat:${chat._id}:*`).catch(() => {});
      }
    } catch (chatErr) {
      console.warn('[Prescription Delete] Failed cleaning chat message:', chatErr);
    }
  }

  await Prescription.findByIdAndDelete(id);

  return NextResponse.json({
    success: true,
    message: 'Prescription deleted successfully',
  });
}
