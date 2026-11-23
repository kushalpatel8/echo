import { jsPDF } from 'jspdf';
import type { PrescriptionMedicine } from '@/types';

export interface GeneratePdfOptions {
  doctorName: string;
  doctorDegree?: string;
  doctorLicense?: string;
  patientName: string;
  medicines: PrescriptionMedicine[];
  notes?: string;
  date?: string;
  refNumber?: string;
}

export function generatePrescriptionPdf({
  doctorName,
  doctorDegree = 'M.D. Healthcare Professional',
  doctorLicense = 'Verified Telehealth Practitioner',
  patientName,
  medicines,
  notes,
  date,
  refNumber,
}: GeneratePdfOptions): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const currentDate = date || new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const currentDateTime = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const rxRef = refNumber || `ECHO-RX-${Date.now().toString(36).toUpperCase()}`;

  // Top decorative color bar (Echo Teal & Indigo)
  doc.setFillColor(13, 148, 136); // #0d9488
  doc.rect(0, 0, 210, 6, 'F');
  doc.setFillColor(99, 102, 241); // #6366f1
  doc.rect(140, 0, 70, 6, 'F');

  // Header: Brand & Clinic details
  doc.setTextColor(15, 118, 110); // Dark Teal
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('E C H O', 18, 20);

  doc.setTextColor(99, 102, 241); // Indigo
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('MENTAL HEALTH & TELEHEALTH CLINIC', 18, 25);

  doc.setTextColor(100, 116, 139); // Slate 500
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Confidential Digital Prescription • Verified Healthcare Consultations', 18, 29.5);

  // Right Header: Prescription Badge & Ref
  doc.setFillColor(241, 245, 249); // Slate 100
  doc.roundedRect(128, 12, 64, 18, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(128, 12, 64, 18, 2, 2, 'S');

  doc.setTextColor(15, 23, 42); // Slate 900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('MEDICAL PRESCRIPTION', 132, 17);

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(`Ref: ${rxRef}`, 132, 22);
  doc.text(`Date: ${currentDate}`, 132, 26);

  // Header separator
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setLineWidth(0.5);
  doc.line(18, 34, 192, 34);

  // Doctor & Patient Info Box
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.roundedRect(18, 38, 174, 30, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(18, 38, 174, 30, 2, 2, 'S');

  // Doctor Column
  doc.setTextColor(15, 118, 110);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('PRESCRIBING DOCTOR', 24, 45);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.text(`Dr. ${doctorName}`, 24, 51);

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`${doctorDegree}`, 24, 56);
  doc.text(`License No: ${doctorLicense}`, 24, 61);

  // Vertical divider between Doctor and Patient
  doc.setDrawColor(226, 232, 240);
  doc.line(105, 42, 105, 64);

  // Patient Column
  doc.setTextColor(99, 102, 241);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('PATIENT INFORMATION', 112, 45);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.text(`${patientName}`, 112, 51);

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Consultation: Echo Telehealth Session', 112, 56);
  doc.text('Record: Verified Patient Consultation', 112, 61);

  // Rx Section Header
  let currentY = 78;
  doc.setTextColor(13, 148, 136);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Rx', 18, currentY);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.text('Prescribed Medications & Regimen', 30, currentY - 2);

  doc.setDrawColor(13, 148, 136);
  doc.setLineWidth(0.7);
  doc.line(30, currentY, 192, currentY);

  currentY += 8;

  // Render Medications
  medicines.forEach((med, index) => {
    // Check page overflow
    if (currentY > 215) {
      doc.addPage();
      currentY = 25;
    }

    // Medicine item background container
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(18, currentY, 174, 19, 1.5, 1.5, 'S');

    // Number circle badge
    doc.setFillColor(13, 148, 136);
    doc.circle(24, currentY + 9.5, 3.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(String(index + 1), 22.8, currentY + 10.8);

    // Medicine Name & Dosage
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(med.name, 31, currentY + 6);

    doc.setTextColor(13, 148, 136);
    doc.setFontSize(8.5);
    doc.text(`[ ${med.dosage} ]`, 31 + doc.getTextWidth(med.name) + 3, currentY + 6);

    // Frequency & Duration
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const scheduleText = `Frequency: ${med.frequency}   •   Duration: ${med.duration}`;
    doc.text(scheduleText, 31, currentY + 11.5);

    // Instructions
    if (med.instructions) {
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.text(`Note: ${med.instructions}`, 31, currentY + 16);
    }

    currentY += 22;
  });

  // Clinical Guidance / Advice Box
  if (notes && notes.trim()) {
    if (currentY > 220) {
      doc.addPage();
      currentY = 25;
    }

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.roundedRect(18, currentY, 174, 24, 1.5, 1.5, 'FD');

    doc.setTextColor(15, 118, 110);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('CLINICAL GUIDANCE & LIFESTYLE ADVICE:', 22, currentY + 6);

    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    const splitNotes = doc.splitTextToSize(notes.trim(), 166);
    doc.text(splitNotes, 22, currentY + 11);

    currentY += 28;
  }

  // Ensure Digital Signature is placed cleanly
  const signY = Math.max(currentY + 5, 232);

  // Verification Shield on left
  doc.setFillColor(240, 253, 250); // Teal 50
  doc.setDrawColor(153, 246, 228); // Teal 200
  doc.roundedRect(18, signY, 82, 30, 2, 2, 'FD');

  doc.setTextColor(15, 118, 110);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('DIGITALLY AUTHENTICATED', 24, signY + 7);

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.text('This prescription was electronically signed', 24, signY + 12);
  doc.text('under Echo Telehealth Medical Standards.', 24, signY + 16);
  doc.text(`Digital ID: ${rxRef}`, 24, signY + 21);
  doc.text(`Signed: ${currentDateTime}`, 24, signY + 25);

  // Doctor Signature on right
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(110, signY, 82, 30, 2, 2, 'FD');

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('Digitally Signed by:', 116, signY + 7);

  // Digital Signature Script Styling
  doc.setTextColor(30, 41, 59); // Slate 800
  doc.setFont('times', 'italic');
  doc.setFontSize(13);
  doc.text(`Dr. ${doctorName}`, 116, signY + 15);

  doc.setDrawColor(13, 148, 136);
  doc.setLineWidth(0.4);
  doc.line(116, signY + 17, 184, signY + 17);

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(`Verified Practitioner • ${doctorDegree}`, 116, signY + 22);
  doc.text(`License No: ${doctorLicense}`, 116, signY + 26);

  // Footer Disclaimer
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(18, 282, 192, 282);

  doc.setTextColor(148, 163, 184); // Slate 400
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text('Echo Healthcare Platform • Electronic Medical Record • Confidential for Patient Use', 18, 286);
  doc.text(`Page 1 of 1 • Generated: ${currentDateTime}`, 155, 286);

  return doc;
}
