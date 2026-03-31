import mongoose, { Schema, Document, models, model } from 'mongoose';

export type ConnectionStatus = 'pending' | 'accepted' | 'rejected';

export interface IConnectionRequest extends Document {
  userId: string; // sender (patient)
  doctorId: string; // receiver (doctor)
  status: ConnectionStatus;
  userName: string;
  userImage: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConnectionRequestSchema = new Schema<IConnectionRequest>({
  userId: { type: String, required: true },
  doctorId: { type: String, required: true, index: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  userName: { type: String, required: true },
  userImage: { type: String, default: '' },
}, { timestamps: true });

// Ensure a user can only have one active request per doctor
ConnectionRequestSchema.index({ userId: 1, doctorId: 1 }, { unique: true });

export default models.ConnectionRequest || model<IConnectionRequest>('ConnectionRequest', ConnectionRequestSchema);
