import mongoose, { Schema, Document, models, model } from 'mongoose';

import type { IConnectionRequest, ConnectionStatus, WhatsappStatus } from '@/types';
export type { IConnectionRequest, ConnectionStatus, WhatsappStatus };

const ConnectionRequestSchema = new Schema<IConnectionRequest>({
  userId: { type: String, required: true },
  doctorId: { type: String, required: true, index: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  whatsappStatus: { type: String, enum: ['none', 'pending', 'accepted', 'rejected'], default: 'none' },
  userName: { type: String, required: true },
  userImage: { type: String, default: '' },
}, { timestamps: true });

// Ensure a user can only have one active request per doctor
ConnectionRequestSchema.index({ userId: 1, doctorId: 1 }, { unique: true });

if (models.ConnectionRequest) {
  delete models.ConnectionRequest;
}
export default model<IConnectionRequest>('ConnectionRequest', ConnectionRequestSchema);
