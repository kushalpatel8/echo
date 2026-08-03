import mongoose, { Schema, Document, models, model } from 'mongoose';

export type ConnectionStatus = 'pending' | 'accepted' | 'rejected';
export type WhatsappStatus = 'none' | 'pending' | 'accepted' | 'rejected';

export interface IConnectionRequest extends Document {
  userId: string; // sender (patient)
  doctorId: string; // receiver (doctor)
  status: ConnectionStatus;
  whatsappStatus: WhatsappStatus;
  userName: string;
  userImage: string;
  createdAt: Date;
  updatedAt: Date;
}

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
