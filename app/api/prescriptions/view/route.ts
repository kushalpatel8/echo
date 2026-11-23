import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Prescription from '@/lib/models/Prescription';
import Chat from '@/lib/models/Chat';
import User from '@/lib/models/User';
import { generatePrescriptionPdf } from '@/lib/prescriptionPdf';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return new NextResponse('Missing prescription id', { status: 400 });
  }

  await connectDB();
  const prescription = await Prescription.findById(id);
  if (!prescription) {
    return new NextResponse('Prescription not found', { status: 404 });
  }

  const currentUser = await User.findOne({ clerkId: userId }).select('role').lean();
  const isAdmin = currentUser?.role === 'admin';
  const isDoctor = prescription.doctorId === userId;
  const isPatient = prescription.patientId === userId;

  let isChatParticipant = false;
  if (!isDoctor && !isPatient && prescription.chatId) {
    const chat = await Chat.findById(prescription.chatId).select('participants').lean();
    if (chat?.participants?.includes(userId)) {
      isChatParticipant = true;
    }
  }

  if (!isAdmin && !isDoctor && !isPatient && !isChatParticipant) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const isDownload = searchParams.get('download') === '1' || searchParams.get('download') === 'true';
  const disposition = isDownload ? 'attachment' : 'inline';
  const safeName = prescription.patientName ? prescription.patientName.replace(/[^a-zA-Z0-9]/g, '_') : 'Patient';
  const filename = `Echo-Prescription-${safeName}.pdf`;

  let pdfBuffer: Buffer | null = null;

  // 1. Try decoding stored Base64 data (handles both clean base64 and data URI formats)
  if (prescription.pdfData) {
    try {
      const rawData = String(prescription.pdfData).trim();
      const cleanBase64 = rawData.includes('base64,') ? rawData.split('base64,')[1].trim() : rawData;
      const parsedBuf = Buffer.from(cleanBase64, 'base64');
      if (parsedBuf.length > 50 && parsedBuf.subarray(0, 5).toString() === '%PDF-') {
        pdfBuffer = parsedBuf;
      }
    } catch (err) {
      console.warn('[Prescription View] Failed decoding stored pdfData:', err);
    }
  }

  // 2. If stored buffer was invalid or missing, try upstream URL if remote
  if (!pdfBuffer && prescription.pdfUrl && prescription.pdfUrl.startsWith('http')) {
    try {
      const upstream = await fetch(prescription.pdfUrl);
      if (upstream.ok) {
        const arrayBuf = await upstream.arrayBuffer();
        const fetchedBuf = Buffer.from(arrayBuf);
        if (fetchedBuf.length > 50 && fetchedBuf.subarray(0, 5).toString() === '%PDF-') {
          pdfBuffer = fetchedBuf;
        }
      }
    } catch (err) {
      console.warn('[Prescription View] Upstream fetch failed:', err);
    }
  }

  // 3. Fallback: Automatically re-generate the pristine PDF on-the-fly using prescription document
  if (!pdfBuffer) {
    try {
      const doc = generatePrescriptionPdf({
        doctorName: prescription.doctorName || 'Echo Healthcare Professional',
        doctorDegree: prescription.doctorDegree,
        doctorLicense: prescription.doctorLicense,
        patientName: prescription.patientName || 'Patient',
        medicines: prescription.medicines || [],
        notes: prescription.notes,
        date: prescription.createdAt ? new Date(prescription.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : undefined,
        refNumber: `ECHO-RX-${String(prescription._id).slice(-8).toUpperCase()}`,
      });
      pdfBuffer = Buffer.from(doc.output('arraybuffer'));
      // Update cache in database so future requests are instantaneous
      prescription.pdfData = pdfBuffer.toString('base64');
      await prescription.save().catch(() => {});
    } catch (genErr) {
      console.error('[Prescription View] Fallback generation error:', genErr);
    }
  }

  if (pdfBuffer) {
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${disposition}; filename="${filename}"`,
        'Content-Length': String(pdfBuffer.length),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  }

  return new NextResponse('No PDF data available', { status: 404 });
}
