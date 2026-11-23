import mongoose, { Schema, Document, models, model } from 'mongoose';

import type { IPrescription, PrescriptionMedicine } from '@/types';
export type { IPrescription, PrescriptionMedicine };

const MedicineSchema = new Schema<PrescriptionMedicine>({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  duration: { type: String, required: true },
  instructions: { type: String },
});

const PrescriptionSchema = new Schema<IPrescription>({
  doctorId: { type: String, required: true },
  doctorName: { type: String, required: true },
  doctorDegree: { type: String },
  doctorLicense: { type: String },
  patientId: { type: String, required: true },
  patientName: { type: String, required: true },
  chatId: { type: String },
  medicines: [MedicineSchema],
  notes: { type: String },
  pdfUrl: { type: String },
  pdfData: { type: String }, // Base64 data fallback
  digitalSignature: { type: String, required: true },
  signedAt: { type: Date, default: Date.now },
}, { timestamps: true });

if (models.Prescription) {
  delete models.Prescription;
}

export default model<IPrescription>('Prescription', PrescriptionSchema);
